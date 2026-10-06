const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController.js");
const { isLoggedIn, requireRole } = require("../middleware/auth.js");

// Host Dashboard
router.get("/host/dashboard", isLoggedIn, requireRole("host", "admin"), dashboardController.renderHostDashboard);

// Admin Control Panel
router.get("/admin", isLoggedIn, requireRole("admin"), dashboardController.renderAdminDashboard);

module.exports = router;
