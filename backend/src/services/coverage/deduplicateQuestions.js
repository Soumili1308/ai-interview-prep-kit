function normalizeQuestionText(
  text
) {
  return String(text || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function deduplicateQuestions(
  questions
) {
  const seen = new Set();

  return questions.filter(
    (question) => {
      const requirementKey = (
        question.requirement_ids || []
      )
        .slice()
        .sort()
        .join(",");

      const key =
        `${requirementKey}|` +
        `${question.category}|` +
        normalizeQuestionText(
          question.prompt
        );

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );
}


module.exports = {
  deduplicateQuestions,
};