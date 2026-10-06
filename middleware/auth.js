const ApiError = require("../utils/apiError.js");

// Require authentication for protected routes
function isLoggedIn(req, res, next) {
  if (!req.session || !req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in to access this page");
    return res.redirect("/login");
  }
  next();
}

// Restrict access by specific role (e.g. host, admin)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      req.flash("error", "You must be logged in");
      return res.redirect("/login");
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      req.flash("error", "You do not have permission to perform this action");
      return res.status(403).render("errors/error.ejs", {
        message: "403 Forbidden: You lack the required permissions to access this resource.",
        statusCode: 403,
      });
    }
    next();
  };
}

// Middleware to inject user and flash messages to all EJS templates
function attachCurrentUser(req, res, next) {
  res.locals.currentUser = req.session ? req.session.user : null;
  res.locals.success = req.flash ? req.flash("success") : [];
  res.locals.error = req.flash ? req.flash("error") : [];
  next();
}

module.exports = {
  isLoggedIn,
  requireRole,
  attachCurrentUser,
};
