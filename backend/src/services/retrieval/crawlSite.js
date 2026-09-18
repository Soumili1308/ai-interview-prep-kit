const {
  validateUrl,
} = require("../../utils/urlValidator");
const {
  fetchPage,
} = require("./fetchPage");
const {
  extractLinks,
} = require("./extractLinks");
const {
  rankLinks,
} = require("./rankLinks");
const {
  getRobots,
  canFetch,
} = require("./robots");

async function crawlSite(
  startUrl,
  {
    maxPages = 5,
    allowLocalhost = false,
  } = {}
) {
  const start = await validateUrl(
    startUrl,
    { allowLocalhost }
  );

  const origin = start.origin;
  const robots = await getRobots(
    start.href,
    { allowLocalhost }
  );

  const queue = [start.href];
  const seen = new Set();
  const pages = [];
  const skipped = [];

  while (
    queue.length > 0 &&
    pages.length < maxPages
  ) {
    const url = queue.shift();

    if (seen.has(url)) {
      continue;
    }

    seen.add(url);

    if (!(await canFetch(robots, url))) {
      skipped.push({
        url,
        reason: "ROBOTS_DISALLOWED",
      });
      continue;
    }

    const result =
      await fetchPage(url, {
        allowLocalhost,
      });

    if (result.skipped) {
      skipped.push(result);
      continue;
    }

    pages.push({
      url: result.url,
      text: result.text,
    });

    const links = rankLinks(
      extractLinks(
        result.rawHtml || "",
        result.url
      ),
      {
        baseUrl: result.url,
        sameOriginOnly: true,
        limit: 12,
      }
    );

    for (const link of links) {
      if (
        !seen.has(link.url) &&
        !queue.includes(link.url)
      ) {
        queue.push(link.url);
      }
    }
  }

  return {
    pages,
    skipped,
    robots_checked: true,
    pages_attempted: seen.size,
  };
}

module.exports = {
  crawlSite,
};