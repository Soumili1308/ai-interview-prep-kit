function mergeRegeneratedQuestions({
  existingQuestions,
  regeneratedQuestions,
  editorState,
  category,
}) {
  const result = [];

  for (const question of
    existingQuestions || []) {
    if (question.category !== category) {
      result.push(question);
      continue;
    }

    const state =
      editorState?.[question.id];

    if (
      state?.status === "edited" ||
      state?.pinned === true
    ) {
      result.push(question);
    }
  }

  result.push(
    ...(regeneratedQuestions || [])
  );

  return result;
}

module.exports = {
  mergeRegeneratedQuestions,
};
