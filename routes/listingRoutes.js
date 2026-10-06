const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { isListingOwner } = require("../middleware/ownership.js");
const { validateListing } = require("../middleware/validation.js");
const { upload } = require("../config/cloudinary.js");

// Index & Create
router
  .route("/")
  .get(listingController.index)
  .post(isLoggedIn, upload.array("listing[image]"), validateListing, listingController.createListing);

// New Listing Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, Delete
router
  .route("/:id")
  .get(listingController.showListing)
  .put(isLoggedIn, isListingOwner, upload.array("listing[image]"), validateListing, listingController.updateListing)
  .delete(isLoggedIn, isListingOwner, listingController.deleteListing);

// Edit Listing Form
router.get("/:id/edit", isLoggedIn, isListingOwner, listingController.renderEditForm);

module.exports = router;
