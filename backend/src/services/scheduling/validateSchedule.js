function validateSchedule({
  schedule,
  requirements,
  questions,
}) {
  const errors = [];

  if (!schedule) {
    return {
      valid: false,
      errors: ["Schedule is missing."],
    };
  }

  if (
    !Number.isInteger(
      schedule.days_available
    ) ||
    schedule.days_available < 1 ||
    schedule.days_available > 60
  ) {
    errors.push(
      "days_available must be an integer between 1 and 60."
    );
  }

  if (
    !Array.isArray(schedule.days) ||
    schedule.days.length !==
      schedule.days_available
  ) {
    errors.push(
      `Schedule must contain exactly ${schedule.days_available} days.`
    );
  }

  const questionIds = new Set(
    (questions || []).map(
      (question) => question.id
    )
  );
  const scheduledQuestionIds = [];
  const scheduledSet = new Set();

  for (const day of
    schedule.days || []) {
    if (!Number.isInteger(day.day)) {
      errors.push(
        "Each day must have an integer day number."
      );
    }

    if (
      !Number.isInteger(day.minutes) ||
      day.minutes < 0
    ) {
      errors.push(
        `Day ${day.day} minutes must be a non-negative integer.`
      );
    }

    if (
      !Array.isArray(day.question_ids)
    ) {
      errors.push(
        `Day ${day.day} question_ids must be an array.`
      );
      continue;
    }

    for (const questionId of
      day.question_ids) {
      if (!questionIds.has(questionId)) {
        errors.push(
          `Day ${day.day} references unknown question ${questionId}.`
        );
      }

      if (scheduledSet.has(questionId)) {
        errors.push(
          `Question ${questionId} is scheduled more than once.`
        );
      }

      scheduledSet.add(questionId);
      scheduledQuestionIds.push(
        questionId
      );
    }
  }

  if (
    scheduledSet.size !==
    questionIds.size
  ) {
    errors.push(
      "Every question must appear in the schedule exactly once."
    );
  }

  const scheduledQuestions =
    (questions || []).filter(
      (question) =>
        scheduledSet.has(question.id)
    );

  const coveredRequirements =
    new Set();

  for (const question of
    scheduledQuestions) {
    for (const requirementId of
      question.requirement_ids || []) {
      coveredRequirements.add(
        requirementId
      );
    }
  }

  for (const requirement of
    requirements || []) {
    if (
      requirement.priority === "must" &&
      !coveredRequirements.has(
        requirement.id
      )
    ) {
      errors.push(
        `Must-have requirement ${requirement.id} is not scheduled.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateSchedule,
};