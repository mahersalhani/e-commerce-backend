const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ApiError = require("../utils/apiError");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmails");
const { createToken } = require("../utils/createToken");
const { sanitzeUser } = require("../utils/sanitizeData");

// @desc singup
// @route POST /api/v1/auth/singup
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1- Create user
  const { email, password, name } = req.body;

  const user = await User.create({ name, email, password });

  // 2- Generate user
  const token = createToken(user._id);

  res.status(201).json({ data: sanitzeUser(user), token });
});

// @desc singup
// @route POST /api/v1/auth/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1- check if password and email are exists

  // 2- check if user is exists
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  const isEqual = await bcrypt.compare(password, user.password);

  if (!isEqual) {
    return next(new ApiError("Incorrect email or password", 401));
  }
  // 3- generate token

  const token = createToken(user._id);

  // 4- send response to client side

  res.status(200).json({ data: sanitzeUser(user), token });
});

// @desc make sure the user is loged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) check if token exists, if exists get

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("You do not have permission to access", 401));
  }

  // 2) verify token (no change happens, expired token)

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  // 3) check if user is exists

  const user = await User.findOne({ _id: decoded.userId });

  if (!user) {
    return next(new ApiError("The user that belong to this token does no longer exists", 401));
  }

  // 4) check if user change his password after token created if (currentUser.passwordChangedAt) {
  let passChangedTimestamp = 0;

  if (user.passwordChangedAt) {
    passChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);
  }
  // Password changed after token created (Error)
  if (passChangedTimestamp > decoded.iat) {
    return next(new ApiError("User recently changed his password. please login again..", 401));
  }

  req.user = user;

  next();
});

// @desc Authorization (User Permissions)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access the roles
    // 2) access registed user

    if (!roles.includes(req.user.role)) {
      return next(new ApiError("you are not allowed to access this route", 403));
    }

    next();
  });

// @desc Forget Password
// @route POST /api/v1/auth/forgotPassword
// @access Public
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user by email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ApiError(`there is no user with email ${req.body.email}`, 404));
  }
  // 2) if user is exists, Generate hash reset random 6 digit and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  const hashResetCode = crypto
    //
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashResetCode;
  // Add expiration time for password reset code (10 minutes)
  user.passwordResetCodeExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetCodeVerify = false;

  await user.save();

  // 3) Send the reset code via email

  const options = {
    email: user.email,
    subject: "Your password reset code (valid for 10 minutes)",
    message: `
    <h1>Hi ${user.name},</h1> 
    <h4>We received your request to reset your password on your E-shop Account.</h4>
    <h3>YOUR CODE:</h3> <h2>${resetCode}</h2>
    <h4>Enter this code to complete your reset.</h4>
    `,
  };

  try {
    await sendEmail(options);
  } catch (e) {
    user.passwordResetCode = undefined;
    user.passwordResetCodeExpires = undefined;
    user.passwordResetCodeVerify = undefined;

    await user.save();

    console.log(e);

    return next(new ApiError("there is error in sending email", 500));
  }

  res.status(200).json({ status: "success", mesaage: "Reset Code Sended Successfully" });
});

// @desc Verify password reset code
// @route POST /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reser code
  const { resetCode } = req.body;

  const hashResetCode = crypto
    //
    .createHash("sha256")
    .update(`${resetCode}`)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashResetCode,
    passwordResetCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError("Reset code invalide or expired", 404));
  }

  // 2) Reset code valid
  user.passwordResetCodeVerify = true;

  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc      Reset password
// @route     POST /api/v1/auth/resetPassword
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ApiError(`There is no user with this email address ${req.body.email}`, 404));
  }

  // Check if user verify the reset code

  if (!user.passwordResetCodeVerify) {
    return next(new ApiError("reset code not verified", 400));
  }

  // 2) Update user password & Hide passwordResetCode & passwordResetCodeExpires from the result
  user.password = req.body.newPassword;
  user.passwordResetCode = undefined;
  user.passwordResetCodeExpires = undefined;
  user.passwordResetCodeVerify = undefined;

  await user.save();

  // 3) If everything ok, send token to client
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(200).json({ token });
});
