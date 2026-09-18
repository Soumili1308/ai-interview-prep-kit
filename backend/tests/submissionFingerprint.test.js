const {
  createSubmissionFingerprint,
} = require("../src/utils/submissionFingerprint");

describe(
  "submission fingerprint",
  () => {
    test("same submission creates same fingerprint", () => {
      const first =
        createSubmissionFingerprint({
          jd: "Software Engineer React",
          companyUrl:
            "https://example.com",
        });

      const second =
        createSubmissionFingerprint({
          jd: "Software Engineer React",
          companyUrl:
            "https://example.com",
        });

      expect(first).toBe(
        second
      );
    });

    test("whitespace differences do not matter", () => {
      const first =
        createSubmissionFingerprint({
          jd: "Software   Engineer\nReact",
          companyUrl:
            "https://example.com",
        });

      const second =
        createSubmissionFingerprint({
          jd: "Software Engineer React",
          companyUrl:
            "https://example.com",
        });

      expect(first).toBe(
        second
      );
    });

    test("different companies create different fingerprints", () => {
      const first =
        createSubmissionFingerprint({
          jd: "Software Engineer",
          companyUrl:
            "https://example.com",
        });

      const second =
        createSubmissionFingerprint({
          jd: "Software Engineer",
          companyUrl:
            "https://different.com",
        });

      expect(first).not.toBe(
        second
      );
    });
  }
);