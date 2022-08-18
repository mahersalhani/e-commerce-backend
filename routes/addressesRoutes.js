const express = require("express");

const addressesController = require("../controllers/addressesController");

const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.allowedTo("user"));

router
  //
  .route("/")
  .post(addressesController.addAdress)
  .get(addressesController.getAddresses);

router
  //
  .route("/:addressId")
  .get(addressesController.getAddress)
  .delete(addressesController.removeAdress)
  .put(addressesController.updateAddress);

module.exports = router;
