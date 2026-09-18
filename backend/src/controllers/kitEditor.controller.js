const {
  assertValidObjectId,
} = require("../utils/objectId");
const {
  updateQuestion,
  updateFlashcard,
  updateCompanyBrief,
} = require("../services/persistence/editKit");
const {
  reorderQuestions,
} = require("../services/persistence/reorderQuestions");
const {
  setQuestionPinned,
  setFlashcardPinned,
} = require("../services/persistence/pinItem");
const {
  addQuestion,
  addFlashcard,
} = require("../services/persistence/addKitItem");
const {
  deleteQuestion,
  deleteFlashcard,
} = require("../services/persistence/deleteKitItem");

function sendKit(res, document) {
  return res.json({
    success: true,
    data: {
      id: document._id,
      kit: document.kit,
      editorState:
        document.editorState,
    },
  });
}

async function updateQuestionController(
  req,
  res,
  next
) {
  try {
    const document =
      await updateQuestion({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        questionId:
          req.params.questionId,
        changes: req.body,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function updateFlashcardController(
  req,
  res,
  next
) {
  try {
    const document =
      await updateFlashcard({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        flashcardId:
          req.params.flashcardId,
        changes: req.body,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function updateBriefController(
  req,
  res,
  next
) {
  try {
    const document =
      await updateCompanyBrief({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        changes: req.body,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function reorderQuestionsController(
  req,
  res,
  next
) {
  try {
    const document =
      await reorderQuestions({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        questionIds:
          req.body.question_ids,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function pinQuestionController(
  req,
  res,
  next
) {
  try {
    const document =
      await setQuestionPinned({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        questionId:
          req.params.questionId,
        pinned: req.body.pinned,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function pinFlashcardController(
  req,
  res,
  next
) {
  try {
    const document =
      await setFlashcardPinned({
        userId: req.user.id,
        kitId:
          assertValidObjectId(
            req.params.id
          ),
        flashcardId:
          req.params.flashcardId,
        pinned: req.body.pinned,
      });

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function addQuestionController(
  req,
  res,
  next
) {
  try {
    const document =
      await addQuestion(
        req.user.id,
        assertValidObjectId(
          req.params.id
        ),
        req.body
      );

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function addFlashcardController(
  req,
  res,
  next
) {
  try {
    const document =
      await addFlashcard(
        req.user.id,
        assertValidObjectId(
          req.params.id
        ),
        req.body
      );

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function deleteQuestionController(
  req,
  res,
  next
) {
  try {
    const document =
      await deleteQuestion(
        req.user.id,
        assertValidObjectId(
          req.params.id
        ),
        req.params.questionId
      );

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

async function deleteFlashcardController(
  req,
  res,
  next
) {
  try {
    const document =
      await deleteFlashcard(
        req.user.id,
        assertValidObjectId(
          req.params.id
        ),
        req.params.flashcardId
      );

    if (!document) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return sendKit(res, document);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
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
};