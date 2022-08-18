const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const subCategory = require("../../models/subCategoryModel");
const ApiError = require("../apiError");

exports.getSubCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.createSubCategoryValidator = [
  check("name")
    //
    .notEmpty()
    .withMessage("SubCategory required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Too short Subcategory name")
    .withMessage("Too long Subcategory name")
    .custom(async (value, { req }) => {
      const name = await subCategory.findOne({ name: value });

      if (name) {
        // const error = new ApiError("Name is already in use", 400);
        throw new Error("Name is already in use");
      }

      return true;
    }),
  check("category")
    //
    .notEmpty()
    .withMessage("subCategory must be belong to category")
    .isMongoId()
    .withMessage("Invalid Category id format"),
  validatorMiddleware,
];

exports.updateSubCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];

exports.deleteSubCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid SubCategory id format"),
  validatorMiddleware,
];
