const Listing = require("../models/Listing.js");
const Booking = require("../models/Booking.js");
const User = require("../models/User.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.renderHostDashboard = catchAsync(async (req, res) => {
  const hostId = req.session.user._id;

  const myListings = await Listing.find({ owner: hostId }).sort({ createdAt: -1 });
  const listingIds = myListings.map((l) => l._id);

  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate("listing", "title location price")
    .populate("user", "name email phone")
    .sort({ createdAt: -1 });

  const totalListings = myListings.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const avgRating =
    myListings.length > 0
      ? +(
          myListings.reduce((sum, l) => sum + (l.avgRating || 4.8), 0) /
          myListings.length
        ).toFixed(2)
      : 0;

  res.render("dashboard/host.ejs", {
    myListings,
    bookings,
    stats: {
      totalListings,
      activeBookings,
      totalRevenue,
      avgRating,
    },
  });
});

module.exports.renderAdminDashboard = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments({});
  const totalHosts = await User.countDocuments({ role: "host" });
  const totalListings = await Listing.countDocuments({});
  const totalBookings = await Booking.countDocuments({});

  const allBookings = await Booking.find({})
    .populate("listing", "title price location")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(10);

  const allUsers = await User.find({}).sort({ createdAt: -1 }).limit(10);
  const allListings = await Listing.find({}).populate("owner", "name email").sort({ createdAt: -1 }).limit(10);

  const totalRevenue = (await Booking.find({ status: { $in: ["confirmed", "completed"] } })).reduce(
    (sum, b) => sum + (b.totalPrice || 0),
    0
  );

  res.render("dashboard/admin.ejs", {
    stats: {
      totalUsers,
      totalHosts,
      totalListings,
      totalBookings,
      totalRevenue,
    },
    latestBookings: allBookings,
    latestUsers: allUsers,
    latestListings: allListings,
  });
});
