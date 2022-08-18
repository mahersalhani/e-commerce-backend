const express = require("express");

const { apllyCoupon, addProdToCart, removeCartItem, getLoggedUserCart, clearCart, updateCartItemQuantity } = require("../controllers/cartController");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router
  //
  .route("/")
  .post(addProdToCart)
  .get(getLoggedUserCart)
  .delete(clearCart);

router.route("/applyCoupon").put(apllyCoupon);

router
  //
  .route("/:itemId")
  .put(updateCartItemQuantity)
  .delete(removeCartItem);

module.exports = router;
