const Kit = require("../../models/Kit");

async function getPracticeData(userId, kitId) {
  const document = await Kit.findOne({
    _id: kitId,
    userId,
  });

  if (!document) {
    const error = new Error("Kit not found");
    error.statusCode = 404;
    error.code = "KIT_NOT_FOUND";
    throw error;
  }

  const flashcards = document.kit.flashcards || [];

  const practiceState =
    document.practiceState || {
      flashcards: {},
      lastSessionAt: null,
    };

  const state = practiceState.flashcards || {};

  const cards = flashcards.map((card) => {
    const cardState = state[card.id] || {};

    return {
      ...card,
      confidence:
        cardState.confidence ?? null,
      attempts:
        cardState.attempts ?? 0,
      lastReviewedAt:
        cardState.lastReviewedAt ?? null,
      covered:
        (cardState.attempts || 0) > 0,
    };
  });

  cards.sort((a, b) => {
    // Never reviewed cards come first.
    if (
      a.confidence === null &&
      b.confidence !== null
    ) {
      return -1;
    }

    if (
      a.confidence !== null &&
      b.confidence === null
    ) {
      return 1;
    }

    // Lower confidence comes first.
    if (a.confidence !== b.confidence) {
      return (
        (a.confidence ?? 0) -
        (b.confidence ?? 0)
      );
    }

    // If confidence is equal, least-practiced first.
    return a.attempts - b.attempts;
  });

  return {
    flashcards: cards,
    total: cards.length,
    covered: cards.filter((card) => card.covered)
      .length,
    uncovered: cards.filter(
      (card) => !card.covered
    ).length,
  };
}

async function recordConfidence(
  userId,
  kitId,
  flashcardId,
  confidence
) {
  const document = await Kit.findOne({
    _id: kitId,
    userId,
  });

  if (!document) {
    const error = new Error("Kit not found");
    error.statusCode = 404;
    error.code = "KIT_NOT_FOUND";
    throw error;
  }

  const exists = (
    document.kit.flashcards || []
  ).some(
    (card) => card.id === flashcardId
  );

  if (!exists) {
    const error = new Error(
      "Flashcard not found"
    );

    error.statusCode = 404;
    error.code = "FLASHCARD_NOT_FOUND";

    throw error;
  }

  if (!document.practiceState) {
    document.practiceState = {
      flashcards: {},
      lastSessionAt: null,
    };
  }

  if (!document.practiceState.flashcards) {
    document.practiceState.flashcards = {};
  }

  const previous =
    document.practiceState.flashcards[
      flashcardId
    ] || {};

  document.practiceState.flashcards[
    flashcardId
  ] = {
    confidence,
    attempts:
      (previous.attempts || 0) + 1,
    lastReviewedAt: new Date(),
  };

  document.practiceState.lastSessionAt =
    new Date();

  document.markModified("practiceState");

  await document.save();

  return getPracticeData(
    userId,
    kitId
  );
}

module.exports = {
  getPracticeData,
  recordConfidence,
};