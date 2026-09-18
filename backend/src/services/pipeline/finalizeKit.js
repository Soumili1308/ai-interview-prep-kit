const {
  checkCoverage,
} = require("../coverage/checkCoverage");
const {
  runCoveragePass,
} = require("../coverage/runCoveragePass");
const {
  allocateSchedule,
} = require("../scheduling/allocateSchedule");
const {
  validateSchedule,
} = require("../scheduling/validateSchedule");
const {
  kitSchema,
} = require("../../schemas/kit.schema");
const {
  generateFlashcards,
} = require("./generateFlashcards");

async function finalizeKit({
  kit,
  daysAvailable,
}) {
  let questions =
    kit.questions || [];

  let coverage =
    checkCoverage(
      kit.role.requirements,
      questions
    );

  let passes = 1;

  if (!coverage.all_covered) {
    const secondPass =
      await runCoveragePass({
        requirements:
          kit.role.requirements,
        questions,
        role: {
          title:
            kit.role.title,
          seniority:
            kit.role.seniority,
        },
        companyBrief:
          kit.company_brief,
        companyResearch:
          kit.research_context || {
            pages: [],
            interviewResearch: {
              available: false,
              results: [],
            },
          },
      });

    questions =
      secondPass.questions;

    coverage =
      secondPass.coverage;

    passes = secondPass.passes;
  }

  if (
    coverage.must_have_uncovered_ids
      .length > 0
  ) {
    const error = new Error(
      "One or more must-have requirements remain uncovered after the second pass."
    );

    error.code =
      "MUST_REQUIREMENT_UNCOVERED";
    error.statusCode = 422;
    error.details = {
      uncoveredRequirementIds:
        coverage.must_have_uncovered_ids,
    };

    throw error;
  }

  const schedule =
    allocateSchedule({
      questions,
      requirements:
        kit.role.requirements,
      daysAvailable,
    });

  const scheduleValidation =
    validateSchedule({
      schedule,
      questions,
      requirements:
        kit.role.requirements,
    });

  if (!scheduleValidation.valid) {
    const error = new Error(
      "Generated schedule failed validation."
    );

    error.code =
      "INVALID_GENERATED_SCHEDULE";
    error.statusCode = 422;
    error.details =
      scheduleValidation.errors;

    throw error;
  }

  const flashcards =
    await generateFlashcards({
      requirements:
        kit.role.requirements,
      questions,
      companyBrief:
        kit.company_brief,
    });

  const finalKit = {
    ...kit,
    questions,
    flashcards,
    schedule,
    coverage: {
      uncovered_requirement_ids:
        coverage.uncovered_requirement_ids,
      passes,
    },
  };

  const validation =
    kitSchema.safeParse(finalKit);

  if (!validation.success) {
    const error = new Error(
      "Final kit failed schema validation."
    );

    error.code =
      "INVALID_FINAL_KIT";
    error.statusCode = 422;
    error.details =
      validation.error.flatten();

    throw error;
  }

  return validation.data;
}

module.exports = {
  finalizeKit,
};