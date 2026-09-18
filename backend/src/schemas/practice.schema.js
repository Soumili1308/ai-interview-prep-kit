const { z } = require("zod");

const confidenceSchema = z.object({
  confidence: z
    .number()
    .int()
    .min(1)
    .max(5),
});

module.exports = {
  confidenceSchema,
};