const { check, body } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const Category = require("../../models/categoryModel");

exports.getCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];

exports.createCategoryValidator = [
  //
  body("name")
    //
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Too short category name")
    .custom(async (value, { req }) => {
      const name = await Category.findOne({ name: value });

      if (name) {
        throw new Error("Name is already in use");
      }

      return true;
    }),
  validatorMiddleware,
];

exports.updateCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid category id format"),
  check("name").custom(async (value, { req }) => {
    const name = await Category.findOne({ name: value });

    if (name) {
      throw new Error("Name is already in use");
    }

    return true;
  }),
  validatorMiddleware,
];

exports.deleteCategoryValidator = [
  //
  check("id").isMongoId().withMessage("Invalid category id format"),
  validatorMiddleware,
];
