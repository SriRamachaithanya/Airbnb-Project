const Listing = require("../models/Listing.js");
const Review = require("../models/Review.js");
const Wishlist = require("../models/Wishlist.js");
const catchAsync = require("../utils/catchAsync.js");
const ApiError = require("../utils/apiError.js");

module.exports.index = catchAsync(async (req, res) => {
  const { category, search, location, minPrice, maxPrice, guests, bedrooms, page = 1, limit = 12 } = req.query;

  const queryFilter = {};

  // Category filter
  if (category && category !== "All" && category !== "Trending") {
    queryFilter.category = new RegExp(`^${category}$`, "i");
  }

  // Location / General Search query
  const searchKeyword = search || location;
  if (searchKeyword && searchKeyword.trim() !== "") {
    const q = searchKeyword.trim();
    queryFilter.$or = [
      { title: { $regex: q, $options: "i" } },
      { location: { $regex: q, $options: "i" } },
      { country: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
  }

  // Price range filters
  if (minPrice || maxPrice) {
    queryFilter.price = {};
    if (minPrice) queryFilter.price.$gte = Number(minPrice);
    if (maxPrice) queryFilter.price.$lte = Number(maxPrice);
  }

  // Guest and bedroom capacities
  if (guests) {
    queryFilter.maxGuests = { $gte: Number(guests) };
  }
  if (bedrooms) {
    queryFilter.bedrooms = { $gte: Number(bedrooms) };
  }

  // Server-side Pagination
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const totalListings = await Listing.countDocuments(queryFilter);
  const totalPages = Math.ceil(totalListings / limitNum) || 1;

  let allListings = await Listing.find(queryFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  // Fallback for empty category in demo mode
  if (allListings.length === 0 && category && !searchKeyword && !minPrice && !maxPrice) {
    allListings = await Listing.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean();
  }

  // Check current user's wishlist IDs
  let savedListingIds = [];
  if (req.session && req.session.user) {
    const wishlist = await Wishlist.findOne({ user: req.session.user._id });
    if (wishlist) {
      savedListingIds = wishlist.listings.map((id) => id.toString());
    }
  }

  res.render("listings/index.ejs", {
    allListings,
    activeCategory: category || "All",
    searchQuery: searchKeyword || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    guests: guests || "",
    currentPage: pageNum,
    totalPages,
    totalListings,
    savedListingIds,
  });
});

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = catchAsync(async (req, res) => {
  const listingData = req.body.listing;
  if (!listingData) {
    throw new ApiError(400, "Invalid listing payload");
  }

  // Associate owner
  if (req.session && req.session.user) {
    listingData.owner = req.session.user._id;
  }

  // Parse uploaded images or image URL
  const images = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((f) => {
      images.push({ url: f.path, publicId: f.filename });
    });
  } else if (req.file) {
    images.push({ url: req.file.path, publicId: req.file.filename });
  } else if (listingData.image && typeof listingData.image === "string") {
    images.push({ url: listingData.image.trim(), publicId: "url_upload" });
  } else if (listingData.listingimage) {
    images.push({ url: listingData.listingimage.trim(), publicId: "url_upload" });
  }

  if (images.length > 0) {
    listingData.images = images;
  }

  const newListing = new Listing(listingData);
  await newListing.save();

  req.flash("success", "Successfully published new listing!");
  res.redirect(`/listings/${newListing._id}`);
});

module.exports.showListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate("owner", "name email profileImage role");

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  // Fetch verified reviews
  const reviews = await Review.find({ listing: id })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 });

  // Check if saved in user's wishlist
  let isSaved = false;
  if (req.session && req.session.user) {
    const wishlist = await Wishlist.findOne({
      user: req.session.user._id,
      listings: id,
    });
    isSaved = !!wishlist;
  }

  res.render("listings/show.ejs", {
    listing,
    reviews,
    isSaved,
  });
});

module.exports.renderEditForm = catchAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
});

module.exports.updateListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  const listingData = req.body.listing;

  // Handle image replacement if provided
  const images = [];
  if (req.files && req.files.length > 0) {
    req.files.forEach((f) => {
      images.push({ url: f.path, publicId: f.filename });
    });
    listingData.images = images;
  } else if (listingData.image && typeof listingData.image === "string" && listingData.image.trim() !== "") {
    listingData.images = [{ url: listingData.image.trim(), publicId: "url_upload" }];
  }

  const updatedListing = await Listing.findByIdAndUpdate(
    id,
    { ...listingData },
    { runValidators: true, new: true }
  );

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${updatedListing._id}`);
});

module.exports.deleteListing = catchAsync(async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  await Review.deleteMany({ listing: id });

  req.flash("success", "Listing deleted successfully");
  res.redirect("/listings");
});
