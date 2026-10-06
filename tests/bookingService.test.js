const Booking = require("../models/Booking.js");
const { checkAvailability } = require("../services/bookingService.js");

describe("Booking Service - Collision & Overlap Prevention", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return true (available) when no overlapping booking exists", async () => {
    jest.spyOn(Booking, "findOne").mockResolvedValue(null);

    const isAvailable = await checkAvailability(
      "650000000000000000000001",
      "2026-11-01",
      "2026-11-05"
    );

    expect(isAvailable).toBe(true);
  });

  it("should return false (unavailable) when an overlapping booking is detected", async () => {
    jest.spyOn(Booking, "findOne").mockResolvedValue({
      _id: "650000000000000000000099",
      checkIn: new Date("2026-11-02"),
      checkOut: new Date("2026-11-04"),
      status: "confirmed",
    });

    const isAvailable = await checkAvailability(
      "650000000000000000000001",
      "2026-11-01",
      "2026-11-05"
    );

    expect(isAvailable).toBe(false);
  });
});
