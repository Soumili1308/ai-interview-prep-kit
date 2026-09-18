const app = require("./app");
const config = require("./config/env");
const {
  connectDatabase
} = require("./config/db");

async function startServer() {
  try {
    await connectDatabase();

    app.listen(config.port, () => {
      console.log(
        `Server running at http://localhost:${config.port}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to start server:",
      error.message
    );

    process.exit(1);
  }
}

startServer();