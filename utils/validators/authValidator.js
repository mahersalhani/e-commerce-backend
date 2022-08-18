const { check } = require("express-validator");

const validatorMiddleware = require("../../middlewares/validatorMiddleware");
const User = require("../../models/userModel");

exports.singupValidator = [
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

  validatorMiddleware,
];

exports.loginValidator = [
  check("email")
    //
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("invalide email address"),

  check("password")
    //
    .notEmpty()
    .withMessage("Password required")
    .isLength({ min: 6 })
    .withMessage("password must be at least 6 characters"),
  validatorMiddleware,
];
