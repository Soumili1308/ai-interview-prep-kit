const Kit = require("../../models/Kit");

async function reorderQuestions({
  userId,
  kitId,
  questionIds,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  const questions =
    document.kit.questions || [];

  const existingIds =
    questions.map(
      (question) => question.id
    );

  if (
    !Array.isArray(questionIds) ||
    questionIds.length !==
      existingIds.length
  ) {
    const error = new Error(
      "Question order must contain every question exactly once."
    );

    error.code =
      "INVALID_QUESTION_ORDER";
    error.statusCode = 400;
    throw error;
  }

  const existingSet = new Set(
    existingIds
  );
  const submittedSet = new Set(
    questionIds
  );

  if (
    submittedSet.size !==
      existingIds.length ||
    submittedSet.size !==
      questionIds.length
  ) {
    const error = new Error(
      "Question order contains duplicates."
    );

    error.code =
      "INVALID_QUESTION_ORDER";
    error.statusCode = 400;
    throw error;
  }

  for (const id of questionIds) {
    if (!existingSet.has(id)) {
      const error = new Error(
        `Unknown question ID: ${id}.`
      );

      error.code =
        "UNKNOWN_QUESTION_ID";
      error.statusCode = 400;
      throw error;
    }
  }

  const questionMap =
    new Map(
      questions.map(
        (question) => [
          question.id,
          question,
        ]
      )
    );

  document.kit.questions =
    questionIds.map((id) =>
      questionMap.get(id)
    );

  document.markModified("kit");

  await document.save();

  return document;
}

module.exports = {
  reorderQuestions,
};