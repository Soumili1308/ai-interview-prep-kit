const {
  checkCoverage,
} = require("../src/services/coverage/checkCoverage");

describe("coverage edge cases", () => {
  test("detects uncovered must requirement", () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical",
        priority: "must",
      },
    ];

    const questions = [];

    const result =
      checkCoverage(
        requirements,
        questions
      );

    expect(
      result.uncovered_requirement_ids
    ).toEqual(["r1"]);

    expect(
      result.uncovered_must_have_ids
    ).toEqual(["r1"]);
  });

  test("nice-to-have gaps do not become must-have gaps", () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical",
        priority: "nice",
      },
    ];

    const questions = [];

    const result =
      checkCoverage(
        requirements,
        questions
      );

    expect(
      result.uncovered_requirement_ids
    ).toEqual(["r1"]);

    expect(
      result.uncovered_must_have_ids
    ).toEqual([]);
  });

  test("question can cover multiple requirements", () => {
    const requirements = [
      {
        id: "r1",
        text: "React",
        kind: "technical",
        priority: "must",
      },
      {
        id: "r2",
        text: "JavaScript",
        kind: "technical",
        priority: "must",
      },
    ];

    const questions = [
      {
        id: "q1",
        requirement_ids: [
          "r1",
          "r2",
        ],
        category: "technical",
        prompt:
          "Build a React application using JavaScript.",
        answer_outline:
          "Discuss both technologies.",
        difficulty: 3,
      },
    ];

    const result =
      checkCoverage(
        requirements,
        questions
      );

    expect(
      result.uncovered_requirement_ids
    ).toEqual([]);

    expect(
      result.uncovered_must_have_ids
    ).toEqual([]);
  });
});