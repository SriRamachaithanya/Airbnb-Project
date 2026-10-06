const Review = require("../models/Review.js");
const Listing = require("../models/Listing.js");
const Booking = require("../models/Booking.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.createReview = catchAsync(async (req, res) => {
  const { id: listingId } = req.params;
  const { rating, comment } = req.body.review;
  const userId = req.session.user._id;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Prevent duplicate reviews from the same user for the same listing
  const existingReview = await Review.findOne({ listing: listingId, user: userId });
  if (existingReview) {
    req.flash("error", "You have already submitted a review for this property.");
    return res.redirect(`/listings/${listingId}`);
  }

  // Check if user had a booking for verified review badge
  const userBooking = await Booking.findOne({ listing: listingId, user: userId });

  const newReview = new Review({
    user: userId,
    listing: listingId,
    booking: userBooking ? userBooking._id : undefined,
    rating: Number(rating),
    comment: comment.trim(),
  });

  await newReview.save();

  req.flash("success", "Thank you! Your review has been published.");
  res.redirect(`/listings/${listingId}`);
});

module.exports.deleteReview = catchAsync(async (req, res) => {
  const { id: listingId, reviewId } = req.params;
  const userId = req.session.user._id;
  const isAdmin = req.session.user.role === "admin";

  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${listingId}`);
  }

  if (review.user.toString() !== userId.toString() && !isAdmin) {
    req.flash("error", "You do not have permission to delete this review");
    return res.redirect(`/listings/${listingId}`);
  }

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully.");
  res.redirect(`/listings/${listingId}`);
});
