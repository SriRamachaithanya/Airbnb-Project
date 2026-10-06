const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { isBookingOwnerOrHost } = require("../middleware/ownership.js");

// Reserve a listing
router.post("/listings/:id/book", isLoggedIn, bookingController.createBooking);

// User Trips / Bookings list
router.get("/my-trips", isLoggedIn, bookingController.getUserBookings);

// Booking Details Receipt
router.get("/bookings/:id", isLoggedIn, isBookingOwnerOrHost, bookingController.getBookingDetails);

// Cancel Booking
router.post("/bookings/:id/cancel", isLoggedIn, isBookingOwnerOrHost, bookingController.cancelBooking);

module.exports = router;
