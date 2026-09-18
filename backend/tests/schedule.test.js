const {
  allocateSchedule,
} = require("../src/services/scheduling/allocateSchedule");

const {
  validateSchedule,
} = require("../src/services/scheduling/validateSchedule");

describe("schedule allocation", () => {
  const requirements = [
    {
      id: "r1",
      text: "JavaScript",
      kind: "technical",
      priority: "must",
    },
    {
      id: "r2",
      text: "Communication",
      kind: "behavioural",
      priority: "nice",
    },
  ];

  const questions = [
    {
      id: "q1",
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "Explain closures.",
      answer_outline: "A closure preserves lexical scope.",
      difficulty: 3,
    },
    {
      id: "q2",
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "Explain promises.",
      answer_outline: "Promises represent eventual completion.",
      difficulty: 2,
    },
    {
      id: "q3",
      requirement_ids: ["r2"],
      category: "behavioural",
      prompt: "Tell me about a conflict.",
      answer_outline: "Use STAR.",
      difficulty: 1,
    },
  ];

  test("creates exactly requested number of days", () => {
    const schedule = allocateSchedule({
      requirements,
      questions,
      daysAvailable: 5,
    });

    expect(schedule.days).toHaveLength(5);
    expect(schedule.days_available).toBe(5);
  });

  test("uses integer minutes", () => {
    const schedule = allocateSchedule({
      requirements,
      questions,
      daysAvailable: 3,
    });

    for (const day of schedule.days) {
      expect(Number.isInteger(day.minutes)).toBe(true);
    }
  });

  test("schedules every question", () => {
    const schedule = allocateSchedule({
      requirements,
      questions,
      daysAvailable: 2,
    });

    const ids = schedule.days.flatMap(
      (day) => day.question_ids
    );

    expect(ids.sort()).toEqual(
      questions.map((q) => q.id).sort()
    );
  });

  test("must-have questions are prioritized", () => {
    const schedule = allocateSchedule({
      requirements,
      questions,
      daysAvailable: 2,
    });

    const firstDayQuestions =
      schedule.days[0].question_ids;

    expect(firstDayQuestions).toContain("q1");
  });

  test("generated schedule passes validation", () => {
    const schedule = allocateSchedule({
      requirements,
      questions,
      daysAvailable: 4,
    });

    const result = validateSchedule({
      schedule,
      requirements,
      questions,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});