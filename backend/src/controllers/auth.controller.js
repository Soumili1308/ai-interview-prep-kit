const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const config = require("../config/env");
const {
  AUTH_COOKIE_NAME,
} = require("../middleware/auth");

const COOKIE_MAX_AGE =
  7 * 24 * 60 * 60 * 1000;

function createToken(userId) {
  if (!config.jwtSecret) {
    const error = new Error(
      "JWT secret is not configured."
    );

    error.code =
      "AUTH_CONFIGURATION_ERROR";
    error.statusCode = 500;

    throw error;
  }

  return jwt.sign(
    { userId },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

function getCookieOptions() {
  const isProduction =
    config.nodeEnv === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction
      ? "none"
      : "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  };
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  try {
    const {
      name,
      email,
      password,
    } = req.validated.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message:
            "An account with this email already exists.",
        },
      });
    }

    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: passwordHash,
    });

    const token = createToken(
      user._id.toString()
    );

    res.cookie(
      AUTH_COOKIE_NAME,
      token,
      getCookieOptions()
    );

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message:
            "An account with this email already exists.",
        },
      });
    }

    next(error);
  }
}

async function login(req, res, next) {
  try {
    const {
      email,
      password,
    } = req.validated.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const user =
      await User.findOne({
        email: normalizedEmail,
      }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Email or password is incorrect.",
        },
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            "Email or password is incorrect.",
        },
      });
    }

    const token = createToken(
      user._id.toString()
    );

    res.cookie(
      AUTH_COOKIE_NAME,
      token,
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie(
      AUTH_COOKIE_NAME,
      getCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req, res, next) {
  try {
    const user =
      await User.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message:
            "Your account could not be found.",
        },
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};