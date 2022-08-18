const express = require("express");

const subCatController = require("../controllers/subCategoryControllers");

const authController = require("../controllers/authController");

const { createSubCategoryValidator, getSubCategoryValidator, updateSubCategoryValidator, deleteSubCategoryValidator } = require("../utils/validators/subCategoryValidator");

// mergeParams allows you to access to parameters on other routers
// ex: we need to access categoryId from category router
const router = express.Router({ mergeParams: true });

router
  //
  .route("/")
  .get(subCatController.createFilterObj, subCatController.getSubCategories)
  .post(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    subCatController.setCategoryIdToBody,
    createSubCategoryValidator,
    subCatController.creatSubCategory
  );
//
router
  //
  .route("/:id")
  .get(
    //
    getSubCategoryValidator,
    subCatController.getSubCategory
  )
  .put(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    updateSubCategoryValidator,
    subCatController.updateSubCategory
  )
  .delete(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    deleteSubCategoryValidator,
    subCatController.deleteSubCategory
  );
//

module.exports = router;
