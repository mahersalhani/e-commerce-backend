const asyncHandler = require("express-async-handler");
const Stripe = require("stripe");
const dotenv = require("dotenv");

dotenv.config({ path: "../config.env" });

// const stripe = Stripe("sk_test_51LRcQoHzkVaFXcodMsBq2IpGe3i0FakbW7qPiRCPcAcumklStHAKLimkAiwLJfvI64JOZKameuDPAKcy7lcvtqbe00UUPmm0wh");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");

const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel");

// @desc create cash order
// @route POST /api/v1/orders/:cartId
// @access Privet/User
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get Cart depend on cart id
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(new ApiError("there is no such cart with this is", 404));
  }

  // 2) Get order price deppend on cart price "Check if coupon apply"
  const cartPrice = cart.totlaPriceAfterDiscount ? cart.totlaPriceAfterDiscount : cart.totalPrice;
  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create Order with defult paymentMethod
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity and increment product sold
  if (order) {
    const bulkOpt = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOpt, {});
    // 5) clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

exports.filterOrderForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObject = { user: req.user._id };

  next();
});

// @desc get all orders
// @route GET /api/v1/orders
// @access Privet/User-Admin-Management
exports.getAllOrders = factory.getAll(Order);

// @desc get order
// @route GET /api/v1/orders
// @access Privet/User-Admin-Management
exports.getSpecificOrders = factory.getOne(Order);

// @desc Update order paid status
// @route PUT /api/v1/orders/:id/pay
// @access Privet/User-Admin-Management
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError("There is no such order for this id", 404));
  }

  // update order to paid

  order.isPaid = true;
  order.paidAt = Date.now();

  const UpdatedOrder = await order.save();

  res.status(200).json({
    status: 200,
    msg: "success",
    data: UpdatedOrder,
  });
});

// @desc Update order deliver status
// @route PUT /api/v1/orders/:id/deliver
// @access Privet/User-Admin-Management
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ApiError("There is no such order for this id", 404));
  }

  // update order to paid

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const UpdatedOrder = await order.save();

  res.status(200).json({
    status: 200,
    msg: "success",
    data: UpdatedOrder,
  });
});

// @desc get check out session from stripe and send it as response
// @route GET /api/v1/orders/checkout-session/:cartId
// @access Privet/User
exports.getCheckOutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get Cart depend on cart id
  const cart = await Cart.findById(req.params.cartId);

  if (!cart) {
    return next(new ApiError("there is no such cart with this is", 404));
  }

  // 2) Get order price deppend on cart price "Check if coupon apply"
  const cartPrice = cart.totlaPriceAfterDiscount ? cart.totlaPriceAfterDiscount : cart.totalPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalOrderPrice * 100,
        currency: "TRY",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const createCartOrder = async (session) => {
  const cartId = session.client_reference_id;

  const shippingAddress = session.metadata;

  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);

  const user = await User.findOne({ email: session.customer_email });

  // create order
  const order = await Order.create({
    user,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethod: "card",
  });

  // 4) After creating order, decrement product quantity and increment product sold
  if (order) {
    const bulkOpt = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    await Product.bulkWrite(bulkOpt, {});
    // 5) clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

exports.webhookCheckOut = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIP_WEBHOOK_SECRET);
  } catch (e) {
    return res.status(404).send(`webhook Error: ${e.message}`);
  }

  if (event.type === "checkout.session.completed") {
    // create order

    createCartOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
