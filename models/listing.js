const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    default: "listing_image",
  },
});

const listingSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Listing description is required"],
      trim: true,
    },
    images: {
      type: [imageSchema],
      default: [
        {
          url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
          publicId: "default_cover",
        },
      ],
    },
    price: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [1, "Price must be greater than 0"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Trending",
        "Beachfront",
        "Cabins",
        "Iconic Cities",
        "Mountains",
        "Castles",
        "Amazing Pools",
        "Camping",
        "Farms",
        "Arctic",
        "Luxury",
      ],
      default: "Trending",
    },
    amenities: {
      type: [String],
      default: ["Wifi", "Kitchen", "Free parking", "Air conditioning", "Dedicated workspace"],
    },
    maxGuests: {
      type: Number,
      default: 4,
      min: 1,
    },
    bedrooms: {
      type: Number,
      default: 2,
      min: 1,
    },
    beds: {
      type: Number,
      default: 2,
      min: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
      min: 1,
    },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual single image getter for backward compatibility
listingSchema.virtual("image").get(function () {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
  return {
    url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
    filename: "default_cover",
  };
});

// Database indexes
listingSchema.index({ location: "text", country: "text", title: "text" });
listingSchema.index({ category: 1, price: 1 });
listingSchema.index({ owner: 1 });

const Listing = mongoose.models.Listing || mongoose.model("Listing", listingSchema);
module.exports = Listing;