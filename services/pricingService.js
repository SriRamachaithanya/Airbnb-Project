/**
 * Dynamic Pricing Service for Wanderlust / Airbnb Platform
 * Computes authoritative server-side price breakdowns
 */
function calculateBookingPrice(pricePerNight, checkIn, checkOut, options = {}) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const diffTime = end.getTime() - start.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    throw new Error("Checkout date must be after check-in date");
  }

  const basePrice = pricePerNight * nights;
  const cleaningFee = options.cleaningFee !== undefined ? options.cleaningFee : 500;
  const serviceFee = Math.round(basePrice * 0.14);

  // Long stay discount (10% discount for bookings 7 nights or longer)
  let discount = 0;
  if (nights >= 7) {
    discount = Math.round(basePrice * 0.1);
  }

  const totalPrice = basePrice + cleaningFee + serviceFee - discount;

  return {
    nights,
    pricePerNight,
    basePrice,
    cleaningFee,
    serviceFee,
    discount,
    totalPrice,
  };
}

module.exports = {
  calculateBookingPrice,
};
