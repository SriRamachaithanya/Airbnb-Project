const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { validateReview } = require("../middleware/validation.js");

// Post a review for a listing
router.post("/", isLoggedIn, validateReview, reviewController.createReview);

// Delete a review
router.delete("/:reviewId", isLoggedIn, reviewController.deleteReview);

module.exports = router;
