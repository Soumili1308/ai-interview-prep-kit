const crypto = require("crypto");

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function createSubmissionFingerprint({
  jd,
  companyUrl,
}) {
  const normalized =
    [
      normalizeText(jd),
      normalizeText(companyUrl),
    ].join("|");

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

module.exports = {
  createSubmissionFingerprint,
};