const mongoose = require("mongoose");
const config = require("./env");

async function connectDatabase() {
  if (!config.mongodbUri) {
    console.warn(
      "MongoDB URI is not configured. Database connection skipped."
    );
    return;
  }

  try {
    await mongoose.connect(config.mongodbUri);

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    throw error;
  }
}

async function disconnectDatabase() {
  try {
    await mongoose.disconnect();

    console.log("MongoDB disconnected.");
  } catch (error) {
    console.error("MongoDB disconnect failed:");
    console.error(error.message);
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase
};