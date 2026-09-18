const Kit = require("../../models/Kit");


async function setQuestionPinned({
  userId,
  kitId,
  questionId,
  pinned,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const questionExists =
    document.kit.questions?.some(
      (question) =>
        question.id === questionId
    );

  if (!questionExists) {
    const error = new Error(
      "Question not found."
    );

    error.code =
      "QUESTION_NOT_FOUND";

    error.statusCode = 404;

    throw error;
  }

  const existing =
    document.editorState
      .questions?.[questionId] || {
      id: questionId,
      status: "generated",
    };

  document.editorState.questions[
    questionId
  ] = {
    ...existing,
    id: questionId,
    pinned,
  };

  document.markModified(
    "editorState"
  );

  await document.save();

  return document;
}


async function setFlashcardPinned({
  userId,
  kitId,
  flashcardId,
  pinned,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const flashcardExists =
    document.kit.flashcards?.some(
      (flashcard) =>
        flashcard.id ===
        flashcardId
    );

  if (!flashcardExists) {
    const error = new Error(
      "Flashcard not found."
    );

    error.code =
      "FLASHCARD_NOT_FOUND";

    error.statusCode = 404;

    throw error;
  }

  const existing =
    document.editorState
      .flashcards?.[
        flashcardId
      ] || {
      id: flashcardId,
      status: "generated",
    };

  document.editorState.flashcards[
    flashcardId
  ] = {
    ...existing,
    id: flashcardId,
    pinned,
  };

  document.markModified(
    "editorState"
  );

  await document.save();

  return document;
}


module.exports = {
  setQuestionPinned,
  setFlashcardPinned,
};