# 🏠 Wanderlust — Production-Grade Airbnb Vacation Rental Platform

[![Node.js CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com/SriRamachaithanya/Airbnb-Project/actions)
[![Node.js Version](https://img.shields.io/badge/Node.js-18%20%7C%2020-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express%20v4-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel%20Serverless-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

> **Wanderlust** is a modern, production-grade full-stack vacation rental platform inspired by Airbnb. Built on a clean **MVC + Service Layer architecture**, it provides verified guest bookings with double-booking collision prevention, server-authoritative dynamic pricing, real review rating aggregation, wishlist management, interactive maps, role-based host/admin dashboards, and a grounded AI Travel Assistant.

---

## 🌟 Key Highlights & Features

* 🔐 **Secure Authentication & RBAC**: Session-backed authentication with `bcryptjs` password hashing, persistent sessions with `connect-mongo`, and role-based permissions (`guest`, `host`, `admin`).
* 🏷️ **Property Ownership Enforcement**: Only listing owners or platform administrators can modify, edit, or delete property listings.
* 📅 **Booking Engine with Collision Prevention**: Atomic server-side date overlap validation:
  $$\text{existing.checkIn} < \text{requested.checkOut} \quad \land \quad \text{existing.checkOut} > \text{requested.checkIn}$$
* 💰 **Server-Authoritative Dynamic Pricing Engine**: Automatically computes base stay, 14% service fee, cleaning fee, and 10% long-stay discounts for reservations $\ge 7$ nights.
* ⭐ **Real Review & Rating Aggregation**: Calculates live average ratings and review counts via MongoDB aggregation pipelines when verified reviews are submitted.
* 🔍 **Multi-Criteria Filter & Server-Side Pagination**: Real-time filtering by destination, price bounds (`minPrice`, `maxPrice`), guest capacities, and category carousel with `skip()` / `limit()` pagination.
* ❤️ **Wishlist Subsystem**: Interactive asynchronous heart toggle and dedicated `/my-wishlist` page.
* 📊 **Host & Admin Dashboards**:
  * **Host Portal (`/host/dashboard`)**: Earnings metrics, total properties, and incoming reservation tracking.
  * **Admin Panel (`/admin`)**: Platform GMV, user directory, and listing moderation.
* 🗺️ **Interactive Geographic Mapping**: Embedded Leaflet & OpenStreetMap location pins with coordinate mapping.
* 🤖 **Grounded AI Travel Assistant (`POST /api/ai/travel-plan`)**: AI recommendations grounded in real database inventory without hallucinating fake listings.
* 🛡️ **Production Security Hardening**: Integrated `helmet`, `express-rate-limit`, Joi validation schemas, and safe error masking.
* 🧪 **Automated Testing & CI/CD**: Unit and integration test suite with Jest + GitHub Actions automated pipeline.

---

## 🏗️ Architecture & Directory Structure

```
Airbnb-Project/
├── .github/workflows/ci.yml       # GitHub Actions CI/CD Pipeline
├── config/
│   ├── db.js                      # Serverless MongoDB Connection Caching
│   └── cloudinary.js              # Multer & Cloudinary Image Uploads
├── controllers/
│   ├── listingController.js       # Property CRUD, Search & Pagination
│   ├── userController.js          # Authentication, Profile & Sessions
│   ├── bookingController.js       # Checkout, Booking Flow & Cancellation
│   ├── reviewController.js        # Review Submission & Aggregation
│   ├── wishlistController.js      # Wishlist Toggle & Retrieval
│   ├── dashboardController.js     # Host & Admin Metric Dashboards
│   └── aiController.js            # AI Travel Itinerary Assistant
├── middleware/
│   ├── auth.js                    # Session Guard & Role Authorization
│   ├── ownership.js               # Property & Booking Ownership Verification
│   ├── validation.js              # Joi Payload Validation Schemas
│   └── errorHandler.js            # Centralized Error Normalization
├── models/
│   ├── User.js                    # User Model with Role Definitions
│   ├── listing.js                 # Listing Model with Capacities & Indexes
│   ├── Booking.js                 # Reservation Model with Fee Breakdown
│   ├── Review.js                  # Review Model with Rating Aggregation
│   └── Wishlist.js                # User Saved Listings Collection
├── routes/
│   ├── listingRoutes.js           # /listings REST Endpoints
│   ├── userRoutes.js              # /login, /register, /profile
│   ├── bookingRoutes.js           # /listings/:id/book, /my-trips
│   ├── reviewRoutes.js            # /listings/:id/reviews
│   ├── wishlistRoutes.js          # /my-wishlist, /wishlist/toggle
│   ├── dashboardRoutes.js         # /host/dashboard, /admin
│   └── aiRoutes.js                # /api/ai/travel-plan
├── services/
│   ├── pricingService.js          # Authoritative Pricing Calculations
│   ├── bookingService.js          # Date Overlap Collision Engine
│   └── recommendationService.js   # DB-Grounded AI Travel Recommendations
├── utils/
│   ├── apiError.js                # Custom Error Class
│   └── catchAsync.js              # Async Wrapper
├── views/                         # EJS-Mate Templates (Airbnb Design)
│   ├── layouts/boilerplate.ejs
│   ├── includes/ (navbar, footer, flash, aiAssistantModal)
│   ├── listings/ (index, show, new, edit)
│   ├── users/ (login, register, profile)
│   ├── bookings/ (index, show)
│   ├── wishlist/index.ejs
│   ├── dashboard/ (host, admin)
│   ├── pages/ (privacy, terms)
│   └── errors/ (404, error)
├── public/css/style.css           # Modern Airbnb CSS Design System
├── tests/                         # Automated Jest Test Suite
├── app.js                         # Express Server Application
├── vercel.json                    # Vercel Serverless Configuration
└── package.json
```

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Runtime & Framework** | Node.js (v18/v20) & Express.js v4 |
| **Database & ODM** | MongoDB & Mongoose v8 |
| **Session Management** | `express-session` + `connect-mongo` |
| **Authentication** | `bcryptjs` + Cookie Session Store |
| **View Engine** | EJS + `ejs-mate` Layouts |
| **Styling & Icons** | Vanilla CSS (Airbnb tokens) + Bootstrap 5.3 + FontAwesome 6 |
| **Interactive Maps** | Leaflet.js / OpenStreetMap |
| **Validation & Security** | Joi, Helmet.js, Express-Rate-Limit |
| **Image Storage** | Cloudinary + Multer (with URL fallback) |
| **Testing & CI/CD** | Jest, Supertest, GitHub Actions |
| **Cloud Hosting** | Vercel (Serverless Node Functions) |

---

## 🚀 Quickstart & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/SriRamachaithanya/Airbnb-Project.git
cd Airbnb-Project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
MONGO_URL=mongodb://127.0.0.1:27017/wanderlust1
SESSION_SECRET=wanderlust_secret_key_2026
PORT=8080
NODE_ENV=development
```

### 4. Seed Database with Sample Properties
```bash
npm run init-db
```

### 5. Run the Application
```bash
npm start
```
Open **`http://localhost:8080`** in your browser.

---

## 🧪 Running Automated Tests

Run the complete test suite with:
```bash
npm test
```

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub.
2. Import repository in **[Vercel Dashboard](https://vercel.com)**.
3. In **Settings $\rightarrow$ Environment Variables**, configure:
   * `MONGO_URL`: *Your MongoDB Atlas connection URI*
   * `SESSION_SECRET`: *A secure random string*
   * `NODE_ENV`: `production`
4. Deploy!

---

## 📄 License
This project is licensed under the **ISC License**.