if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.ATLASDB_URL ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/wanderlust1";

// Global connection cache for Vercel Serverless
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose.connect(MONGO_URL, opts).then((m) => {
      console.log("Connected to MongoDB successfully");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error("Database connection error:", err.message);
    throw new Error(`Database connection failed: ${err.message}. Please check your MONGO_URL in Vercel environment variables and Atlas IP whitelist.`);
  }

  return cached.conn;
}

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Ensure database connection is active before processing any request
app.use(async (req, res, next) => {
  // Ignore static assets or favicon from blocking
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

// Redirect root to listings
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// Index route - supports category and search filtering
app.get("/listings", async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let queryFilter = {};

    if (category && category !== "All" && category !== "Trending") {
      queryFilter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      queryFilter.$or = [
        { title: { $regex: q, $options: "i" } },
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    let allListings = await Listing.find(queryFilter).sort({ createdAt: -1 });

    // Fallback if specific category returns empty in demo
    if (allListings.length === 0 && category && !search) {
      allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", {
      allListings,
      activeCategory: category || "All",
      searchQuery: search || "",
    });
  } catch (err) {
    next(err);
  }
});

// New listing form route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show individual listing route
app.get("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// Create new listing route
app.post("/listings", async (req, res, next) => {
  try {
    const listingData = req.body.listing;
    if (!listingData) {
      return res.status(400).send("Invalid listing payload");
    }

    // Handle image input as URL string or object
    if (typeof listingData.image === "string") {
      listingData.image = {
        url: listingData.image.trim() || undefined,
        filename: "listingimage",
      };
    } else if (listingData.listingimage) {
      listingData.image = {
        url: listingData.listingimage.trim() || undefined,
        filename: "listingimage",
      };
      delete listingData.listingimage;
    }

    const newListing = new Listing(listingData);
    await newListing.save();
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    next(err);
  }
});

// Edit listing form route
app.get("/listings/:id/edit", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    next(err);
  }
});

// Update listing route
app.put("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }

    const listingData = req.body.listing;
    if (!listingData) {
      return res.status(400).send("Invalid listing payload");
    }

    if (typeof listingData.image === "string") {
      listingData.image = {
        url: listingData.image.trim() || undefined,
        filename: "listingimage",
      };
    } else if (listingData.listingimage) {
      listingData.image = {
        url: listingData.listingimage.trim() || undefined,
        filename: "listingimage",
      };
      delete listingData.listingimage;
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { ...listingData },
      { runValidators: true, new: true }
    );

    res.redirect(`/listings/${updatedListing._id}`);
  } catch (err) {
    next(err);
  }
});

// Delete listing route
app.delete("/listings/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid Listing ID");
    }
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
});

// Static pages
app.get("/privacy", (req, res) => {
  res.send("<h1>Privacy Policy</h1><p>Wanderlust is committed to protecting your privacy.</p><a href='/listings'>Back to Listings</a>");
});

app.get("/terms", (req, res) => {
  res.send("<h1>Terms of Service</h1><p>Welcome to Wanderlust terms and conditions.</p><a href='/listings'>Back to Listings</a>");
});

// 404 handler
app.all("*", (req, res) => {
  res.status(404).send("<h1>404: Page Not Found</h1><a href='/listings'>Return to Home</a>");
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #ff385c;">Application Error</h2>
      <p style="color: #333; font-size: 16px;">${err.message}</p>
      <a href="/listings" style="display: inline-block; margin-top: 15px; padding: 8px 16px; background: #ff385c; color: white; text-decoration: none; border-radius: 4px;">Retry / Go back</a>
    </div>
  `);
});

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;