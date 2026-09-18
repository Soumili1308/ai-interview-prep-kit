const axios = require("axios");
const robotsParser = require("robots-parser");

const {
  validateUrl,
} = require("../../utils/urlValidator");
const {
  limitExternal,
} = require("../../utils/rateLimiter");

async function getRobots(
  siteUrl,
  { allowLocalhost = false } = {}
) {
  const parsed = await validateUrl(
    siteUrl,
    { allowLocalhost }
  );

  const robotsUrl =
    `${parsed.protocol}//${parsed.host}/robots.txt`;

  try {
    const response =
      await limitExternal(() =>
        axios.get(robotsUrl, {
          timeout: 7000,
          responseType: "text",
          validateStatus: (status) =>
            status >= 200 && status < 500,
          headers: {
            "User-Agent":
              "AI-Interview-Prep-Kit/1.0",
          },
        })
      );

    if (response.status === 404) {
      return {
        available: false,
        parser: null,
        robotsUrl,
        reason:
          "ROBOTS_TXT_NOT_FOUND",
      };
    }

    const parser =
      robotsParser(
        robotsUrl,
        String(response.data || "")
      );

    return {
      available: true,
      parser,
      robotsUrl,
      reason: null,
    };
  } catch {
    return {
      available: false,
      parser: null,
      robotsUrl,
      reason: "ROBOTS_FETCH_FAILED",
    };
  }
}

async function canFetch(
  robotsInfo,
  url
) {
  if (!robotsInfo?.parser) {
    return true;
  }

  return (
    robotsInfo.parser.isAllowed(
      url,
      "AI-Interview-Prep-Kit"
    ) !== false
  );
}

module.exports = {
  getRobots,
  getRobotsRules: getRobots,
  canFetch,
};