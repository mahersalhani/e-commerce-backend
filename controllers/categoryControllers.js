const asyncHandler = require("express-async-handler");

const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");
const { clearImage } = require("../helpers/clearImage");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const Category = require("../models/categoryModel");

const factory = require("./handlersFactory");

// Upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

// Image Processing
exports.resize = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const image = req.file;

  let filePath = "";

  if (id) {
    const imageUrl = await Category.findById(id).select("image");
    filePath = imageUrl.image.split(`${process.env.BASE_URL}/`);
  }

  if (image) {
    if (id) {
      clearImage(`uploads/${filePath[1]}`);
    }

    const filename = `category-${uuidv4()}-${Date.now()}.png`;

    await sharp(image.buffer, { failOnError: false })
      //
      // .resize(700, 600)
      .toFormat("png")
      .png({ quality: 85 })
      .ensureAlpha(0)
      .toFile(`uploads/categories/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

// @desc Get list of categories
// @route GET /api/v1/categories
// @access Public
exports.getCategories = factory.getAll(Category);

// @desc Get spacific category by id
// @route GET /api/v1/categories/:id
// @access Public
exports.getCategory = factory.getOne(Category);

// @desc Create category
// @route POST /api/v1/categories
// @access Privet
exports.creatCategory = factory.CreateOne(Category);

// @desc Update spacific category by id
// @route PUT /api/v1/categories/:id
// @access Privet
exports.updateCategory = factory.UpdateOne(Category);

// @desc Delete spacific category by id
// @route DELETE /api/v1/categories/:id
// @access Privet
exports.deleteCategory = factory.DeleteOne(Category);

exports.deleteImage = factory.deleteOneImage(Category);
