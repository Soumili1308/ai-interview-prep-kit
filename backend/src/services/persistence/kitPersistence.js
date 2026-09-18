const Kit = require("../../models/Kit");
const {
  createInitialEditorState,
} = require("./editorState");

async function createKit({
  userId,
  kit,
  submissionFingerprint,
}) {
  const editorState =
    createInitialEditorState(kit);

  const publicKit = {
    ...kit,
  };

  const researchContext =
    publicKit.research_context || null;

  delete publicKit.research_context;

  return Kit.create({
    userId,
    kit: publicKit,
    editorState,
    submissionFingerprint,
    researchContext,
    title:
      kit.role?.title || "",
    company:
      kit.source?.company || "",
    role:
      kit.role?.title || "",
    status: "ready",
    generationVersion: 1,
    lastGeneratedAt: new Date(),
  });
}

async function getKitById({
  userId,
  kitId,
}) {
  return Kit.findOne({
    _id: kitId,
    userId,
  });
}

async function listUserKits(userId) {
  return Kit.find({
    userId,
  })
    .sort({
      updatedAt: -1,
    })
    .lean();
}

async function deleteKit({
  userId,
  kitId,
}) {
  return Kit.findOneAndDelete({
    _id: kitId,
    userId,
  });
}

module.exports = {
  createKit,
  getKitById,
  listUserKits,
  deleteKit,
};