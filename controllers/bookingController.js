const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const bookingService = require("../services/bookingService.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.createBooking = catchAsync(async (req, res) => {
  const { id: listingId } = req.params;
  const { checkIn, checkOut, guests } = req.body;
  const userId = req.session.user._id;

  try {
    const booking = await bookingService.createBooking({
      userId,
      listingId,
      checkIn,
      checkOut,
      guests,
    });

    req.flash("success", "Reservation confirmed! Have a great trip.");
    res.redirect(`/bookings/${booking._id}`);
  } catch (err) {
    req.flash("error", err.message);
    res.redirect(`/listings/${listingId}`);
  }
});

module.exports.getUserBookings = catchAsync(async (req, res) => {
  const userId = req.session.user._id;

  const bookings = await Booking.find({ user: userId })
    .populate("listing")
    .sort({ checkIn: -1 });

  const now = new Date();
  const upcomingBookings = bookings.filter((b) => new Date(b.checkOut) >= now && b.status !== "cancelled");
  const pastBookings = bookings.filter((b) => new Date(b.checkOut) < now || b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  res.render("bookings/index.ejs", {
    upcomingBookings,
    pastBookings,
    cancelledBookings,
  });
});

module.exports.getBookingDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id).populate({
    path: "listing",
    populate: { path: "owner", select: "name email phone profileImage" },
  });

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/my-trips");
  }

  res.render("bookings/show.ejs", { booking });
});

module.exports.cancelBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.findById(id);

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/my-trips");
  }

  booking.status = "cancelled";
  await booking.save();

  req.flash("success", "Booking successfully cancelled.");
  res.redirect(`/bookings/${id}`);
});
