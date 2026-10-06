const Listing = require("../models/Listing.js");
const Booking = require("../models/Booking.js");

// Ensures only the listing owner (or admin) can edit/delete a listing
async function isListingOwner(req, res, next) {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const user = req.session.user;
  const isOwner = listing.owner && listing.owner.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    req.flash("error", "You do not have permission to modify this listing");
    return res.status(403).render("errors/error.ejs", {
      message: "403 Forbidden: Only the property owner can perform this operation.",
      statusCode: 403,
    });
  }

  req.listing = listing;
  next();
}

// Ensures only the booking guest or property host can view/cancel a booking
async function isBookingOwnerOrHost(req, res, next) {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/my-trips");
  }

  const user = req.session.user;
  const isGuest = booking.user.toString() === user._id.toString();
  const isHost = booking.listing && booking.listing.owner && booking.listing.owner.toString() === user._id.toString();
  const isAdmin = user.role === "admin";

  if (!isGuest && !isHost && !isAdmin) {
    req.flash("error", "You do not have permission to access this booking");
    return res.status(403).render("errors/error.ejs", {
      message: "403 Forbidden: You are not authorized to view this booking.",
      statusCode: 403,
    });
  }

  req.booking = booking;
  next();
}

module.exports = {
  isListingOwner,
  isBookingOwnerOrHost,
};
