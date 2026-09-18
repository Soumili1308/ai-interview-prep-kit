const {
  parseJson,
} = require("../src/services/llm/parseResponse");

describe("LLM JSON parser", () => {
  test("parses normal JSON", () => {
    expect(
      parseJson(
        '{"questions":[]}'
      )
    ).toEqual({
      questions: [],
    });
  });

  test("parses markdown JSON", () => {
    expect(
      parseJson(
        '```json\n{"questions":[]}\n```'
      )
    ).toEqual({
      questions: [],
    });
  });

  test("extracts JSON surrounded by text", () => {
    expect(
      parseJson(
        'Here is the result: {"questions":[]}'
      )
    ).toEqual({
      questions: [],
    });
  });

  test("throws structured error", () => {
    try {
      parseJson(
        "not valid json"
      );

      throw new Error(
        "Expected parser to throw"
      );
    } catch (error) {
      expect(error.code).toBe(
        "INVALID_LLM_JSON"
      );
      expect(
        error.statusCode
      ).toBe(502);
    }
  });
});