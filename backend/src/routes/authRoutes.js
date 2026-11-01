const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authLimiter, otpLimiter } = require("../middleware/rateLimit");

router.post("/register", authLimiter, ctrl.register);
router.post("/verify-email", otpLimiter, ctrl.verifyEmail);
router.post("/resend-email-otp", otpLimiter, ctrl.resendEmailOtp);
router.post("/login", authLimiter, ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", protect, ctrl.me);
router.patch("/profile", protect, ctrl.updateProfile);
router.post("/verify-phone", protect, otpLimiter, ctrl.verifyPhone);
router.post("/resend-phone-otp", protect, otpLimiter, ctrl.resendPhoneOtp);
router.post("/forgot-password", authLimiter, ctrl.forgotPassword);
router.post("/reset-password", otpLimiter, ctrl.resetPassword);
router.post("/change-password", protect, ctrl.changePassword);

module.exports = router;