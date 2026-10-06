const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [3, "Comment must be at least 3 characters"],
    },
  },
  { timestamps: true }
);

// Static method to recalculate and update listing average rating and review count
reviewSchema.statics.calcAverageRating = async function (listingId) {
  const stats = await this.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: "$listing",
        avgRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const Listing = mongoose.model("Listing");
  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      avgRating: +stats[0].avgRating.toFixed(2),
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Listing.findByIdAndUpdate(listingId, {
      avgRating: 0,
      reviewCount: 0,
    });
  }
};

// Trigger rating calculation after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.listing);
});

// Trigger rating calculation after remove
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.listing);
  }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
