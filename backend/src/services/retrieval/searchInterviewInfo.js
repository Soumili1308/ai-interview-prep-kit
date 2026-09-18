const axios = require("axios");

const {
  searchProviderUrl,
  searchProviderApiKey,
} = require("../../config/env");

const {
  withRetry,
} = require("../../utils/retry");

const {
  limitExternal,
} = require("../../utils/rateLimiter");

async function searchInterviewInfo(company) {
  if (!company) {
    return {
      available: false,
      reason: "COMPANY_NAME_UNAVAILABLE",
      results: [],
    };
  }

  if (!searchProviderUrl) {
    return {
      available: false,
      reason:
        "PUBLIC_SEARCH_PROVIDER_NOT_CONFIGURED",
      results: [],
    };
  }

  try {
    const response =
      await limitExternal(() =>
        withRetry(
          () =>
            axios.get(
              searchProviderUrl,
              {
                params: {
                  q:
                    `${company} ` +
                    `interview process hiring interview`,
                },
                headers:
                  searchProviderApiKey
                    ? {
                        Authorization:
                          `Bearer ${searchProviderApiKey}`,
                      }
                    : {},
                timeout: 8000,
              }
            ),
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
                /timeout/i.test(
                  error?.message || ""
                )
              );
            },
          }
        )
      );

    const results =
      Array.isArray(
        response.data?.results
      )
        ? response.data.results
            .slice(0, 5)
            .map((item) => ({
              title:
                String(item.title || ""),
              url:
                String(item.url || ""),
              snippet:
                String(
                  item.snippet || ""
                ),
            }))
            .filter(
              (item) =>
                item.url ||
                item.title ||
                item.snippet
            )
        : [];

    if (!results.length) {
      return {
        available: true,
        reason: "NO_PUBLIC_DISCUSSION_FOUND",
        results: [],
      };
    }

    return {
      available: true,
      reason: null,
      results,
    };
  } catch (error) {
    return {
      available: false,
      reason:
        error.code ||
        "PUBLIC_SEARCH_FAILED",
      results: [],
    };
  }
}

module.exports = {
  searchInterviewInfo,
};