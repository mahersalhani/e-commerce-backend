const express = require("express");

const {
  //
  createCashOrder,
  filterOrderForLoggedUser,
  getAllOrders,
  getSpecificOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  getCheckOutSession,
} = require("../controllers/orderController");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get("/checkout-session/:cartId", authController.allowedTo("user"), getCheckOutSession);

router.get("/", filterOrderForLoggedUser, getAllOrders);

router.get("/:id", getSpecificOrders);

router.put("/:id/pay", authController.allowedTo("admin", "manager"), updateOrderToPaid);

router.put("/:id/deliver", authController.allowedTo("admin", "manager"), updateOrderToDelivered);

router
  //
  .route("/:cartId")
  .post(authController.allowedTo("user"), createCashOrder);

module.exports = router;
