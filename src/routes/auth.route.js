const express = require("express");
const router = express.Router();

const {
  googleAuthRedirect,
  googleAuthCallback,
  getUserDetails,
  verifySession,
  logoutUser,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.get("/me", authMiddleware, getUserDetails);
router.get("/session", authMiddleware, verifySession);
router.post("/logout", logoutUser);

module.exports = router;
