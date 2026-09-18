const activeGenerations =
  new Set();

function lockKey(
  userId,
  submissionFingerprint
) {
  return `${userId}:${submissionFingerprint}`;
}

function acquireGenerationLock(
  userId,
  submissionFingerprint
) {
  const key = lockKey(
    userId,
    submissionFingerprint
  );

  if (activeGenerations.has(key)) {
    const error = new Error(
      "A generation for this submission is already running"
    );

    error.code =
      "GENERATION_ALREADY_RUNNING";

    error.statusCode = 409;

    throw error;
  }

  activeGenerations.add(key);

  return () => {
    activeGenerations.delete(key);
  };
}

module.exports = {
  acquireGenerationLock,
};