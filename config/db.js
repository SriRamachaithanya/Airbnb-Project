const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.ATLASDB_URL ||
  process.env.DATABASE_URL ||
  "mongodb://127.0.0.1:27017/wanderlust1";

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
    throw new Error(
      `Database connection failed: ${err.message}. Please check your MONGO_URL in environment variables and Atlas IP whitelist.`
    );
  }

  return cached.conn;
}

module.exports = { connectDB, MONGO_URL };
