const express = require("express");

const prodController = require("../controllers/productControllers");

const authController = require("../controllers/authController");

const prodValidation = require("../utils/validators/productValidator");

const router = express.Router();

const reviewRoute = require("./reviewRoute");

// POST /products/ID/reviews
// GET /products/ID/reviews
// GET /products/prodID/reviews/revID
router.use("/:prodId/reviews", reviewRoute);

router
  //
  .route("/")
  .get(prodController.getProducts)
  .post(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    prodController.uploadProductImages,
    prodController.handleProductImages,
    prodValidation.createProductValidator,
    prodController.creatProduct
  );

router
  .route("/:id")
  .get(
    //
    prodValidation.getProductValidator,
    prodController.getProduct
  )
  .put(
    //
    authController.protect,
    authController.allowedTo("admin", "manger"),
    prodController.uploadProductImages,
    prodController.handleProductImages,
    prodValidation.updateProductValidator,
    prodController.updateProduct
  )
  .delete(
    //
    authController.protect,
    authController.allowedTo("admin"),
    prodController.deleteImages,
    prodValidation.deleteProductValidator,
    prodController.deleteProduct
  );

module.exports = router;
