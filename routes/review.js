const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
  isntOwner,
} = require("../middleware.js");

const reviewController = require("../controllers/review.js");

// Reviews
// Post Review Route
router.post(
  "/",
  isLoggedIn,
  isntOwner,
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Review Route

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,

  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
