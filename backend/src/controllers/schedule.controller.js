const {
  regenerateSchedule,
} = require("../services/regeneration/regenerateSchedule");

async function regenerateScheduleController(req, res, next) {
  try {
    const kit = await regenerateSchedule(
      req.user.id,
      req.params.id
    );

    res.json({
      success: true,
      schedule: kit.kit.schedule,
      editorState: kit.editorState?.schedule,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  regenerateScheduleController,
};