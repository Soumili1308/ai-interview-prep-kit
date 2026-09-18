function sleep(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function withRetry(
  fn,
  {
    retries = 2,
    baseDelay = 400,
    maxDelay = 5000,
    shouldRetry = () => true,
    onRetry = null,
  } = {}
) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const canRetry =
        attempt < retries &&
        shouldRetry(error);

      if (!canRetry) {
        break;
      }

      const exponentialDelay =
        Math.min(
          maxDelay,
          baseDelay * Math.pow(2, attempt)
        );

      const jitter =
        Math.floor(Math.random() * 200);

      const delay =
        exponentialDelay + jitter;

      if (typeof onRetry === "function") {
        onRetry({
          attempt: attempt + 1,
          delay,
          error,
        });
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

module.exports = {
  withRetry,
};