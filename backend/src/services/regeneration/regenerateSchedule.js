const Kit = require("../../models/Kit");
const {
  allocateSchedule,
} = require("../scheduling/allocateSchedule");
const {
  validateSchedule,
} = require("../scheduling/validateSchedule");

async function regenerateSchedule(userId, kitId) {
  const kitDocument = await Kit.findOne({
    _id: kitId,
    userId,
  });

  if (!kitDocument) {
    const error = new Error("Kit not found");
    error.statusCode = 404;
    error.code = "KIT_NOT_FOUND";
    throw error;
  }

  const kit = kitDocument.kit;

  if (!kit || !kit.role || !kit.questions) {
    const error = new Error(
      "Kit does not contain enough data to regenerate schedule"
    );

    error.statusCode = 422;
    error.code = "INVALID_KIT_FOR_SCHEDULE";

    throw error;
  }

  const schedule = allocateSchedule({
    requirements: kit.role.requirements || [],
    questions: kit.questions || [],
    daysAvailable: kit.schedule?.days_available || 1,
  });

  const validation = validateSchedule({
    schedule,
    requirements: kit.role.requirements || [],
    questions: kit.questions || [],
  });

  if (!validation.valid) {
    const error = new Error(
      "Generated schedule failed validation"
    );

    error.statusCode = 422;
    error.code = "INVALID_GENERATED_SCHEDULE";
    error.details = validation.errors;

    throw error;
  }

  /*
   * Only replace the schedule.
   *
   * Questions, flashcards, company brief and other
   * editor state remain untouched.
   */
  kitDocument.kit.schedule = schedule;

  kitDocument.editorState = {
    ...(kitDocument.editorState || {}),
    schedule: {
      status: "generated",
      pinned: false,
      editedAt: null,
    },
  };

  kitDocument.lastGeneratedAt = new Date();

  await kitDocument.save();

  return kitDocument;
}

module.exports = {
  regenerateSchedule,
};