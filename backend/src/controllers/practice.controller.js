const {
  confidenceSchema,
} = require("../schemas/practice.schema");

const {
  assertValidObjectId,
} = require("../utils/objectId");

const {
  getPracticeData,
  recordConfidence,
} = require("../services/practice/practiceService");

async function getPracticeController(
  req,
  res,
  next
) {
  try {
    const result =
      await getPracticeData(
        req.user.id,
        assertValidObjectId(
          req.params.id
        )
      );

    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function recordConfidenceController(
  req,
  res,
  next
) {
  try {
    const parsed =
      confidenceSchema.safeParse(
        req.body
      );

    if (!parsed.success) {
      const error = new Error(
        "Invalid confidence value."
      );
      error.code =
        "VALIDATION_ERROR";
      error.statusCode = 400;
      error.details =
        parsed.error.issues;
      throw error;
    }

    const result =
      await recordConfidence(
        req.user.id,
        assertValidObjectId(
          req.params.id
        ),
        req.params.flashcardId,
        parsed.data.confidence
      );

    res.json({
      message: "Confidence recorded",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPracticeController,
  recordConfidenceController,
};