function getCoverageGaps(
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

  return requirements.filter(
    (requirement) =>
      !coveredIds.has(
        requirement.id
      )
  );
}


module.exports = {
  getCoverageGaps,
};