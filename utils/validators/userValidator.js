const { check, body } = require("express-validator");
const bcrypt = require("bcrypt");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.createUserValidator = [
  //
  check("name")
    //
    .notEmpty()
    .withMessage("User required")
    .isLength({ min: 3 })
    .withMessage("Too short User name"),
  check("email")
    //
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalide email address")
    .custom(async (value) => {
      const email = await User.findOne({ email: value });

      if (email) {
        throw new Error("email is already in use");
      }

      return true;
    }),

  check("password")
    //
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters")
    .custom(async (password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("password confirmation failed");
      }

      return true;
    }),

  check("passwordConfirm").notEmpty(),

  check("image").optional(),

  check("role").optional(),

  validatorMiddleware,
];

exports.getUserValidator = [
  //
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.updateUserValidator = [
  //
  check("id").isMongoId().withMessage("Invalid User id format"),

  check("email")
    //
    .optional()
    .isEmail()
    .withMessage("invalide email address")
    .custom(async (value) => {
      const email = await User.findOne({ email: value });

      if (email) {
        throw new Error("email is already in use");
      }

      return true;
    }),

  validatorMiddleware,
];

exports.deleteUserValidator = [
  //
  check("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    //
    .notEmpty()
    .withMessage("You must enter current password"),
  body("passwordConfirm")
    //
    .notEmpty()
    .withMessage("You must enter password confirm"),
  body("password")
    //
    .notEmpty()
    .withMessage("You must enter password")
    .custom(async (value, { req }) => {
      // 1) verify the current password

      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error(`this is no user for this id : ${req.params.id}`);
      }

      const isEqual = bcrypt.compare(req.body.password, user.password);

      if (!isEqual) {
        throw new Error(`Incorrect current password`);
      }
      // 2) verify the password confirmation

      if (value !== req.body.passwordConfirm) {
        throw new Error(`password confirmation incorrect`);
      }

      return true;
    }),
  validatorMiddleware,
];

exports.changeLoggedUserPasswordValidator = [
  body("currentPassword")
    //
    .notEmpty()
    .withMessage("You must enter current password"),
  body("passwordConfirm")
    //
    .notEmpty()
    .withMessage("You must enter password confirm"),
  body("password")
    //
    .notEmpty()
    .withMessage("You must enter password")
    .custom(async (value, { req }) => {
      // 1) verify the current password

      const user = await User.findById(req.user._id);
      if (!user) {
        throw new Error(`this is no user for this id : ${req.user._id}`);
      }

      const isEqual = bcrypt.compare(req.body.password, user.password);

      if (!isEqual) {
        throw new Error(`Incorrect current password`);
      }
      // 2) verify the password confirmation

      if (value !== req.body.passwordConfirm) {
        throw new Error(`password confirmation incorrect`);
      }

      return true;
    }),
  validatorMiddleware,
];

exports.updateLoddedUserValidator = [
  check("email")
    //
    .optional()
    .isEmail()
    .withMessage("invalide email address")
    .custom(async (value) => {
      const email = await User.findOne({ email: value });

      if (email) {
        throw new Error("email is already in use");
      }

      return true;
    }),

  validatorMiddleware,
];
