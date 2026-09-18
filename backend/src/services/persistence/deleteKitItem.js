const Kit = require("../../models/Kit");
const {
  checkCoverage,
} = require("../coverage/checkCoverage");

async function deleteQuestion(
  userId,
  kitId,
  questionId
) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const exists =
    document.kit.questions?.some(
      (question) =>
        question.id === questionId
    );

  if (!exists) {
    const error = new Error(
      "Question not found."
    );
    error.statusCode = 404;
    error.code = "QUESTION_NOT_FOUND";
    throw error;
  }

  document.kit.questions =
    document.kit.questions.filter(
      (question) =>
        question.id !== questionId
    );

  if (document.editorState?.questions) {
    delete document.editorState.questions[
      questionId
    ];
  }

  document.kit.coverage =
    checkCoverage(
      document.kit.role.requirements || [],
      document.kit.questions
    );

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

async function deleteFlashcard(
  userId,
  kitId,
  flashcardId
) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const exists =
    document.kit.flashcards?.some(
      (flashcard) =>
        flashcard.id === flashcardId
    );

  if (!exists) {
    const error = new Error(
      "Flashcard not found."
    );
    error.statusCode = 404;
    error.code =
      "FLASHCARD_NOT_FOUND";
    throw error;
  }

  document.kit.flashcards =
    document.kit.flashcards.filter(
      (flashcard) =>
        flashcard.id !== flashcardId
    );

  if (document.editorState?.flashcards) {
    delete document.editorState.flashcards[
      flashcardId
    ];
  }

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

module.exports = {
  deleteQuestion,
  deleteFlashcard,
};