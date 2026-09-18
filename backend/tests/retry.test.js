const {
  withRetry,
} = require("../src/utils/retry");

describe("retry utility", () => {
  test("retries a transient failure", async () => {
    let attempts = 0;

    const result =
      await withRetry(
        async () => {
          attempts += 1;

          if (attempts < 3) {
            const error =
              new Error("temporary failure");

            error.code =
              "TEMPORARY_FAILURE";

            throw error;
          }

          return "success";
        },
        {
          retries: 2,
          baseDelay: 1,
          maxDelay: 5,
          shouldRetry: () => true,
        }
      );

    expect(result).toBe(
      "success"
    );

    expect(attempts).toBe(3);
  });

  test("stops when retry condition is false", async () => {
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts += 1;
          throw new Error(
            "permanent failure"
          );
        },
        {
          retries: 5,
          baseDelay: 1,
          shouldRetry: () => false,
        }
      )
    ).rejects.toThrow(
      "permanent failure"
    );

    expect(attempts).toBe(1);
  });
});