const asyncHandler = require("express-async-handler");

const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");

const { uploadSingleImage } = require("../middlewares/uploadImageMiddleware");

const Brand = require("../models/brandModel");

const factory = require("./handlersFactory");
const { clearImage } = require("../helpers/clearImage");

// Upload single image
exports.uploadBrandImage = uploadSingleImage("image");

// Image Processing
exports.resize = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const image = req.file;

  let filePath = "";

  if (id) {
    const imageUrl = await Brand.findById(id).select("image");
    filePath = imageUrl.image.split(`${process.env.BASE_URL}/`);
  }

  if (image) {
    if (id) {
      clearImage(`uploads/${filePath[1]}`);
    }
    const filename = `brand-${uuidv4()}-${Date.now()}.png`;

    await sharp(image.buffer, { failOnError: false })
      //
      .toFormat("png")
      .png({ quality: 85 })
      // .ensureAlpha(0)
      .flatten({ background: "#FFFFFF" })
      .toFile(`uploads/brands/${filename}`);

    // Save image into our db
    req.body.image = filename;
  }

  next();
});

// @desc Get list of Brands
// @route GET /api/v1/brands
// @access Public
exports.getBrands = factory.getAll(Brand);

// @desc Get spacific Brand by id
// @route GET /api/v1/brands/:id
// @access Public
exports.getBrand = factory.getOne(Brand);

// @desc Create Brand
// @route POST /api/v1/brands
// @access Privet
exports.creatBrand = factory.CreateOne(Brand);

// @desc Update spacific Brand by id
// @route PUT /api/v1/brands/:id
// @access Privet
exports.updateBrand = factory.UpdateOne(Brand);

// @desc Delete spacific Brands by id
// @route DELETE /api/v1/brands/:id
// @access Privet
exports.deleteBrand = factory.DeleteOne(Brand);

exports.deleteImage = factory.deleteOneImage(Brand);

// exports.updateImage = factory.updateOneImage(Brand);
