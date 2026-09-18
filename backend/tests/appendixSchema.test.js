const {
  kitSchema,
} = require("../src/schemas/kit.schema");

function validKit() {
  return {
    source: {
      company: "Acme",
      company_url:
        "https://example.com",
      role: "Software Engineer",
      location: "",
      jd_chars: 100,
      researched_at:
        new Date().toISOString(),
      pages_used: [],
    },

    company_brief: {
      summary: "A company summary.",
      what_they_do:
        "Builds software products.",
      sources: [],
    },

    role: {
      title: "Software Engineer",
      seniority: "Junior",
      responsibilities: [
        "Build software",
      ],
      requirements: [
        {
          id: "r1",
          text: "JavaScript",
          kind: "technical",
          priority: "must",
        },
      ],
    },

    questions: [
      {
        id: "q1",
        requirement_ids: ["r1"],
        category: "technical",
        prompt:
          "Explain JavaScript closures.",
        answer_outline:
          "Explain lexical scope.",
        difficulty: 2,
      },
    ],

    flashcards: [
      {
        id: "f1",
        front: "What is a closure?",
        back:
          "A function retaining lexical scope.",
        requirement_ids: ["r1"],
      },
    ],

    schedule: {
      days_available: 1,
      days: [
        {
          day: 1,
          focus:
            "Technical interview preparation",
          question_ids: ["q1"],
          minutes: 20,
        },
      ],
    },

    coverage: {
      uncovered_requirement_ids: [],
      passes: 1,
    },
  };
}

describe("Appendix A schema", () => {
  test("accepts a valid kit", () => {
    const result =
      kitSchema.safeParse(
        validKit()
      );

    expect(result.success).toBe(
      true
    );
  });

  test("rejects invalid question difficulty", () => {
    const kit = validKit();

    kit.questions[0].difficulty =
      5;

    const result =
      kitSchema.safeParse(kit);

    expect(result.success).toBe(
      false
    );
  });

  test("rejects invalid requirement kind", () => {
    const kit = validKit();

    kit.role.requirements[0].kind =
      "random";

    const result =
      kitSchema.safeParse(kit);

    expect(result.success).toBe(
      false
    );
  });

  test("rejects invalid requirement priority", () => {
    const kit = validKit();

    kit.role.requirements[0].priority =
      "important";

    const result =
      kitSchema.safeParse(kit);

    expect(result.success).toBe(
      false
    );
  });
});