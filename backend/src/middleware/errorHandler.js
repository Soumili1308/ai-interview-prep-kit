function errorHandler(
  error,
  req,
  res,
  next
) {
  console.error(
    `[${error.code || "INTERNAL_ERROR"}]`,
    error.message
  );

  const statusCode =
    Number.isInteger(error.statusCode) &&
    error.statusCode >= 400 &&
    error.statusCode < 600
      ? error.statusCode
      : 500;

  const response = {
    success: false,
    error: {
      code:
        error.code ||
        "INTERNAL_ERROR",
      message:
        statusCode >= 500
          ? "An unexpected server error occurred"
          : error.message,
    },
  };

  /*
   * Useful structured details are safe to expose for
   * validation errors, but don't leak arbitrary stack
   * traces or internal exception details.
   */
  if (
    error.details &&
    statusCode < 500
  ) {
    response.error.details =
      error.details;
  }

  return res
    .status(statusCode)
    .json(response);
}

module.exports = {
  errorHandler,
};