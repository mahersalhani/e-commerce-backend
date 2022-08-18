const express = require("express");

const authController = require("../controllers/authController");

const {
  //   //
  singupValidator,
  loginValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post(
  "/signup",

  singupValidator,
  authController.signup
);

router.post(
  "/login",

  loginValidator,
  authController.login
);

router.post("/forgotPassword", authController.forgetPassword);

router.post("/verifyResetCode", authController.verifyPasswordResetCode);

router.put("/resetPassword", authController.resetPassword);

module.exports = router;
