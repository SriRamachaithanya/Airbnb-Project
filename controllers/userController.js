const User = require("../models/User.js");
const Booking = require("../models/Booking.js");
const Listing = require("../models/Listing.js");
const catchAsync = require("../utils/catchAsync.js");

module.exports.renderRegisterForm = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/listings");
  }
  res.render("users/register.ejs");
};

module.exports.registerUser = catchAsync(async (req, res) => {
  const { name, email, password, role = "guest", phone = "" } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    req.flash("error", "An account with this email already exists.");
    return res.redirect("/register");
  }

  const passwordHash = await User.hashPassword(password);
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    phone: phone.trim(),
  });

  await user.save();

  // Establish session
  req.session.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
  };

  req.flash("success", `Welcome to Wanderlust, ${user.name}!`);
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

module.exports.renderLoginForm = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/listings");
  }
  res.render("users/login.ejs");
};

module.exports.loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/login");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/login");
  }

  req.session.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
  };

  req.flash("success", `Welcome back, ${user.name}!`);
  const redirectUrl = req.session.returnTo || "/listings";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

module.exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/listings");
  });
};

module.exports.renderProfile = catchAsync(async (req, res) => {
  const userId = req.session.user._id;
  const user = await User.findById(userId);

  const bookingsCount = await Booking.countDocuments({ user: userId });
  const hostedListingsCount = await Listing.countDocuments({ owner: userId });

  res.render("users/profile.ejs", {
    user,
    bookingsCount,
    hostedListingsCount,
  });
});

module.exports.updateProfile = catchAsync(async (req, res) => {
  const userId = req.session.user._id;
  const { name, phone, profileImage } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, phone, profileImage },
    { new: true, runValidators: true }
  );

  req.session.user.name = updatedUser.name;
  req.session.user.profileImage = updatedUser.profileImage;

  req.flash("success", "Profile updated successfully!");
  res.redirect("/profile");
});
