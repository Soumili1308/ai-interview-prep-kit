const {
  assertValidObjectId,
} = require("../utils/objectId");
const {
  regenerateQuestionCategory,
} = require("../services/regeneration/regenerateQuestionCategory");
const {
  regenerateCompanyBrief,
} = require("../services/regeneration/regenerateCompanyBrief");

async function regenerateCompanyBriefController(
  req,
  res,
  next
) {
  try {
    const document =
      await regenerateCompanyBrief({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      data: {
        id: document._id,
        kit: document.kit,
        editorState:
          document.editorState,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function regenerateQuestionCategoryController(
  req,
  res,
  next
) {
  try {
    const document =
      await regenerateQuestionCategory({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        category:
          req.params.category,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      data: {
        id: document._id,
        kit: document.kit,
        editorState:
          document.editorState,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  regenerateQuestionCategoryController,
  regenerateCompanyBriefController,
};