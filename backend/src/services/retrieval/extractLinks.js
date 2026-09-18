const cheerio = require("cheerio");

const {
  normalizeUrl,
} = require("./rankLinks");

function extractLinks(
  html,
  baseUrl
) {
  if (!html) {
    return [];
  }

  const $ = cheerio.load(html);

  const links = [];

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const url = normalizeUrl(
      href,
      baseUrl
    );

    if (!url) {
      return;
    }

    const text = $(element)
      .text()
      .replace(/\s+/g, " ")
      .trim();

    links.push({
      url,
      text,
    });
  });

  return links;
}

module.exports = {
  extractLinks,
};