const express = require("express");

const couponController = require("../controllers/couponController");

const authController = require("../controllers/authController");

// const { getBrandValidator, createBrandValidator, updateBrandValidator, deleteBrandValidator } = require("../utils/validators/brandValidator");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("admin", "manger"));

router
  //
  .route("/")
  .post(couponController.creatCoupon)
  .get(couponController.getCoupons);

router
  //
  .route("/:id")
  .get(couponController.getCoupon)
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
