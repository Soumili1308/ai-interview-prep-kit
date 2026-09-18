const { URL } = require("url");

const PRIORITY_TERMS = [
  "career",
  "careers",
  "job",
  "jobs",
  "hiring",
  "recruit",
  "recruiting",
  "interview",
  "candidate",
  "work-with-us",
  "join-us",
  "join",
  "about",
  "company",
  "team",
  "culture",
];

const NEGATIVE_TERMS = [
  "login",
  "signin",
  "sign-in",
  "signup",
  "register",
  "privacy",
  "terms",
  "cookie",
  "cart",
  "checkout",
];

function normalizeUrl(rawUrl, baseUrl) {
  try {
    const resolved = new URL(rawUrl, baseUrl);

    resolved.hash = "";

    return resolved.toString();
  } catch {
    return null;
  }
}

function isSameOrigin(urlA, urlB) {
  try {
    const a = new URL(urlA);
    const b = new URL(urlB);

    return a.origin === b.origin;
  } catch {
    return false;
  }
}

function scoreLink({ url, text = "" }) {
  const normalized = `${url} ${text}`.toLowerCase();

  let score = 0;

  for (const term of PRIORITY_TERMS) {
    if (normalized.includes(term)) {
      score += term.length >= 7 ? 4 : 2;
    }
  }

  for (const term of NEGATIVE_TERMS) {
    if (normalized.includes(term)) {
      score -= 6;
    }
  }

  if (
    normalized.includes("career") ||
    normalized.includes("hiring") ||
    normalized.includes("recruit")
  ) {
    score += 5;
  }

  if (
    normalized.includes("about") ||
    normalized.includes("company")
  ) {
    score += 3;
  }

  return score;
}

function rankLinks(
  links,
  {
    baseUrl,
    sameOriginOnly = true,
    limit = 12,
  } = {}
) {
  const seen = new Set();

  const candidates = [];

  for (const link of links || []) {
    const normalizedUrl = normalizeUrl(
      link.url,
      baseUrl
    );

    if (!normalizedUrl) {
      continue;
    }

    if (
      sameOriginOnly &&
      !isSameOrigin(normalizedUrl, baseUrl)
    ) {
      continue;
    }

    if (seen.has(normalizedUrl)) {
      continue;
    }

    seen.add(normalizedUrl);

    candidates.push({
      url: normalizedUrl,
      text: String(link.text || "").trim(),
      score: scoreLink({
        url: normalizedUrl,
        text: link.text,
      }),
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = {
  normalizeUrl,
  isSameOrigin,
  scoreLink,
  rankLinks,
};