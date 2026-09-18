const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;