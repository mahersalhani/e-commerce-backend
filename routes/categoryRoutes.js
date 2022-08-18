const express = require("express");

const catController = require("../controllers/categoryControllers");

const authController = require("../controllers/authController");

const validator = require("../utils/validators/cateValidators");

const router = express.Router();

const subCategoryRoutes = require("./subCategoryRoutes");

router.use("/:catId/subcategory", subCategoryRoutes);

router
  //
  .route("/")
  .get(catController.getCategories)
  .post(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    catController.uploadCategoryImage,
    validator.createCategoryValidator,
    catController.resize,
    catController.creatCategory
  );

router
  //
  .route("/:id")
  .get(validator.getCategoryValidator, catController.getCategory)
  .put(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    catController.uploadCategoryImage,
    validator.updateCategoryValidator,
    catController.resize,
    catController.updateCategory
  )
  .delete(
    //
    authController.protect,
    authController.allowedTo("admin"),
    catController.deleteImage,
    validator.deleteCategoryValidator,
    catController.deleteCategory
  );

module.exports = router;
