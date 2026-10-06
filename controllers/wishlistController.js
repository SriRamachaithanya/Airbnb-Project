const Wishlist = require("../models/Wishlist.js");
const Listing = require("../models/Listing.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.getWishlist = catchAsync(async (req, res) => {
  const userId = req.session.user._id;

  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "listings",
    populate: { path: "owner", select: "name" },
  });

  const savedListings = wishlist ? wishlist.listings : [];

  res.render("wishlist/index.ejs", {
    savedListings,
  });
});

module.exports.toggleWishlist = catchAsync(async (req, res) => {
  const userId = req.session.user._id;
  const { listingId } = req.body;

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, listings: [] });
  }

  const index = wishlist.listings.indexOf(listingId);
  let isSaved = false;

  if (index > -1) {
    wishlist.listings.splice(index, 1);
    isSaved = false;
  } else {
    wishlist.listings.push(listingId);
    isSaved = true;
  }

  await wishlist.save();

  if (req.xhr || req.headers.accept?.indexOf("json") > -1) {
    return res.json({ success: true, isSaved, count: wishlist.listings.length });
  }

  req.flash("success", isSaved ? "Saved to wishlist!" : "Removed from wishlist");
  res.redirect("back");
});
