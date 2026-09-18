// backend/src/utils/textCleaner.js

const MAX_CLEAN_TEXT_LENGTH = 12000;

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}

function removeComments(html) {
  return String(html || "").replace(/<!--[\s\S]*?-->/g, " ");
}

function removeNonContentElements(html) {
  return String(html || "")
    .replace(
      /<(script|style|noscript|svg|canvas|iframe|object|embed|template|head)\b[^>]*>[\s\S]*?<\/\1>/gi,
      " "
    )
    .replace(
      /<(script|style|noscript|svg|canvas|iframe|object|embed|template|head)\b[^>]*\/>/gi,
      " "
    );
}

function normalizeHtmlStructure(html) {
  return String(html || "")
    .replace(
      /<\/?(p|div|section|article|main|header|footer|nav|aside|li|ul|ol|h1|h2|h3|h4|h5|h6|br|tr|td|th|table|blockquote)\b[^>]*>/gi,
      "\n"
    );
}

function stripHtmlTags(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/[ \t]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function removeEmptyLines(text) {
  return String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function limitText(text, maxLength = MAX_CLEAN_TEXT_LENGTH) {
  const value = String(text || "").trim();

  if (value.length <= maxLength) {
    return value;
  }

  return (
    value.slice(0, maxLength).trim() +
    "\n\n[Content truncated for processing.]"
  );
}

function cleanText(input) {
  let text = String(input || "");

  text = removeComments(text);
  text = removeNonContentElements(text);
  text = normalizeHtmlStructure(text);
  text = decodeHtmlEntities(text);
  text = stripHtmlTags(text);
  text = normalizeWhitespace(text);
  text = removeEmptyLines(text);

  return limitText(text);
}

function cleanPlainText(input) {
  let text = String(input || "");

  text = decodeHtmlEntities(text);
  text = normalizeWhitespace(text);
  text = removeEmptyLines(text);

  return limitText(text);
}

module.exports = {
  cleanText,
  cleanPlainText,
  MAX_CLEAN_TEXT_LENGTH,
};