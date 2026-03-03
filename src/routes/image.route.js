const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const {
  getAllImages,
  getAllFavouriteImages,
} = require("../controllers/image.controller");

router.get("/all", authMiddleware, getAllImages);
router.get("/favourite", authMiddleware, getAllFavouriteImages);

module.exports = router;
