function assignNewQuestionIds({
  questions,
  existingQuestions,
}) {
  let highestId = 0;

  for (
    const question
    of existingQuestions
  ) {
    const match =
      /^q(\d+)$/.exec(
        question.id
      );

    if (match) {
      highestId =
        Math.max(
          highestId,
          Number(match[1])
        );
    }
  }

  return questions.map(
    (question, index) => ({
      ...question,
      id: `q${
        highestId + index + 1
      }`,
    })
  );
}


module.exports = {
  assignNewQuestionIds,
};