const Review = require("../models/reviewModel");

const factory = require("./handlersFactory");

// Nested route
// Get /api/v1/product/:prodId/reviews
exports.createFilterObj = (req, res, next) => {
  //Nested route

  let filterObject = {};

  if (req.params.prodId) {
    filterObject = { product: req.params.prodId };
  }

  req.filterObject = filterObject;

  next();
};

// @desc Get list of Reviews
// @route GET /api/v1/Reviews
// @access Public
exports.getReviews = factory.getAll(Review);

// @desc Get spacific Review by id
// @route GET /api/v1/Reviews/:id
// @access Public
exports.getReview = factory.getOne(Review);

// Nested route
// POST /api/v1/product/:prodId/reviews
exports.setProdIdAndUserIdToBody = (req, res, next) => {
  //Nested route

  if (!req.body.product) {
    req.body.product = req.params.prodId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }

  next();
};

// @desc Create Review
// @route POST /api/v1/Reviews
// @access Privet/user
exports.createReview = factory.CreateOne(Review);

// @desc Update spacific Review by id
// @route PUT /api/v1/Reviews/:id
// @access Privet/user
exports.updateReview = factory.UpdateOne(Review);

// @desc Delete spacific Reviews by id
// @route DELETE /api/v1/Reviews/:id
// @access Privet/user-admin-manger
exports.deleteReview = factory.DeleteOne(Review);
