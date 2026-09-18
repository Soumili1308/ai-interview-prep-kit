const {
  allocateSchedule,
} = require("../src/services/scheduling/allocateSchedule");

const {
  validateSchedule,
} = require("../src/services/scheduling/validateSchedule");

describe("schedule edge cases", () => {
  const requirements = [
    {
      id: "r1",
      text: "Node.js",
      kind: "technical",
      priority: "must",
    },
  ];

  const questions = [
    {
      id: "q1",
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "Explain Node.js.",
      answer_outline:
        "Discuss runtime architecture.",
      difficulty: 3,
    },
  ];

  test("one day gets the entire question bank", () => {
    const schedule =
      allocateSchedule({
        requirements,
        questions,
        daysAvailable: 1,
      });

    expect(
      schedule.days
    ).toHaveLength(1);

    expect(
      schedule.days[0].question_ids
    ).toEqual(["q1"]);
  });

  test("sixty days creates sixty days", () => {
    const schedule =
      allocateSchedule({
        requirements,
        questions,
        daysAvailable: 60,
      });

    expect(
      schedule.days
    ).toHaveLength(60);
  });

  test("empty days remain valid", () => {
    const schedule =
      allocateSchedule({
        requirements,
        questions,
        daysAvailable: 5,
      });

    expect(
      schedule.days
    ).toHaveLength(5);

    const validation =
      validateSchedule({
        schedule,
        requirements,
        questions,
      });

    expect(
      validation.valid
    ).toBe(true);
  });

  test("invalid day count is rejected", () => {
    expect(() =>
      allocateSchedule({
        requirements,
        questions,
        daysAvailable: 0,
      })
    ).toThrow();
  });

  test("more than sixty days is rejected", () => {
    expect(() =>
      allocateSchedule({
        requirements,
        questions,
        daysAvailable: 61,
      })
    ).toThrow();
  });
});