const Joi = require("joi");
const ApiError = require("../utils/apiError.js");

const listingJoiSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(1),
    category: Joi.string().allow(""),
    image: Joi.any().optional(),
    listingimage: Joi.any().optional(),
    maxGuests: Joi.number().min(1).optional(),
    bedrooms: Joi.number().min(1).optional(),
    beds: Joi.number().min(1).optional(),
    bathrooms: Joi.number().min(1).optional(),
    amenities: Joi.any().optional(),
  }).required(),
});

const reviewJoiSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().min(3),
  }).required(),
});

function validateListing(req, res, next) {
  const { error } = listingJoiSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    req.flash("error", errMsg);
    return res.status(400).redirect("back");
  }
  next();
}

function validateReview(req, res, next) {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    req.flash("error", errMsg);
    return res.status(400).redirect("back");
  }
  next();
}

module.exports = {
  validateListing,
  validateReview,
};
