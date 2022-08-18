const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc Add Product to wishlist
// @route POST /api/v1/wishlist
// @access Privet/User
exports.addProdToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // add product to wishlist once and see if it already exists will ignore it
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist",
    data: user.wishlist,
  });
});

// @desc Remove Product from wishlist
// @route DELETE /api/v1/wishlist/:prodId
// @access Privet/User
exports.removeProdFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      // remove product from wishlist once and see if it not exists will ignore it
      $pull: { wishlist: req.params.prodId },
    },
    { new: true }
  );

  res.status(200).json({
    status: 200,
    message: "Product removed successfully",
    data: user.wishlist,
  });
});

// @desc get Product to wishlist
// @route GET /api/v1/wishlist
// @access Privet/User
exports.getProdInWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  res.status(200).json({
    status: "success",
    results: user.wishlist.length,
    message: "Product getted successfully",
    data: user.wishlist,
  });
});
