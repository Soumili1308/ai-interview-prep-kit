const Kit = require("../../models/Kit");
const {
  questionSchema,
  flashcardSchema,
  companyBriefSchema,
} = require("../../schemas/kit.schema");

function findQuestion(kit, questionId) {
  return (kit.questions || []).find(
    (question) =>
      question.id === questionId
  );
}

function findFlashcard(
  kit,
  flashcardId
) {
  return (kit.flashcards || []).find(
    (flashcard) =>
      flashcard.id === flashcardId
  );
}

function validationError(
  message,
  code,
  details
) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = 400;
  error.details = details;
  return error;
}

async function updateQuestion({
  userId,
  kitId,
  questionId,
  changes,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const question =
    findQuestion(
      document.kit,
      questionId
    );

  if (!question) {
    const error = new Error(
      "Question not found."
    );
    error.code =
      "QUESTION_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const result =
    questionSchema.safeParse({
      ...question,
      ...changes,
      id: question.id,
      requirement_ids:
        question.requirement_ids,
    });

  if (!result.success) {
    throw validationError(
      "Updated question is invalid.",
      "INVALID_QUESTION",
      result.error.issues
    );
  }

  document.kit.questions =
    document.kit.questions.map(
      (item) =>
        item.id === questionId
          ? result.data
          : item
    );

  document.editorState = {
    ...(document.editorState || {}),
    questions: {
      ...(document.editorState
        ?.questions || {}),
      [questionId]: {
        ...(document.editorState
          ?.questions?.[questionId] || {}),
        id: questionId,
        status: "edited",
        editedAt: new Date(),
      },
    },
  };

  document.markModified("kit");
  document.markModified("editorState");
  await document.save();

  return document;
}

async function updateFlashcard({
  userId,
  kitId,
  flashcardId,
  changes,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const flashcard =
    findFlashcard(
      document.kit,
      flashcardId
    );

  if (!flashcard) {
    const error = new Error(
      "Flashcard not found."
    );
    error.code =
      "FLASHCARD_NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const result =
    flashcardSchema.safeParse({
      ...flashcard,
      ...changes,
      id: flashcard.id,
      requirement_ids:
        flashcard.requirement_ids,
    });

  if (!result.success) {
    throw validationError(
      "Updated flashcard is invalid.",
      "INVALID_FLASHCARD",
      result.error.issues
    );
  }

  document.kit.flashcards =
    document.kit.flashcards.map(
      (item) =>
        item.id === flashcardId
          ? result.data
          : item
    );

  document.editorState = {
    ...(document.editorState || {}),
    flashcards: {
      ...(document.editorState
        ?.flashcards || {}),
      [flashcardId]: {
        ...(document.editorState
          ?.flashcards?.[
          flashcardId
        ] || {}),
        id: flashcardId,
        status: "edited",
        editedAt: new Date(),
      },
    },
  };

  document.markModified("kit");
  document.markModified("editorState");
  await document.save();

  return document;
}

async function updateCompanyBrief({
  userId,
  kitId,
  changes,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const result =
    companyBriefSchema.safeParse({
      ...document.kit.company_brief,
      ...changes,
    });

  if (!result.success) {
    throw validationError(
      "Updated company brief is invalid.",
      "INVALID_COMPANY_BRIEF",
      result.error.issues
    );
  }

  document.kit.company_brief =
    result.data;

  document.editorState = {
    ...(document.editorState || {}),
    companyBrief: {
      status: "edited",
      editedAt: new Date(),
    },
  };

  document.markModified("kit");
  document.markModified("editorState");
  await document.save();

  return document;
}

module.exports = {
  updateQuestion,
  updateFlashcard,
  updateCompanyBrief,
};
