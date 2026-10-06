const { calculateBookingPrice } = require("../services/pricingService.js");

describe("Pricing Service - calculateBookingPrice", () => {
  it("should calculate correct standard booking pricing for 3 nights", () => {
    const pricePerNight = 1500;
    const checkIn = "2026-10-10";
    const checkOut = "2026-10-13"; // 3 nights

    const result = calculateBookingPrice(pricePerNight, checkIn, checkOut);

    expect(result.nights).toBe(3);
    expect(result.pricePerNight).toBe(1500);
    expect(result.basePrice).toBe(4500);
    expect(result.cleaningFee).toBe(500);
    expect(result.serviceFee).toBe(630); // 14% of 4500
    expect(result.discount).toBe(0);
    expect(result.totalPrice).toBe(4500 + 500 + 630);
  });

  it("should apply 10% long-stay discount for bookings of 7 nights or more", () => {
    const pricePerNight = 1000;
    const checkIn = "2026-10-01";
    const checkOut = "2026-10-08"; // 7 nights

    const result = calculateBookingPrice(pricePerNight, checkIn, checkOut);

    expect(result.nights).toBe(7);
    expect(result.basePrice).toBe(7000);
    expect(result.discount).toBe(700); // 10% of 7000
    expect(result.totalPrice).toBe(7000 + 500 + 980 - 700);
  });

  it("should throw an error if checkout is before or equal to checkin", () => {
    expect(() => {
      calculateBookingPrice(1000, "2026-10-05", "2026-10-05");
    }).toThrow("Checkout date must be after check-in date");
  });
});
