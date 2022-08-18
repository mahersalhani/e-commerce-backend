const { check } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddleware");

const Brand = require("../../models/brandModel");

exports.getBrandValidator = [
  //
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
];

exports.createBrandValidator = [
  //
  check("name")
    //
    .notEmpty()
    .withMessage("Brand required")
    .isLength({ min: 3, max: 32 })
    .withMessage("Too short Brand name")
    .withMessage("Too long Brand name")
    .custom(async (value, { req }) => {
      const name = await Brand.findOne({ name: value });

      if (name) {
        throw new Error("Name is already in use");
      }

      return true;
    }),
  validatorMiddleware,
];

exports.updateBrandValidator = [
  //
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  check("name").custom(async (value, { req }) => {
    const name = await Brand.findOne({ name: value });

    if (name) {
      throw new Error("Name is already in use");
    }

    return true;
  }),
  validatorMiddleware,
];

exports.deleteBrandValidator = [
  //
  check("id").isMongoId().withMessage("Invalid Brand id format"),
  validatorMiddleware,
];
