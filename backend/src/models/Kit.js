const mongoose = require("mongoose");

const KitSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      kit: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },

      researchContext: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      editorState: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },

      practiceState: {
        type: mongoose.Schema.Types.Mixed,
        default: {
          flashcards: {},
          lastSessionAt: null,
        },
      },

      submissionFingerprint: {
        type: String,
        index: true,
      },

      title: {
        type: String,
        default: "",
        trim: true,
      },

      company: {
        type: String,
        default: "",
        trim: true,
      },

      role: {
        type: String,
        default: "",
        trim: true,
      },

      status: {
        type: String,
        enum: [
          "generating",
          "ready",
          "failed",
        ],
        default: "ready",
      },

      generationVersion: {
        type: Number,
        default: 1,
      },

      lastGeneratedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

KitSchema.index({
  userId: 1,
  createdAt: -1,
});

KitSchema.index({
  userId: 1,
  submissionFingerprint: 1,
});

module.exports =
  mongoose.model("Kit", KitSchema);