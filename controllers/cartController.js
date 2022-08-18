/* eslint-disable no-const-assign */
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Product = require("../models/productModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;

  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  cart.totalPrice = totalPrice;

  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

// @desc Add Prod to Cart
// @route POST /api/v1/cart
// @access Privet/User
exports.addProdToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;

  const prod = await Product.findById(productId);

  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    // create cart for logged user with product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color,
          price: prod.price,
        },
      ],
    });
  } else {
    // product exists already in cart, update product quantity
    const productIsExist = cart.cartItems.findIndex((item) => item.product.toString() === productId && item.color === color);

    if (productIsExist > -1) {
      const cartItem = cart.cartItems[productIsExist];
      cartItem.quantity += 1;

      cart.cartItems[productIsExist] = cartItem;
    }
    // push product to cart items, push product to cart items array
    else {
      cart.cartItems.push({
        product: productId,
        color,
        price: prod.price,
      });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    msg: "Cart saved successfully",
    status: "success",
    data: cart,
  });
});

// @desc Get loged user Cart
// @route Get /api/v1/cart
// @access Privet/User
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("There is no cart for this user id"));
  }

  res.status(200).json({
    msg: "success",
    numberOfCaartItrms: cart.cartItems.length,
    data: cart,
  });
});

// @desc Remove specific cart item
// @route DELETE /api/v1/cart/:itemId
// @access Privet/User
exports.removeCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    //
    { user: req.user._id },
    { $pull: { cartItems: { _id: req.params.itemId } } },
    { new: true }
  );

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    msg: "success",
    numberOfCartItrms: cart.cartItems.length,
    data: cart,
  });
});

// @desc clear logged user cart
// @route DELETE /api/v1/cart
// @access Privet/User
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  res.status(204).json({
    msg: "clear successed",
    status: 204,
  });
});

// @desc Update specific cart item quantity
// @route PUT /api/v1/cart/:itemId
// @access Privet/User
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return next(new ApiError("there is no cart for this user", 404));
  }

  const itemIndex = cart.cartItems.findIndex((item) => item._id.toString() === req.params.itemId);

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;

    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new ApiError("there is no item for sended id", 404));
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    msg: "success",
    numberOfCaartItrms: cart.cartItems.length,
    data: cart,
  });
});

// @desc Aplly coupon on lgged user cart
// @route PUT /api/v1/applyCoupon
// @access Privet/User

exports.apllyCoupon = asyncHandler(async (req, res, next) => {
  // 1) get coupon based on  name
  const coupon = await Coupon.findOne({ name: req.body.coupon, expire: { $gt: Date.now() } });

  if (!coupon) {
    return next(new ApiError("Coupon is invalide or expired", 404));
  }

  // 2) Get logged use cart to get totlal price
  const cart = await Cart.findOne({ user: req.user._id });

  const { totalPrice } = cart;

  // 3) calculate total price after discount
  const totalPriceAfterDiscount = (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2);

  cart.totlaPriceAfterDiscount = totalPriceAfterDiscount;

  await cart.save();

  res.status(200).json({
    msg: "success",
    numberOfCaartItrms: cart.cartItems.length,
    data: cart,
  });
});
