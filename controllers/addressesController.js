const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc Add Adress to user adresses list
// @route POST /api/v1/adresses
// @access Privet/User
exports.addAdress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully to your adresses list.",
    data: user.addresses,
  });
});

// @desc Remove Address from Adresses List
// @route DELETE /api/v1/adresses/:addressId
// @access Privet/User
exports.removeAdress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});

// @desc Get Addresses
// @route GET /api/v1/addresses
// @access Privet/User
exports.getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    message: "addressed getted successfully",
    data: user.addresses,
  });
});

// @desc Get Address
// @route GET /api/v1/addresses/:addressId
// @access Privet/User
exports.getAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  return res.status(200).json({
    status: "success",
    data: address,
    msg: "Getting addres succeded",
  });
});

// @desc      update address from addresses list
// @route     PUT /api/v1/addresses/:addressId
// @access    Private/User
exports.updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const address = user.addresses.id(req.params.addressId);

  address.alias = req.body.alias || address.alias;
  address.details = req.body.details || address.details;
  address.phone = req.body.phone || address.phone;
  address.city = req.body.city || address.city;
  address.postalCode = req.body.postalCode || address.postalCode;

  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Address updated successfully",
    data: address,
  });
});
