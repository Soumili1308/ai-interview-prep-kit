const {
  kitSchema,
} = require(
  "../src/schemas/kit.schema"
);


describe(
  "kit schema",
  () => {
    test(
      "rejects invalid difficulty",
      () => {
        const result =
          kitSchema.safeParse({
            source: {
              company: "Example",
              company_url:
                "https://example.com",
              role:
                "Developer",
              location: "",
              jd_chars: 100,
              researched_at:
                new Date().toISOString(),
              pages_used: [],
            },

            company_brief: {
              summary:
                "Example summary",
              what_they_do:
                "Example company",
              sources: [],
            },

            role: {
              title:
                "Developer",
              seniority:
                "Junior",
              responsibilities: [],
              requirements: [
                {
                  id: "r1",
                  text: "React",
                  kind: "technical",
                  priority: "must",
                },
              ],
            },

            questions: [
              {
                id: "q1",
                requirement_ids: [
                  "r1",
                ],
                category:
                  "technical",
                prompt:
                  "Explain React.",
                answer_outline:
                  "Discuss React.",
                difficulty: 5,
              },
            ],

            flashcards: [],

            schedule: {
              days_available: 1,
              days: [
                {
                  day: 1,
                  focus:
                    "React",
                  question_ids: [
                    "q1",
                  ],
                  minutes: 30,
                },
              ],
            },

            coverage: {
              uncovered_requirement_ids:
                [],
              passes: 2,
            },
          });

        expect(
          result.success
        ).toBe(false);
      }
    );
  }
);