const {
  checkCoverage,
} = require("./checkCoverage");
const {
  deduplicateQuestions,
} = require("./deduplicateQuestions");
const {
  generateQuestionsForRequirement,
} = require("../pipeline/generateQuestions");

async function runCoveragePass({
  requirements,
  questions,
  role,
  companyBrief,
  companyResearch,
}) {
  let current =
    deduplicateQuestions(
      questions || []
    );

  const first = checkCoverage(
    requirements,
    current
  );

  if (first.all_covered) {
    return {
      questions: current,
      coverage: first,
      passes: 1,
    };
  }

  for (const requirementId of
    first.uncovered_requirement_ids) {
    const requirement =
      requirements.find(
        (item) =>
          item.id === requirementId
      );

    if (!requirement) {
      continue;
    }

    const generated =
      await generateQuestionsForRequirement({
        requirement,
        role,
        companyBrief,
        companyResearch,
      });

    current.push(...generated);
  }

  current =
    deduplicateQuestions(
      current
    ).map((question, index) => ({
      ...question,
      id: `q${index + 1}`,
    }));

  const finalCoverage =
    checkCoverage(
      requirements,
      current
    );

  return {
    questions: current,
    coverage: finalCoverage,
    passes: 2,
  };
}

module.exports = {
  runCoveragePass,
};