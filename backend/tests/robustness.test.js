const {
  isThinJobDescription,
} = require("../src/services/pipeline/extractRequirements");

const {
  validateUrl,
} = require("../src/utils/urlValidator");

const {
  parseJson,
} = require("../src/services/llm/parseResponse");

const {
  allocateSchedule,
} = require("../src/services/scheduling/allocateSchedule");

describe("robustness", () => {
  test("detects a thin JD", () => {
    expect(
      isThinJobDescription(
        "Software engineer wanted."
      )
    ).toBe(true);
  });

  test("does not classify a detailed JD as thin", () => {
    const jd = `
      We are looking for a software engineer
      with experience building production web
      applications. You will work with React,
      Node.js and MongoDB, design APIs, write
      automated tests, review code, collaborate
      with product and participate in technical
      interviews. Experience with cloud services
      and system design is preferred.
    `;

    expect(
      isThinJobDescription(jd)
    ).toBe(false);
  });

  test("rejects malformed URLs", async () => {
    await expect(
      validateUrl("not-a-url")
    ).rejects.toMatchObject({
      code: "INVALID_URL",
    });
  });

  test("rejects unsupported protocols", async () => {
    await expect(
      validateUrl("ftp://example.com")
    ).rejects.toMatchObject({
      code: "INVALID_URL",
    });
  });

  test("allows localhost when explicitly enabled", async () => {
    const url =
      await validateUrl(
        "http://localhost:8099/acme/",
        {
          allowLocalhost: true,
        }
      );

    expect(url.hostname).toBe(
      "localhost"
    );
  });

  test("rejects localhost normally", async () => {
    await expect(
      validateUrl(
        "http://localhost:8099"
      )
    ).rejects.toMatchObject({
      code: "PRIVATE_URL_BLOCKED",
    });
  });

  test("parses fenced JSON", () => {
    const result = parseJson(`
      \`\`\`json
      {"questions":[]}
      \`\`\`
    `);

    expect(result).toEqual({
      questions: [],
    });
  });

  test("rejects invalid JSON", () => {
    expect(() =>
      parseJson(
        "this is not json"
      )
    ).toThrow(
      "LLM returned invalid JSON"
    );
  });

  test("supports a one-day schedule", () => {
    const schedule =
      allocateSchedule({
        requirements: [],
        questions: [],
        daysAvailable: 1,
      });

    expect(
      schedule.days
    ).toHaveLength(1);
  });

  test("supports a sixty-day schedule", () => {
    const schedule =
      allocateSchedule({
        requirements: [],
        questions: [],
        daysAvailable: 60,
      });

    expect(
      schedule.days
    ).toHaveLength(60);
  });

  test("rejects more than sixty days", () => {
    expect(() =>
      allocateSchedule({
        requirements: [],
        questions: [],
        daysAvailable: 61,
      })
    ).toThrow(
      "daysAvailable must be an integer between 1 and 60"
    );
  });
});