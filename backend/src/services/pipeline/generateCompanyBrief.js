// backend/src/services/pipeline/generateCompanyBrief.js

const {
  generateText,
} = require("../llm/client");

const {
  parseJson,
} = require("../llm/parseResponse");

const {
  buildCompanyBriefPrompt,
} = require("../llm/prompts");

const {
  companyBriefSchema,
} = require("../../schemas/kit.schema");

function normalizeSources(sources) {
  if (!Array.isArray(sources)) {
    return [];
  }

  return [
    ...new Set(
      sources
        .map((source) => {
          if (typeof source === "string") {
            return source.trim();
          }

          if (
            source &&
            typeof source === "object"
          ) {
            return String(
              source.url || ""
            ).trim();
          }

          return "";
        })
        .filter((url) => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        })
    ),
  ];
}

function normalizeCompanyBrief(
  data,
  pages = []
) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    return null;
  }

  // Normal expected format.
  let source = data;

  // Defensive support for:
  // { company_brief: { ... } }
  if (
    data.company_brief &&
    typeof data.company_brief === "object"
  ) {
    source = data.company_brief;
  }

  let summary = String(
    source.summary || ""
  ).trim();

  let whatTheyDo = String(
    source.what_they_do ||
      source.whatTheyDo ||
      ""
  ).trim();

  // If an older response returned hiring_process,
  // incorporate it into summary instead of creating
  // an unsupported schema field.
  if (
    !summary &&
    Array.isArray(
      source.hiring_process
    ) &&
    source.hiring_process.length
  ) {
    summary =
      "Available hiring-process information: " +
      source.hiring_process
        .map((item) =>
          String(item).trim()
        )
        .filter(Boolean)
        .join("; ");
  }

  if (
    summary &&
    Array.isArray(
      source.hiring_process
    ) &&
    source.hiring_process.length &&
    !summary
      .toLowerCase()
      .includes("hiring")
  ) {
    summary +=
      " Hiring-process information: " +
      source.hiring_process
        .map((item) =>
          String(item).trim()
        )
        .filter(Boolean)
        .join("; ") +
      ".";
  }

  let sources =
    normalizeSources(
      source.sources
    );

  // Only use URLs actually present in retrieved pages.
  const allowedUrls =
    new Set(
      (Array.isArray(pages)
        ? pages
        : []
      )
        .map((page) =>
          String(
            page?.url || ""
          ).trim()
        )
        .filter(Boolean)
    );

  sources = sources.filter(
    (url) => allowedUrls.has(url)
  );

  return {
    summary,
    what_they_do: whatTheyDo,
    sources,
  };
}

async function generateCompanyBrief({
  companyName,
  companyUrl,
  pages = [],
  interviewResearch,
}) {
  const prompt =
    buildCompanyBriefPrompt({
      companyName,
      companyUrl,
      pages,
      interviewResearch,
    });

  const raw =
    await generateText({
      systemInstruction:
        "Generate a concise factual company brief using only supplied research. Return exactly the requested JSON structure. Never invent unsupported facts.",
      prompt,
      temperature: 0.1,
      maxTokens: 400,
    });

  let parsed;

  try {
    parsed = parseJson(raw);
  } catch (error) {
    const wrapped =
      new Error(
        "Generated company brief returned invalid JSON."
      );

    wrapped.code =
      "INVALID_COMPANY_BRIEF_JSON";

    wrapped.statusCode = 502;

    wrapped.details = {
      responsePreview:
        String(raw || "").slice(
          0,
          500
        ),
      originalError:
        error.message,
    };

    throw wrapped;
  }

  const normalized =
    normalizeCompanyBrief(
      parsed,
      pages
    );

  if (!normalized) {
    const error =
      new Error(
        "Generated company brief was empty."
      );

    error.statusCode = 502;
    error.code =
      "INVALID_COMPANY_BRIEF";

    throw error;
  }

  const result =
    companyBriefSchema.safeParse(
      normalized
    );

  if (!result.success) {
    const error =
      new Error(
        "Generated company brief failed validation."
      );

    error.statusCode = 502;
    error.code =
      "INVALID_COMPANY_BRIEF";

    error.details =
      result.error.issues;

    error.received = {
      summary:
        normalized.summary,
      what_they_do:
        normalized.what_they_do,
      sources:
        normalized.sources,
    };

    throw error;
  }

  return result.data;
}

module.exports = {
  generateCompanyBrief,
  normalizeCompanyBrief,
};