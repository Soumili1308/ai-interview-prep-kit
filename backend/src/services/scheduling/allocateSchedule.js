function questionScore(
  question,
  requirementMap
) {
  const requirements =
    (question.requirement_ids || [])
      .map((id) =>
        requirementMap.get(id)
      )
      .filter(Boolean);

  const priorityScore =
    requirements.some(
      (requirement) =>
        requirement.priority === "must"
    )
      ? 100
      : 50;

  const difficulty = Number(
    question.difficulty || 1
  );

  return priorityScore +
    difficulty * 10;
}

function questionMinutes(question) {
  const difficulty = Number(
    question.difficulty || 1
  );

  return 10 + difficulty * 5;
}

function buildFocus(dayQuestions) {
  if (!dayQuestions.length) {
    return "Review and prepare";
  }

  const categories = [
    ...new Set(
      dayQuestions.map(
        (question) =>
          question.category
      )
    ),
  ];

  if (categories.length === 1) {
    return `${categories[0]} interview preparation`;
  }

  return "Mixed interview preparation";
}

function allocateSchedule({
  requirements,
  questions,
  daysAvailable,
}) {
  const days = Number(
    daysAvailable
  );

  if (
    !Number.isInteger(days) ||
    days < 1 ||
    days > 60
  ) {
    const error = new Error(
      "daysAvailable must be an integer between 1 and 60."
    );

    error.code = "INVALID_DAYS";
    error.statusCode = 400;
    throw error;
  }

  if (
    !Array.isArray(requirements) ||
    !Array.isArray(questions)
  ) {
    const error = new Error(
      "requirements and questions must be arrays."
    );

    error.code =
      "INVALID_SCHEDULE_INPUT";
    error.statusCode = 400;
    throw error;
  }

  const requirementMap =
    new Map(
      requirements.map(
        (requirement) => [
          requirement.id,
          requirement,
        ]
      )
    );

  const sortedQuestions =
    [...questions].sort((a, b) => {
      const scoreDifference =
        questionScore(
          b,
          requirementMap
        ) -
        questionScore(
          a,
          requirementMap
        );

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return String(a.id).localeCompare(
        String(b.id),
        undefined,
        { numeric: true }
      );
    });

  const buckets = Array.from(
    { length: days },
    (_, index) => ({
      day: index + 1,
      questions: [],
      minutes: 0,
    })
  );

  for (const question of
    sortedQuestions) {
    const target =
      buckets.reduce(
        (best, current) => {
          if (
            current.minutes <
            best.minutes
          ) {
            return current;
          }

          if (
            current.minutes ===
              best.minutes &&
            current.day < best.day
          ) {
            return current;
          }

          return best;
        }
      );

    target.questions.push(question);
    target.minutes +=
      questionMinutes(question);
  }

  return {
    days_available: days,
    days: buckets.map(
      (bucket) => ({
        day: bucket.day,
        focus: buildFocus(
          bucket.questions
        ),
        question_ids:
          bucket.questions.map(
            (question) =>
              question.id
          ),
        minutes: bucket.minutes,
      })
    ),
  };
}

module.exports = {
  allocateSchedule,
  questionMinutes,
};