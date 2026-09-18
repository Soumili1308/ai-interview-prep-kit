const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const config = require("./config/env");
const {
  errorHandler,
} = require("./middleware/errorHandler");
const {
  requestId,
} = require("./middleware/requestId");

const authRoutes = require("./routes/auth.routes");
const kitRoutes = require("./routes/kit.routes");
const practiceRoutes = require("./routes/practice.routes");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (origin === config.frontendUrl) {
        return callback(null, true);
      }

      const error = new Error(
        "Origin is not allowed by CORS."
      );

      error.code =
        "CORS_ORIGIN_NOT_ALLOWED";
      error.statusCode = 403;

      return callback(error);
    },
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(requestId);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMITED",
      message:
        "Too many requests. Please try again later.",
    },
  },
});

app.use("/api", apiLimiter);

app.get(
  "/api/health",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "AI Interview Prep Kit API is running.",
      environment: config.nodeEnv,
    });
  }
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/kits",
  kitRoutes
);

app.use(
  "/api/kits",
  practiceRoutes
);

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Route not found.",
      },
    });
  }
);

app.use(errorHandler);

module.exports = app;