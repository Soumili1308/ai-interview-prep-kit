const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

/*
 * The evaluator runs from the repository root.
 *
 * buildInitialKit is the SAME pipeline used by the normal
 * application, so the evaluator does not have a separate
 * generation implementation.
 */
const {
  buildInitialKit,
} = require("../backend/src/services/pipeline/buildInitialKit");

const {
  kitSchema,
} = require("../backend/src/schemas/kit.schema");

const DEFAULT_TIMEOUT_MS = 150000; // 2.5 minutes per case
const MAX_BATCH_TIME_MS = 15 * 60 * 1000; // 15 minutes

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];

    if (current === "--input") {
      args.input = argv[i + 1];
      i += 1;
      continue;
    }

    if (current === "--output") {
      args.output = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function fail(message, code = "EVALUATOR_ERROR") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function loadCases(inputPath) {
  if (!inputPath) {
    throw fail(
      "Missing --input argument",
      "MISSING_INPUT"
    );
  }

  const absolutePath = path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(absolutePath)) {
    throw fail(
      `Input file does not exist: ${absolutePath}`,
      "INPUT_NOT_FOUND"
    );
  }

  let parsed;

  try {
    parsed = JSON.parse(
      fs.readFileSync(absolutePath, "utf8")
    );
  } catch (error) {
    throw fail(
      "Input file is not valid JSON",
      "INVALID_INPUT_JSON"
    );
  }

  if (!Array.isArray(parsed)) {
    throw fail(
      "Input must be a JSON array",
      "INVALID_INPUT_FORMAT"
    );
  }

  return parsed;
}

function validateCase(inputCase, index) {
  if (!inputCase || typeof inputCase !== "object") {
    throw fail(
      `Case ${index + 1} must be an object`,
      "INVALID_CASE"
    );
  }

  if (
    typeof inputCase.id !== "string" ||
    !inputCase.id.trim()
  ) {
    throw fail(
      `Case ${index + 1} is missing a valid id`,
      "INVALID_CASE_ID"
    );
  }

  if (
    typeof inputCase.jd !== "string" ||
    !inputCase.jd.trim()
  ) {
    throw fail(
      `Case ${inputCase.id} is missing jd`,
      "INVALID_CASE_JD"
    );
  }

  if (
    typeof inputCase.company_url !== "string" ||
    !inputCase.company_url.trim()
  ) {
    throw fail(
      `Case ${inputCase.id} is missing company_url`,
      "INVALID_CASE_URL"
    );
  }

  if (
    !Number.isInteger(inputCase.days) ||
    inputCase.days < 1 ||
    inputCase.days > 60
  ) {
    throw fail(
      `Case ${inputCase.id} must have days between 1 and 60`,
      "INVALID_CASE_DAYS"
    );
  }

  return {
    id: inputCase.id.trim(),
    jd: inputCase.jd.trim(),
    company_url: inputCase.company_url.trim(),
    days: inputCase.days,
  };
}

function validateDuplicateIds(cases) {
  const seen = new Set();

  for (const currentCase of cases) {
    if (seen.has(currentCase.id)) {
      throw fail(
        `Duplicate case id: ${currentCase.id}`,
        "DUPLICATE_CASE_ID"
      );
    }

    seen.add(currentCase.id);
  }
}

function withTimeout(promise, timeoutMs) {
  let timer;

  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(
        `Case timed out after ${timeoutMs}ms`
      );

      error.code = "CASE_TIMEOUT";

      reject(error);
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise,
  ]).finally(() => {
    clearTimeout(timer);
  });
}

function removeInternalFields(kit) {
  if (!kit || typeof kit !== "object") {
    return kit;
  }

  /*
   * research_context is internal pipeline data.
   * It should not be emitted in the Appendix A result.
   */
  const sanitized = {
    ...kit,
  };

  delete sanitized.research_context;

  return sanitized;
}

function validateGeneratedKit(kit) {
  const sanitized = removeInternalFields(kit);

  const result = kitSchema.safeParse(sanitized);

  if (!result.success) {
    const error = fail(
      "Generated kit failed schema validation",
      "INVALID_GENERATED_KIT"
    );

    error.details = result.error.flatten();

    throw error;
  }

  return result.data;
}

async function evaluateCase(inputCase) {
  const startedAt = performance.now();

  try {
    const normalizedCase = validateCase(
      inputCase,
      0
    );

    /*
     * IMPORTANT:
     *
     * The evaluator allows localhost because the assignment's
     * evaluator cases may intentionally use local company URLs.
     *
     * buildInitialKit receives this through its options object.
     */
    const generatedKit = await withTimeout(
      buildInitialKit({
        jd: normalizedCase.jd,
        companyUrl: normalizedCase.company_url,
        days: normalizedCase.days,
        allowLocalhost: true,
      }),
      DEFAULT_TIMEOUT_MS
    );

    const validatedKit =
      validateGeneratedKit(generatedKit);

    const elapsedMs =
      Math.round(performance.now() - startedAt);

    return {
      id: normalizedCase.id,
      status: "ok",
      kit: validatedKit,
      elapsed_ms: elapsedMs,
    };
  } catch (error) {
    const elapsedMs =
      Math.round(performance.now() - startedAt);

    return {
      id: inputCase?.id || `case-${Date.now()}`,
      status: "failed",
      kit: null,
      error: {
        code: error.code || "CASE_FAILED",
        message:
          error.message ||
          "Unknown case failure",
      },
      elapsed_ms: elapsedMs,
    };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!args.output) {
    throw fail(
      "Missing --output argument",
      "MISSING_OUTPUT"
    );
  }

  const cases = loadCases(args.input);

  const normalizedCases = cases.map(
    (currentCase, index) =>
      validateCase(currentCase, index)
  );

  validateDuplicateIds(normalizedCases);

  const batchStartedAt = performance.now();

  const results = [];

  for (const currentCase of normalizedCases) {
    /*
     * Continue after a case failure.
     *
     * This is required by the assignment.
     */
    const result = await evaluateCase(
      currentCase
    );

    results.push(result);

    const elapsed =
      performance.now() - batchStartedAt;

    /*
     * Do not start another expensive case if the
     * 15-minute batch limit has already been reached.
     */
    if (elapsed >= MAX_BATCH_TIME_MS) {
      const remainingCases =
        normalizedCases.slice(
          results.length
        );

      for (const remainingCase of remainingCases) {
        results.push({
          id: remainingCase.id,
          status: "failed",
          kit: null,
          error: {
            code: "BATCH_TIMEOUT",
            message:
              "Batch exceeded the 15-minute evaluation limit",
          },
        });
      }

      break;
    }
  }

  /*
   * Remove evaluator-only timing information from
   * the required public output.
   */
  const output = {
    version: "1.0",
    generated_at: new Date().toISOString(),
    kits: results.map((result) => ({
  id: result.id,
  status: result.status,
  kit:
    result.status === "ok"
      ? result.kit
      : null,
  error:
    result.status === "ok"
      ? null
      : result.error,
})),
  };

  const outputPath = path.resolve(
    process.cwd(),
    args.output
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log(
    `Evaluation complete: ${outputPath}`
  );

  console.log(
    `Cases: ${results.length}`
  );

  console.log(
    `Successful: ${
      results.filter(
        (result) => result.status === "ok"
      ).length
    }`
  );

  console.log(
    `Failed: ${
      results.filter(
        (result) => result.status === "failed"
      ).length
    }`
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        status: "failed",
        error: {
          code:
            error.code || "EVALUATOR_ERROR",
          message:
            error.message ||
            "Evaluator failed",
        },
      },
      null,
      2
    )
  );

  process.exit(1);
});