const Kit = require("../../models/Kit");
const {
  questionSchema,
  flashcardSchema,
} = require("../../schemas/kit.schema");
const {
  checkCoverage,
} = require("../coverage/checkCoverage");

function nextNumericId(items, prefix) {
  const numbers = items
    .map((item) =>
      Number(
        String(item.id || "")
          .replace(prefix, "")
      )
    )
    .filter(Number.isFinite);

  return numbers.length
    ? Math.max(...numbers) + 1
    : 1;
}

async function addQuestion(
  userId,
  kitId,
  question
) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    const error = new Error(
      "Kit not found."
    );
    error.statusCode = 404;
    error.code = "KIT_NOT_FOUND";
    throw error;
  }

  const item = {
    id: `q${nextNumericId(
      document.kit.questions || [],
      "q"
    )}`,
    requirement_ids:
      Array.isArray(
        question.requirement_ids
      )
        ? question.requirement_ids
        : [],
    category:
      question.category ||
      "technical",
    prompt: String(
      question.prompt || ""
    ).trim(),
    answer_outline: String(
      question.answer_outline || ""
    ).trim(),
    difficulty:
      Number(question.difficulty || 1),
  };

  const validation =
    questionSchema.safeParse(item);

  if (!validation.success) {
    const error = new Error(
      "Invalid question."
    );
    error.statusCode = 400;
    error.code = "INVALID_QUESTION";
    error.details =
      validation.error.issues;
    throw error;
  }

  document.kit.questions.push(
    validation.data
  );
  document.kit.coverage =
    checkCoverage(
      document.kit.role.requirements || [],
      document.kit.questions
    );
  document.editorState = {
    ...(document.editorState || {}),
    questions: {
      ...(document.editorState
        ?.questions || {}),
      [item.id]: {
        id: item.id,
        status: "edited",
        pinned: true,
        editedAt: new Date(),
      },
    },
  };

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

async function addFlashcard(
  userId,
  kitId,
  flashcard
) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    const error = new Error(
      "Kit not found."
    );
    error.statusCode = 404;
    error.code = "KIT_NOT_FOUND";
    throw error;
  }

  const item = {
    id: `f${nextNumericId(
      document.kit.flashcards || [],
      "f"
    )}`,
    front: String(
      flashcard.front || ""
    ).trim(),
    back: String(
      flashcard.back || ""
    ).trim(),
    requirement_ids:
      Array.isArray(
        flashcard.requirement_ids
      )
        ? flashcard.requirement_ids
        : document.kit.role.requirements?.[0]
            ? [
                document.kit.role
                  .requirements[0].id,
              ]
            : [],
  };

  const validation =
    flashcardSchema.safeParse(item);

  if (!validation.success) {
    const error = new Error(
      "Invalid flashcard."
    );
    error.statusCode = 400;
    error.code = "INVALID_FLASHCARD";
    error.details =
      validation.error.issues;
    throw error;
  }

  document.kit.flashcards.push(
    validation.data
  );
  document.editorState = {
    ...(document.editorState || {}),
    flashcards: {
      ...(document.editorState
        ?.flashcards || {}),
      [item.id]: {
        id: item.id,
        status: "edited",
        pinned: true,
        editedAt: new Date(),
      },
    },
  };

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

module.exports = {
  addQuestion,
  addFlashcard,
};