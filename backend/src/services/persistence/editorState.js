function createQuestionState(
  question,
  {
    status = "generated",
    pinned = false,
  } = {}
) {
  return {
    id: question.id,
    status,
    pinned,
    editedAt: null,
  };
}


function createFlashcardState(
  flashcard,
  {
    status = "generated",
    pinned = false,
  } = {}
) {
  return {
    id: flashcard.id,
    status,
    pinned,
    editedAt: null,
  };
}


function createInitialEditorState(
  kit
) {
  const questions = {};

  for (
    const question
    of kit.questions || []
  ) {
    questions[question.id] =
      createQuestionState(
        question
      );
  }

  const flashcards = {};

  for (
    const flashcard
    of kit.flashcards || []
  ) {
    flashcards[flashcard.id] =
      createFlashcardState(
        flashcard
      );
  }

  return {
    questions,

    flashcards,

    companyBrief: {
      status: "generated",
    },

    schedule: {
      status: "generated",
    },
  };
}


module.exports = {
  createQuestionState,
  createFlashcardState,
  createInitialEditorState,
};