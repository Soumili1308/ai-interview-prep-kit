const dns = require("dns").promises;
const net = require("net");

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);

    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 &&
        parts[1] >= 16 &&
        parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 0
    );
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();

    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return false;
}

function createUrlError(message, code, statusCode = 400) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

async function validateUrl(
  value,
  { allowLocalhost = false } = {}
) {
  let url;

  try {
    url = new URL(String(value).trim());
  } catch {
    throw createUrlError(
      "Invalid company URL",
      "INVALID_URL"
    );
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw createUrlError(
      "Only http and https URLs are allowed",
      "INVALID_URL"
    );
  }

  const hostname = url.hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "");

  /*
   * Evaluator cases may intentionally use localhost.
   */
  if (
    allowLocalhost &&
    ["localhost", "127.0.0.1", "::1"].includes(hostname)
  ) {
    return url;
  }

  /*
   * Never permit loopback in normal application usage.
   */
  if (
    ["localhost", "127.0.0.1", "::1"].includes(hostname)
  ) {
    throw createUrlError(
      "Loopback URLs are not allowed",
      "PRIVATE_URL_BLOCKED"
    );
  }

  /*
   * Direct IP address.
   */
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw createUrlError(
        "Private IP targets are not allowed",
        "PRIVATE_URL_BLOCKED"
      );
    }

    return url;
  }

  /*
   * Resolve DNS and reject private destinations.
   *
   * This protects against hostnames resolving to internal
   * infrastructure.
   */
  let addresses;

  try {
    addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw createUrlError(
      "Company hostname could not be resolved",
      "DNS_LOOKUP_FAILED",
      400
    );
  }

  if (!addresses.length) {
    throw createUrlError(
      "Company hostname could not be resolved",
      "DNS_LOOKUP_FAILED",
      400
    );
  }

  if (
    addresses.some((entry) =>
      isPrivateIp(entry.address)
    )
  ) {
    throw createUrlError(
      "Private IP targets are not allowed",
      "PRIVATE_URL_BLOCKED"
    );
  }

  return url;
}

module.exports = {
  validateUrl,
  isPrivateIp,
};