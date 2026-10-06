const { generateTravelPlan } = require("../services/recommendationService.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.getTravelPlan = catchAsync(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide a travel destination or query.",
    });
  }

  const travelPlan = await generateTravelPlan(prompt);

  res.json({
    success: true,
    data: travelPlan,
  });
});
