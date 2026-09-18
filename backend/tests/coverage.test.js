const {
  checkCoverage,
} = require("../src/services/coverage/checkCoverage");


describe(
  "coverage checker",
  () => {
    test(
      "detects uncovered requirements",
      () => {
        const requirements = [
          {
            id: "r1",
            text: "React",
            kind: "technical",
            priority: "must",
          },
          {
            id: "r2",
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
            prompt:
              "Explain React state.",
            answer_outline:
              "State concepts.",
            difficulty: 1,
          },
        ];

        const result =
          checkCoverage(
            requirements,
            questions
          );

        expect(
          result.uncovered_requirement_ids
        ).toEqual(["r2"]);

        expect(
          result.must_have_uncovered_ids
        ).toEqual(["r2"]);

        expect(
          result.all_covered
        ).toBe(false);
      }
    );


    test(
      "returns complete coverage",
      () => {
        const requirements = [
          {
            id: "r1",
            text: "React",
            kind: "technical",
            priority: "must",
          },
        ];

        const questions = [
          {
            id: "q1",
            requirement_ids: ["r1"],
            category: "technical",
            prompt:
              "Explain React state.",
            answer_outline:
              "State concepts.",
            difficulty: 1,
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
          result.must_haves_covered
        ).toBe(true);

        expect(
          result.all_covered
        ).toBe(true);
      }
    );
  }
);