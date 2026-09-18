const Kit = require("../../models/Kit");
const {
  generateCompanyBrief,
} = require("../pipeline/generateCompanyBrief");

async function regenerateCompanyBrief({
  userId,
  kitId,
}) {
  const document =
    await Kit.findOne({
      _id: kitId,
      userId,
    });

  if (!document) {
    return null;
  }

  if (
    document.editorState
      ?.companyBrief?.status ===
    "edited"
  ) {
    const error = new Error(
      "Company brief has been manually edited and was not overwritten."
    );
    error.code =
      "EDITED_CONTENT_PROTECTED";
    error.statusCode = 409;
    throw error;
  }

  const research =
    document.researchContext || {
      pages:
        document.kit
          ?.research_context?.pages ||
        [],
      interviewResearch:
        document.kit
          ?.research_context
          ?.interviewResearch || {
          available: false,
          results: [],
        },
    };

  const brief =
    await generateCompanyBrief({
      companyName:
        document.kit.source.company,
      companyUrl:
        document.kit.source.company_url,
      pages: research.pages,
      interviewResearch:
        research.interviewResearch,
    });

  document.kit.company_brief =
    brief;
  document.editorState = {
    ...(document.editorState || {}),
    companyBrief: {
      status: "generated",
      editedAt: null,
    },
  };

  document.markModified("kit");
  document.markModified("editorState");

  await document.save();

  return document;
}

module.exports = {
  regenerateCompanyBrief,
};