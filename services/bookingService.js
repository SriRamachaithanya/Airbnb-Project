const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const { calculateBookingPrice } = require("./pricingService.js");

/**
 * Checks if a property is available for the given date range
 * Overlap formula: existing.checkIn < requestedCheckOut AND existing.checkOut > requestedCheckIn
 */
async function checkAvailability(listingId, checkIn, checkOut, excludeBookingId = null) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const query = {
    listing: listingId,
    status: { $in: ["confirmed", "pending"] },
    checkIn: { $lt: end },
    checkOut: { $gt: start },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existingBooking = await Booking.findOne(query);
  return !existingBooking;
}

/**
 * Creates a validated, collision-free booking
 */
async function createBooking({ userId, listingId, checkIn, checkOut, guests }) {
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }

  if (Number(guests) > listing.maxGuests) {
    throw new Error(`This property accommodates a maximum of ${listing.maxGuests} guests`);
  }

  const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
  if (!isAvailable) {
    throw new Error("This property is not available for the selected dates. Please choose different dates.");
  }

  const priceDetails = calculateBookingPrice(listing.price, checkIn, checkOut);

  const newBooking = new Booking({
    user: userId,
    listing: listingId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    guests: Number(guests),
    nights: priceDetails.nights,
    pricePerNight: priceDetails.pricePerNight,
    cleaningFee: priceDetails.cleaningFee,
    serviceFee: priceDetails.serviceFee,
    discount: priceDetails.discount,
    totalPrice: priceDetails.totalPrice,
    status: "confirmed",
  });

  await newBooking.save();
  return newBooking;
}

module.exports = {
  checkAvailability,
  createBooking,
};
