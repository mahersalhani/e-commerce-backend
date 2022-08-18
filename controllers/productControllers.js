const asyncHandler = require("express-async-handler");

const sharp = require("sharp");

const { v4: uuidv4 } = require("uuid");

const Product = require("../models/productModel");

const factory = require("./handlersFactory");

const { uploadMixOfImages } = require("../middlewares/uploadImageMiddleware");
const { clearImage } = require("../helpers/clearImage");

exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

exports.handleProductImages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  let filePath = "";

  // 1) Image processing for imageCover
  if (req.files.imageCover) {
    if (id) {
      const { imageCover } = await Product.findById(id).select("imageCover");
      filePath = imageCover.split(`${process.env.BASE_URL}/`);
      clearImage(`uploads/${filePath[1]}`);
    }

    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer, { failOnError: false })
      //
      .toFormat("png")
      .jpeg({ quality: 90 })
      .flatten({ background: "#fff" })
      .toFile(`uploads/products/cover/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }

  // 2) Image processing for images

  if (req.files.images) {
    if (id) {
      const { images } = await Product.findById(id).select("images");

      images.forEach((image) => {
        filePath = image.split(`${process.env.BASE_URL}/`);
        clearImage(`uploads/${filePath[1]}`);
      });
    }

    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, i) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${i}.jpeg`;

        await sharp(img.buffer, { failOnError: false })
          //
          .toFormat("png")
          .jpeg({ quality: 90 })
          .flatten({ background: "#fff" })
          .toFile(`uploads/products/images/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );
  }

  next();
});

// @desc Get list of products
// @route GET /api/v1/products
// @access Public
exports.getProducts = factory.getAll(Product, "Products");

// @desc Get spacific products by id
// @route GET /api/v1/products/:id
// @access Public
exports.getProduct = factory.getOne(Product, "reviews");

// @desc Create product
// @route POST /api/v1/products
// @access Privet
exports.creatProduct = factory.CreateOne(Product);

// @desc Update spacific product by id
// @route PUT /api/v1/products/:id
// @access Privet
exports.updateProduct = factory.UpdateOne(Product);

// @desc Delete spacific product by id
// @route DELETE /api/v1/products/:id
// @access Privet
exports.deleteProduct = factory.DeleteOne(Product);

exports.deleteImages = factory.deleteMultipleImages(Product);
