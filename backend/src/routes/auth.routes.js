const express = require("express");

const validate = require("../middleware/validate");
const {
  requireAuth
} = require("../middleware/auth");

const {
  registerSchema,
  loginSchema
} = require("../schemas/auth.schema");

const {
  register,
  login,
  logout,
  getCurrentUser
} = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  register
);

router.post(
  "/login",
  validate(loginSchema),
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  requireAuth,
  getCurrentUser
);

router.get(
  "/status",
  (req, res) => {
    res.json({
      success: true,
      message: "Authentication API is ready."
    });
  }
);

module.exports = router;