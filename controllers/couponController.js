const factory = require("./handlersFactory");

const Coupon = require("../models/couponModel");

// @desc Get list of Coupon
// @route GET /api/v1/coupons
// @access Public
exports.getCoupons = factory.getAll(Coupon);

// @desc Get spacific Coupon by id
// @route GET /api/v1/coupons/:id
// @access Public
exports.getCoupon = factory.getOne(Coupon);

// @desc Create Coupon
// @route POST /api/v1/coupons
// @access Privet
exports.creatCoupon = factory.CreateOne(Coupon);

// @desc Update spacific Coupon by id
// @route PUT /api/v1/coupons/:id
// @access Privet
exports.updateCoupon = factory.UpdateOne(Coupon);

// @desc Delete spacific Coupon by id
// @route DELETE /api/v1/coupons/:id
// @access Privet
exports.deleteCoupon = factory.DeleteOne(Coupon);
