const Listing = require("../models/listing.js");
const { generateTravelPlan } = require("../services/recommendationService.js");

describe("AI Travel Recommendation Service", () => {
  beforeAll(() => {
    // Mock Listing.find for unit testing without live DB dependency
    jest.spyOn(Listing, "find").mockReturnValue({
      limit: jest.fn().mockResolvedValue([
        {
          _id: "650000000000000000000001",
          title: "Goa Beach Villa",
          location: "Goa",
          country: "India",
          price: 3500,
          avgRating: 4.9,
          images: [{ url: "https://example.com/beach.jpg" }],
        },
      ]),
      sort: jest.fn().mockReturnThis(),
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should return a structured plan with activities and stays", async () => {
    const plan = await generateTravelPlan("Plan a 3-day trip to Goa for 2 guests under 15000");

    expect(plan).toHaveProperty("summary");
    expect(plan).toHaveProperty("destination");
    expect(plan).toHaveProperty("recommendedStays");
    expect(plan).toHaveProperty("suggestedActivities");
    expect(Array.isArray(plan.suggestedActivities)).toBe(true);
    expect(plan.suggestedActivities.length).toBeGreaterThan(0);
    expect(plan.recommendedStays[0].title).toBe("Goa Beach Villa");
  });
});
