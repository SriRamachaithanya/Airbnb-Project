const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController.js");

// Post AI recommendation query
router.post("/api/ai/travel-plan", aiController.getTravelPlan);

module.exports = router;
