function checkCoverage(
  requirements,
  questions
) {
  const coveredIds = new Set();

  for (const question of questions || []) {
    for (
      const requirementId
      of question.requirement_ids || []
    ) {
      coveredIds.add(
        requirementId
      );
    }
  }

  const uncoveredRequirementIds =
    requirements
      .filter(
        (requirement) =>
          !coveredIds.has(
            requirement.id
          )
      )
      .map(
        (requirement) =>
          requirement.id
      );

  const mustHaveUncovered =
    requirements
      .filter(
        (requirement) =>
          requirement.priority ===
            "must" &&
          uncoveredRequirementIds.includes(
            requirement.id
          )
      )
      .map(
        (requirement) =>
          requirement.id
      );

  return {
    uncovered_requirement_ids:
      uncoveredRequirementIds,

    must_have_uncovered_ids:
      mustHaveUncovered,

    uncovered_must_have_ids:
      mustHaveUncovered,

    all_covered:
      uncoveredRequirementIds
        .length === 0,

    must_haves_covered:
      mustHaveUncovered.length === 0,
  };
}


module.exports = {
  checkCoverage,
};