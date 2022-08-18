const express = require("express");

const { createReviewValidator, updateReviewValidator, getReviewValidator, deleteReviewValidator } = require("../utils/validators/reviewValidator");

const { getReview, getReviews, createReview, updateReview, deleteReview, createFilterObj, setProdIdAndUserIdToBody } = require("../controllers/reviewControllers");

const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  //
  .route("/")
  .get(createFilterObj, getReviews)
  .post(
    //
    authController.protect,
    authController.allowedTo("user"),
    setProdIdAndUserIdToBody,
    createReviewValidator,
    createReview
  );

router
  //
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(
    //
    authController.protect,
    authController.allowedTo("user"),
    updateReviewValidator,
    updateReview
  )
  .delete(
    //
    authController.protect,
    authController.allowedTo("user", "manager", "admin"),
    deleteReviewValidator,
    deleteReview
  );

module.exports = router;
