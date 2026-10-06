const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController.js");
const { isLoggedIn } = require("../middleware/auth.js");

// View user's wishlist
router.get("/my-wishlist", isLoggedIn, wishlistController.getWishlist);

// Toggle wishlist item
router.post("/wishlist/toggle", isLoggedIn, wishlistController.toggleWishlist);

module.exports = router;
