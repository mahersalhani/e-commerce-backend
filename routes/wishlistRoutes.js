const express = require("express");

const wishlistController = require("../controllers/wishlistController");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router
  //
  .route("/")
  .post(wishlistController.addProdToWishlist)
  .get(wishlistController.getProdInWishlist);

router.route("/:prodId").delete(wishlistController.removeProdFromWishlist);

module.exports = router;
