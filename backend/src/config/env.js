const dotenv = require("dotenv");

dotenv.config();

const config = {
  port:
    Number(process.env.PORT) || 5000,

  mongodbUri:
    process.env.MONGODB_URI || "",

  jwtSecret:
    process.env.JWT_SECRET || "",

  frontendUrl:
    (
      process.env.FRONTEND_URL ||
      "http://localhost:3000"
    ).replace(/\/$/, ""),

  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  groqApiKey:
    process.env.GROQ_API_KEY || "",

  groqModel:
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b",

  searchProviderUrl:
    process.env.SEARCH_PROVIDER_URL || "",

  searchProviderApiKey:
    process.env.SEARCH_PROVIDER_API_KEY || "",
};

module.exports = config;