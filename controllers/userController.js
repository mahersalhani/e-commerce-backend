const asyncHandler = require("express-async-handler");

const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");
const { default: slugify } = require("slugify");
const bcrypt = require("bcrypt");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const User = require("../models/userModel");

const factory = require("./handlersFactory");
const { clearImage } = require("../helpers/clearImage");
const ApiError = require("../utils/apiError");
const { createToken } = require("../utils/createToken");

// Upload single image
exports.uploadUserImage = uploadSingleImage("image");

// Image Processing
exports.resize = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const image = req.file;

  let filePath = "";

  if (id) {
    const imageUrl = await User.findById(id).select("image");

    filePath = imageUrl.image.split(`${process.env.BASE_URL}/`);
  }

  if (image) {
    if (id) {
      clearImage(`uploads/${filePath[1]}`);
    }
    const filename = `user-${uuidv4()}-${Date.now()}.png`;

    await sharp(image.buffer)
      //
      .toFormat("png")
      .png({ quality: 85 })
      // .ensureAlpha(0)
      .flatten({ background: "#FFFFFF" })
      .toFile(`uploads/users/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

// @desc Get list of Users
// @route GET /api/v1/users
// @access Privet
exports.getUsers = factory.getAll(User);

// @desc Get spacific User by id
// @route GET /api/v1/users/:id
// @access Privet
exports.getUser = factory.getOne(User);

// @desc Create User
// @route POST /api/v1/users
// @access Privet
exports.creatUser = factory.CreateOne(User);

// @desc Update spacific User by id
// @route PUT /api/v1/users/:id
// @access Privet
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (name) {
    req.body.slug = slugify(name);
  }

  try {
    const document = await User.findByIdAndUpdate(
      id,
      {
        name,
        slug: req.body.slug,
        email: req.body.email,
        image: req.body.image,
        role: req.body.role,
      },
      { new: true }
    );

    if (!document) {
      const err = res.json(new ApiError(`No Document Found in This ID:${id}`, 404));
      return next(err);
    }

    res.status(201).json({
      message: "Update Document Succeed",
      data: document,
    });
  } catch (err) {
    console.log("err");
  }
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { password } = req.body;

  // hashed password
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const document = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
        passwordChangedAt: Date.now(),
      },
      { new: true }
    );

    if (!document) {
      const err = res.json(new ApiError(`No Document Found in This ID:${id}`, 404));
      return next(err);
    }

    res.status(201).json({
      message: "Update Document Succeed",
      data: document,
    });
  } catch (err) {
    console.log("err");
  }
});

// @desc Delete spacific Users by id
// @route DELETE /api/v1/users/:id
// @access Privet
exports.deleteUser = factory.DeleteOne(User);

// @desc get logged users data
// @route DELETE /api/v1/users
// @access Privet
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc update logged users Password
// @route PUT /api/v1/users
// @access Privet

exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { password } = req.body;

  // hashed password
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.findByIdAndUpdate(
    id,
    {
      password: hashedPassword,
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  const token = createToken(user._id);

  res.status(200).json({ data: user, token });
});

// @desc update logged users data without password
// @route PUT /api/v1/updateMe
// @access Privet
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const { name, email } = req.body;
  let slug;

  if (name) {
    slug = slugify(name, "-");
  }

  const updateUser = await User.findByIdAndUpdate(
    id,
    {
      name,
      email,
      slug,
    },
    {
      new: true,
    }
  );

  res.status(200).json({ data: updateUser, msg: "update user successfully" });
});

// @desc Devtivate logged user
// @route PUT /api/v1/daleteMe
// @access Privet

exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ message: "Succeed" });
});

exports.deleteImage = factory.deleteOneImage(User);
