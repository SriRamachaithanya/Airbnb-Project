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

// Database Connection with caching for Serverless / Vercel
let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  if (!process.env.MONGO_URL && !process.env.MONGODB_URI && !process.env.ATLASDB_URL && process.env.NODE_ENV === "production") {
    console.error("CRITICAL: No MongoDB Atlas connection URI provided in Vercel Environment Variables!");
  }
  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
  }
}

connectDB();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
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
  res.status(500).send(`<h3>Something went wrong!</h3><p>${err.message}</p><a href='/listings'>Go back</a>`);
});

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;