const {
  extractRequirements,
} = require("../services/pipeline/extractRequirements");
const {
  researchCompany,
} = require("../services/retrieval/researchCompany");
const {
  buildInitialKit,
} = require("../services/pipeline/buildInitialKit");
const {
  createKit,
  getKitById,
  listUserKits,
  deleteKit,
} = require("../services/persistence/kitPersistence");
const {
  assertValidObjectId,
} = require("../utils/objectId");
const {
  createSubmissionFingerprint,
} = require("../utils/submissionFingerprint");
const {
  acquireGenerationLock,
} = require("../services/pipeline/generationLock");
const Kit = require("../models/Kit");

async function extractJDRequirements(
  req,
  res,
  next
) {
  try {
    const result =
      await extractRequirements(
        req.validated.body.jd
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function researchCompanyController(
  req,
  res,
  next
) {
  try {
    const {
      companyUrl,
      companyName,
    } = req.validated.body;

    const result =
      await researchCompany(
        companyUrl,
        {
          companyName,
          allowLocalhost:
            configAllowsLocalhost(),
        }
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

function configAllowsLocalhost() {
  return process.env.NODE_ENV !==
    "production";
}

async function buildInitialKitController(
  req,
  res,
  next
) {
  const {
    jd,
    companyUrl,
    days,
    companyName,
    location,
  } = req.validated.body;

  const fingerprint =
    createSubmissionFingerprint({
      jd,
      companyUrl,
    });

  let releaseLock;

  try {
    releaseLock =
      acquireGenerationLock(
        req.user.id,
        fingerprint
      );

    const existingKit =
      await Kit.findOne({
        userId: req.user.id,
        submissionFingerprint:
          fingerprint,
      }).sort({
        createdAt: -1,
      });

    if (existingKit) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message:
          "An interview kit for this submission already exists.",
        data: {
          id: existingKit._id,
          kit: existingKit.kit,
          editorState:
            existingKit.editorState,
        },
      });
    }

    const kit =
      await buildInitialKit({
        jd,
        companyUrl,
        days,
        companyName,
        location,
        allowLocalhost:
          configAllowsLocalhost(),
      });

    const savedKit =
      await createKit({
        userId: req.user.id,
        kit,
        submissionFingerprint:
          fingerprint,
      });

    return res.status(201).json({
      success: true,
      data: {
        id: savedKit._id,
        kit: savedKit.kit,
        editorState:
          savedKit.editorState,
      },
    });
  } catch (error) {
    return next(error);
  } finally {
    if (releaseLock) {
      releaseLock();
    }
  }
}

async function getKitController(
  req,
  res,
  next
) {
  try {
    const kitId =
      assertValidObjectId(
        req.params.id
      );

    const document =
      await getKitById({
        userId: req.user.id,
        kitId,
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
        status: document.status,
        generationVersion:
          document.generationVersion,
        createdAt:
          document.createdAt,
        updatedAt:
          document.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function listKitsController(
  req,
  res,
  next
) {
  try {
    const kits =
      await listUserKits(
        req.user.id
      );

    return res.json({
      success: true,
      data: kits.map(
        (document) => ({
          id: document._id,
          title: document.title,
          company: document.company,
          role: document.role,
          status: document.status,
          generationVersion:
            document.generationVersion,
          createdAt:
            document.createdAt,
          updatedAt:
            document.updatedAt,
        })
      ),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteKitController(
  req,
  res,
  next
) {
  try {
    const kitId =
      assertValidObjectId(
        req.params.id
      );

    const deleted =
      await deleteKit({
        userId: req.user.id,
        kitId,
      });

    if (!deleted) {
      const error = new Error(
        "Kit not found."
      );
      error.code = "KIT_NOT_FOUND";
      error.statusCode = 404;
      throw error;
    }

    return res.json({
      success: true,
      message:
        "Kit deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  extractJDRequirements,
  researchCompanyController,
  buildInitialKitController,
  getKitController,
  listKitsController,
  deleteKitController,
};