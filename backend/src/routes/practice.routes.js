const express = require("express");
const {
  requireAuth,
} = require("../middleware/auth");
const {
  getPracticeController,
  recordConfidenceController,
} = require("../controllers/practice.controller");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/:id/practice",
  getPracticeController
);

router.post(
  "/:id/practice/:flashcardId/confidence",
  recordConfidenceController
);

module.exports = router;