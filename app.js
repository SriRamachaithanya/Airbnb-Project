if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { connectDB, MONGO_URL } = require("./config/db.js");
const { attachCurrentUser } = require("./middleware/auth.js");
const errorHandler = require("./middleware/errorHandler.js");

// Route Modules
const listingRoutes = require("./routes/listingRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const bookingRoutes = require("./routes/bookingRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const wishlistRoutes = require("./routes/wishlistRoutes.js");
const dashboardRoutes = require("./routes/dashboardRoutes.js");
const aiRoutes = require("./routes/aiRoutes.js");

// Connect Database
connectDB();

// EJS View Engine Configuration
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Request Parsing & Method Override
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Security: Helmet Configuration with relaxed CSP for CDN stylesheets & images
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external Unsplash/CDN images & Map assets
    crossOriginEmbedderPolicy: false,
  })
);

// Security: Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Session Store Configuration
const sessionSecret = process.env.SESSION_SECRET || "wanderlustSuperSecretSessionKey2026";
const store = MongoStore.create({
  mongoUrl: MONGO_URL,
  crypto: {
    secret: sessionSecret,
  },
  touchAfter: 24 * 3600, // Touch session only once every 24 hours
});

store.on("error", (err) => {
  console.error("SESSION STORE ERROR:", err);
});

const sessionConfig = {
  store,
  name: "wanderlust_session",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "lax",
  },
};

app.use(session(sessionConfig));
app.use(flash());

// Ensure database connection is active before processing dynamic requests
app.use(async (req, res, next) => {
  if (req.path === "/favicon.ico" || req.path.startsWith("/css/")) {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Attach Current User & Flash Messages to locals for all EJS templates
app.use(attachCurrentUser);

// Root route redirects to listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Mount Routes
app.use("/", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);
app.use("/", bookingRoutes);
app.use("/", wishlistRoutes);
app.use("/", dashboardRoutes);
app.use("/", aiRoutes);

// Static Info Pages
app.get("/privacy", (req, res) => {
  res.render("pages/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("pages/terms.ejs");
});

// 404 Handler
app.all("*", (req, res) => {
  res.status(404).render("errors/404.ejs");
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Wanderlust Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;