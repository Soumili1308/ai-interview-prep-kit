// backend/src/utils/rateLimiter.js

const EXTERNAL_CONCURRENCY = 3;

// Keep our local LLM budget below Groq's observed 8K TPM limit.
// This leaves headroom for estimation differences and other requests.
const LLM_TOKEN_BUDGET = 5000;
const TOKEN_WINDOW_MS = 60 * 1000;

let externalActive = 0;
const externalQueue = [];

let llmActive = 0;
const llmQueue = [];

let tokenWindowStart = Date.now();
let estimatedTokensUsed = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetTokenWindowIfNeeded() {
  const now = Date.now();

  if (now - tokenWindowStart >= TOKEN_WINDOW_MS) {
    tokenWindowStart = now;
    estimatedTokensUsed = 0;
  }
}

async function waitForTokenBudget(estimatedTokens = 0) {
  const tokens = Math.max(0, Number(estimatedTokens) || 0);

  while (true) {
    resetTokenWindowIfNeeded();

    // If this request itself is larger than our local budget,
    // allow it after a clean window instead of deadlocking.
    if (tokens > LLM_TOKEN_BUDGET) {
      if (estimatedTokensUsed === 0) {
        estimatedTokensUsed = tokens;
        return;
      }

      const waitMs =
        Math.max(0, TOKEN_WINDOW_MS - (Date.now() - tokenWindowStart)) + 250;

      await sleep(waitMs);
      continue;
    }

    if (estimatedTokensUsed + tokens <= LLM_TOKEN_BUDGET) {
      estimatedTokensUsed += tokens;
      return;
    }

    const waitMs =
      Math.max(0, TOKEN_WINDOW_MS - (Date.now() - tokenWindowStart)) + 250;

    console.log(
      `[LLM_RATE_LIMITER] Waiting ${Math.ceil(waitMs / 1000)}s for token window...`
    );

    await sleep(waitMs);
  }
}

async function processExternalQueue() {
  if (externalActive >= EXTERNAL_CONCURRENCY) {
    return;
  }

  const item = externalQueue.shift();

  if (!item) {
    return;
  }

  externalActive++;

  try {
    const result = await item.fn();
    item.resolve(result);
  } catch (error) {
    item.reject(error);
  } finally {
    externalActive--;
    processExternalQueue();
  }
}

async function limitExternalRequest(fn) {
  return new Promise((resolve, reject) => {
    externalQueue.push({
      fn,
      resolve,
      reject,
    });

    processExternalQueue();
  });
}

async function processLLMQueue() {
  if (llmActive >= 1) {
    return;
  }

  const item = llmQueue.shift();

  if (!item) {
    return;
  }

  llmActive++;

  try {
    await waitForTokenBudget(item.estimatedTokens);

    const result = await item.fn();

    item.resolve(result);
  } catch (error) {
    item.reject(error);
  } finally {
    llmActive--;

    // Small gap between LLM calls so bursts don't happen.
    await sleep(250);

    processLLMQueue();
  }
}

async function limitLLMRequest(fn, options = {}) {
  const estimatedTokens = Number(options.estimatedTokens) || 0;

  return new Promise((resolve, reject) => {
    llmQueue.push({
      fn,
      estimatedTokens,
      resolve,
      reject,
    });

    processLLMQueue();
  });
}

module.exports = {
  limitExternalRequest,
  limitLLMRequest,
};