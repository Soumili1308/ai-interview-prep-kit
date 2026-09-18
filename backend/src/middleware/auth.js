const jwt = require("jsonwebtoken");

const config = require("../config/env");

const AUTH_COOKIE_NAME =
  "interview_prep_token";

function clearAuthCookie(res) {
  res.clearCookie(
    AUTH_COOKIE_NAME,
    {
      httpOnly: true,
      secure:
        config.nodeEnv === "production",
      sameSite:
        config.nodeEnv === "production"
          ? "none"
          : "lax",
      path: "/",
    }
  );
}

function requireAuth(req, res, next) {
  const token =
    req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: "AUTH_REQUIRED",
        message:
          "Authentication is required.",
      },
    });
  }

  if (!config.jwtSecret) {
    return res.status(500).json({
      success: false,
      error: {
        code: "AUTH_CONFIGURATION_ERROR",
        message:
          "Authentication is not configured.",
      },
    });
  }

  try {
    const payload = jwt.verify(
      token,
      config.jwtSecret
    );

    if (
      !payload ||
      typeof payload.userId !== "string" ||
      !payload.userId
    ) {
      clearAuthCookie(res);

      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_SESSION",
          message:
            "Session is invalid or expired.",
        },
      });
    }

    req.user = {
      id: payload.userId,
    };

    return next();
  } catch {
    clearAuthCookie(res);

    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_SESSION",
        message:
          "Session is invalid or expired.",
      },
    });
  }
}

module.exports = {
  AUTH_COOKIE_NAME,
  requireAuth,
  authenticationRequired: requireAuth,
};