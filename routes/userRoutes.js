const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { isLoggedIn } = require("../middleware/auth.js");

// Registration
router
  .route("/register")
  .get(userController.renderRegisterForm)
  .post(userController.registerUser);

// Login
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(userController.loginUser);

// Logout
router.get("/logout", userController.logoutUser);

// Profile
router
  .route("/profile")
  .get(isLoggedIn, userController.renderProfile)
  .put(isLoggedIn, userController.updateProfile);

module.exports = router;
