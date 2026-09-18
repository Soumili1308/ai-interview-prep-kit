const mongoose = require("mongoose");


function isValidObjectId(
  value
) {
  return mongoose.Types.ObjectId.isValid(
    value
  );
}


function assertValidObjectId(
  value
) {
  if (
    !isValidObjectId(value)
  ) {
    const error = new Error(
      "Invalid kit ID."
    );

    error.code =
      "INVALID_KIT_ID";
    error.statusCode = 400;

    throw error;
  }

  return value;
}


module.exports = {
  isValidObjectId,
  assertValidObjectId,
};