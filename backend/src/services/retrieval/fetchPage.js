const axios = require("axios");

const {
  validateUrl,
} = require("../../utils/urlValidator");
const {
  withRetry,
} = require("../../utils/retry");
const {
  limitExternal,
} = require("../../utils/rateLimiter");
const {
  cleanHtml,
} = require("../../utils/textCleaner");

const MAX_CONTENT_LENGTH =
  2 * 1024 * 1024;

function classifyFetchError(error) {
  const status =
    error?.response?.status;

  if (status === 404) {
    return {
      code: "COMPANY_PAGE_404",
      message: "Page returned 404.",
    };
  }

  if (
    status === 401 ||
    status === 403
  ) {
    return {
      code: "COMPANY_PAGE_FORBIDDEN",
      message:
        "Page could not be accessed.",
    };
  }

  if (status === 429) {
    return {
      code: "COMPANY_RATE_LIMITED",
      message:
        "Page rate-limited the crawler.",
    };
  }

  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT" ||
    /timeout/i.test(
      error?.message || ""
    )
  ) {
    return {
      code: "COMPANY_TIMEOUT",
      message: "Page request timed out.",
    };
  }

  if (
    error?.code === "ENOTFOUND" ||
    error?.code === "EAI_AGAIN"
  ) {
    return {
      code: "COMPANY_UNREACHABLE",
      message:
        "Company site could not be reached.",
    };
  }

  return {
    code:
      error?.code || "FETCH_FAILED",
    message:
      error?.message ||
      "Page could not be retrieved.",
  };
}

async function fetchPage(
  url,
  { allowLocalhost = false } = {}
) {
  let validatedUrl;

  try {
    validatedUrl = await validateUrl(
      url,
      { allowLocalhost }
    );
  } catch (error) {
    return {
      url,
      text: "",
      skipped: true,
      reason:
        error.code || "INVALID_URL",
      message: error.message,
    };
  }

  try {
    const result =
      await limitExternal(() =>
        withRetry(
          async () => {
            const response =
              await axios.get(
                validatedUrl.href,
                {
                  timeout: 10000,
                  maxContentLength:
                    MAX_CONTENT_LENGTH,
                  maxBodyLength:
                    MAX_CONTENT_LENGTH,
                  responseType: "text",
                  validateStatus:
                    (status) =>
                      status >= 200 &&
                      status < 300,
                  headers: {
                    "User-Agent":
                      "AI-Interview-Prep-Kit/1.0",
                    Accept:
                      "text/html,application/xhtml+xml",
                  },
                }
              );

            const contentType =
              response.headers[
                "content-type"
              ] || "";

            if (
              !contentType.includes(
                "text/html"
              ) &&
              !contentType.includes(
                "application/xhtml+xml"
              )
            ) {
              const error = new Error(
                "Non-HTML content skipped."
              );

              error.code = "NON_HTML";
              throw error;
            }

            return {
              url: validatedUrl.href,
              text: cleanHtml(
                response.data
              ),
              rawHtml: String(
                response.data || ""
              ),
              status: response.status,
            };
          },
          {
            retries: 2,
            shouldRetry: (error) => {
              const status =
                error?.response?.status;

              return (
                status === 429 ||
                status === 500 ||
                status === 502 ||
                status === 503 ||
                status === 504 ||
                error?.code ===
                  "ECONNABORTED" ||
                error?.code ===
                  "ETIMEDOUT" ||
                error?.code ===
                  "ECONNRESET"
              );
            },
          }
        )
      );

    return {
      ...result,
      skipped: false,
    };
  } catch (error) {
    const classified =
      classifyFetchError(error);

    return {
      url: validatedUrl.href,
      text: "",
      skipped: true,
      reason: classified.code,
      message: classified.message,
    };
  }
}

module.exports = {
  fetchPage,
  classifyFetchError,
};