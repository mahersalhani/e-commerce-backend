const express = require("express");

const brandController = require("../controllers/brandControllers");

const authController = require("../controllers/authController");

const { getBrandValidator, createBrandValidator, updateBrandValidator, deleteBrandValidator } = require("../utils/validators/brandValidator");

const router = express.Router();

router
  //
  .route("/")
  .post(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    brandController.uploadBrandImage,
    createBrandValidator,
    brandController.resize,
    brandController.creatBrand
  )
  .get(brandController.getBrands);

router
  //
  .route("/:id")
  .get(getBrandValidator, brandController.getBrand)
  .put(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    brandController.uploadBrandImage,
    updateBrandValidator,
    brandController.resize,
    brandController.updateBrand
  )
  .delete(
    //
    authController.protect,
    authController.allowedTo("admin"),
    brandController.deleteImage,
    deleteBrandValidator,
    brandController.deleteBrand
  );

module.exports = router;
