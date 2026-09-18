function cleanModelOutput(text) {
  return String(text || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseJson(text) {
  const cleaned =
    cleanModelOutput(text);

  if (!cleaned) {
    const error = new Error(
      "LLM returned an empty response."
    );

    error.code = "INVALID_LLM_JSON";
    error.statusCode = 502;

    throw error;
  }

  try {
    return JSON.parse(cleaned);
  } catch {}

  const objectStart =
    cleaned.indexOf("{");
  const objectEnd =
    cleaned.lastIndexOf("}");

  if (
    objectStart >= 0 &&
    objectEnd > objectStart
  ) {
    try {
      return JSON.parse(
        cleaned.slice(
          objectStart,
          objectEnd + 1
        )
      );
    } catch {}
  }

  const arrayStart =
    cleaned.indexOf("[");
  const arrayEnd =
    cleaned.lastIndexOf("]");

  if (
    arrayStart >= 0 &&
    arrayEnd > arrayStart
  ) {
    try {
      return JSON.parse(
        cleaned.slice(
          arrayStart,
          arrayEnd + 1
        )
      );
    } catch {}
  }

  const error = new Error(
    "LLM returned invalid JSON."
  );

  error.code = "INVALID_LLM_JSON";
  error.statusCode = 502;

  throw error;
}

module.exports = {
  parseJson,
  parseJsonResponse: parseJson,
  cleanModelOutput,
};