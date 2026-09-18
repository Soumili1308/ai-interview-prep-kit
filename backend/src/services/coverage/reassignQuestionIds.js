function reassignQuestionIds(
  questions
) {
  return questions.map(
    (question, index) => ({
      ...question,
      id: `q${index + 1}`,
    })
  );
}


module.exports = {
  reassignQuestionIds,
};