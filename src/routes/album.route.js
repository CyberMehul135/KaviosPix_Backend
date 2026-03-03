const express = require("express");
const router = express.Router();

const {
  createAlbum,
  getAllAlbums,
  getSharedAlbums,
  shareAlbum,
  deleteAlbum,
} = require("../controllers/album.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const ownerOnlyMiddleware = require("../middlewares/ownerOnly.middleware");
const upload = require("../middlewares/multer.middleware");

router.post("/", authMiddleware, upload.single("coverImage"), createAlbum);
router.get("/", authMiddleware, getAllAlbums);
router.get("/shared", authMiddleware, getSharedAlbums);
router.put("/:albumId/share", authMiddleware, ownerOnlyMiddleware, shareAlbum);
router.delete("/:albumId", authMiddleware, ownerOnlyMiddleware, deleteAlbum);

module.exports = router;
