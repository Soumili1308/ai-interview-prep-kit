const Kit = require("../../models/Kit");
const {
  generateQuestionsForRequirement,
} = require("../pipeline/generateQuestions");
const {
  assignNewQuestionIds,
} = require("./assignNewQuestionIds");
const {
  deduplicateQuestions,
} = require("../coverage/deduplicateQuestions");
const {
  checkCoverage,
} = require("../coverage/checkCoverage");
const {
  allocateSchedule,
} = require("../scheduling/allocateSchedule");
const {
  validateSchedule,
} = require("../scheduling/validateSchedule");

const VALID_CATEGORIES = [
  "technical",
  "behavioural",
  "system-design",
  "company-fit",
];

function requirementMatchesCategory(
  requirement,
  category
) {
  if (
    category === "behavioural"
  ) {
    return (
      requirement.kind ===
      "behavioural"
    );
  }

  if (
    category === "company-fit"
  ) {
    return (
      requirement.kind ===
        "domain" ||
      requirement.kind ===
        "behavioural"
    );
  }

  return (
    requirement.kind ===
    "technical"
  );
}

async function regenerateQuestionCategory({
  userId,
  kitId,
  category,
}) {
  if (!VALID_CATEGORIES.includes(category)) {
    const error = new Error(
      "Invalid question category."
    );
    error.code = "INVALID_CATEGORY";
    error.statusCode = 400;
    throw error;
  }

  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const kit = document.kit;
  const requirements =
    kit.role?.requirements || [];

  const requirementsForCategory =
    requirements.filter(
      (requirement) =>
        requirementMatchesCategory(
          requirement,
          category
        )
    );

  const generated = [];

  for (const requirement of
    requirementsForCategory) {
    const questions =
      await generateQuestionsForRequirement({
        requirement,
        role: {
          title: kit.role.title,
          seniority:
            kit.role.seniority,
        },
        companyBrief:
          kit.company_brief,
        companyResearch:
          document.researchContext || {
            pages: [],
            interviewResearch: {
              available: false,
              results: [],
            },
          },
      });

    generated.push(
      ...questions.filter(
        (question) =>
          question.category ===
          category
      )
    );
  }

  const existingQuestions =
    kit.questions || [];

  const preservedCategory =
    existingQuestions.filter(
      (question) => {
        if (
          question.category !==
          category
        ) {
          return false;
        }

        const state =
          document.editorState
            ?.questions?.[
            question.id
          ];

        return (
          state?.status === "edited" ||
          state?.pinned === true
        );
      }
    );

  const preservedOutsideCategory =
    existingQuestions.filter(
      (question) =>
        question.category !==
        category
    );

  const newQuestions =
    assignNewQuestionIds({
      questions:
        deduplicateQuestions(
          generated
        ),
      existingQuestions,
    });

  const finalQuestions = [
    ...preservedOutsideCategory,
    ...preservedCategory,
    ...newQuestions,
  ];

  const coverage =
    checkCoverage(
      requirements,
      finalQuestions
    );

  const schedule =
    allocateSchedule({
      requirements,
      questions: finalQuestions,
      daysAvailable:
        document.kit.schedule
          ?.days_available || 1,
    });

  const scheduleValidation =
    validateSchedule({
      schedule,
      requirements,
      questions: finalQuestions,
    });

  if (!scheduleValidation.valid) {
    const error = new Error(
      "Regenerated questions produced an invalid schedule."
    );
    error.code =
      "INVALID_REGENERATED_SCHEDULE";
    error.statusCode = 422;
    error.details =
      scheduleValidation.errors;
    throw error;
  }

  document.kit.questions =
    finalQuestions;
  document.kit.coverage = {
    uncovered_requirement_ids:
      coverage.uncovered_requirement_ids,
    passes:
      document.kit.coverage?.passes ||
      2,
  };

  document.kit.schedule =
    schedule;

  document.editorState = {
    ...(document.editorState || {}),
    questions: {
      ...(document.editorState
        ?.questions || {}),
    },
  };

  for (const question of
    newQuestions) {
    document.editorState.questions[
      question.id
    ] = {
      id: question.id,
      status: "generated",
      pinned: false,
      editedAt: null,
    };
  }

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

module.exports = {
  regenerateQuestionCategory,
};