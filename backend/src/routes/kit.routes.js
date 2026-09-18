const express = require("express");
const { z } = require("zod");
const {
  validateBody,
} = require("../middleware/validate");
const {
  requireAuth,
} = require("../middleware/auth");

const {
  updateQuestionSchema,
  updateFlashcardSchema,
  updateBriefSchema,
  reorderQuestionsSchema,
  pinItemSchema,
} = require("../schemas/kit.schema");

const extractRequirementsRequestSchema =
  z.object({
    jd: z.string()
      .trim()
      .min(1),
  });

const researchCompanyRequestSchema =
  z.object({
    companyUrl: z.string()
      .url()
      .max(2048),
    companyName: z.string()
      .trim()
      .min(1)
      .max(200)
      .optional(),
  });

const buildKitRequestSchema =
  z.object({
    jd: z.string()
      .trim()
      .min(1)
      .max(30000),
    companyUrl: z.string()
      .url()
      .max(2048),
    days: z.number()
      .int()
      .min(1)
      .max(60),
    companyName: z.string()
      .trim()
      .min(1)
      .max(200)
      .optional(),
    location: z.string()
      .trim()
      .max(200)
      .optional()
      .default(""),
  });

const {
  extractJDRequirements,
  researchCompanyController,
  buildInitialKitController,
  getKitController,
  listKitsController,
  deleteKitController,
} = require("../controllers/kit.controller");

const {
  updateQuestionController,
  updateFlashcardController,
  updateBriefController,
  reorderQuestionsController,
  pinQuestionController,
  pinFlashcardController,
  addQuestionController,
  addFlashcardController,
  deleteQuestionController,
  deleteFlashcardController,
} = require("../controllers/kitEditor.controller");

const {
  regenerateQuestionCategoryController,
  regenerateCompanyBriefController,
} = require("../controllers/regeneration.controller");

const {
  regenerateScheduleController,
} = require("../controllers/schedule.controller");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/",
  listKitsController
);

router.post(
  "/generate",
  validateBody(buildKitRequestSchema),
  buildInitialKitController
);

router.post(
  "/extract-requirements",
  validateBody(
    extractRequirementsRequestSchema
  ),
  extractJDRequirements
);

router.post(
  "/research-company",
  validateBody(
    researchCompanyRequestSchema
  ),
  researchCompanyController
);

router.get(
  "/:id",
  getKitController
);

router.delete(
  "/:id",
  deleteKitController
);

router.patch(
  "/:id/questions/reorder",
  validateBodyOnly(
    reorderQuestionsSchema
  ),
  reorderQuestionsController
);

router.patch(
  "/:id/questions/:questionId",
  validateBodyOnly(
    updateQuestionSchema
  ),
  updateQuestionController
);

router.patch(
  "/:id/questions/:questionId/pin",
  validateBodyOnly(pinItemSchema),
  pinQuestionController
);

router.post(
  "/:id/questions",
  addQuestionController
);

router.delete(
  "/:id/questions/:questionId",
  deleteQuestionController
);

router.patch(
  "/:id/flashcards/:flashcardId",
  validateBodyOnly(
    updateFlashcardSchema
  ),
  updateFlashcardController
);

router.patch(
  "/:id/flashcards/:flashcardId/pin",
  validateBodyOnly(pinItemSchema),
  pinFlashcardController
);

router.post(
  "/:id/flashcards",
  addFlashcardController
);

router.delete(
  "/:id/flashcards/:flashcardId",
  deleteFlashcardController
);

router.patch(
  "/:id/company-brief",
  validateBodyOnly(updateBriefSchema),
  updateBriefController
);

router.post(
  "/:id/regenerate/company-brief",
  regenerateCompanyBriefController
);

router.post(
  "/:id/regenerate/questions/:category",
  regenerateQuestionCategoryController
);

router.post(
  "/:id/regenerate/schedule",
  regenerateScheduleController
);

function validateBodyOnly(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(
      req.body
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message:
            "Request validation failed.",
          details: result.error.issues,
        },
      });
    }

    req.body = result.data;
    return next();
  };
}

module.exports = router;