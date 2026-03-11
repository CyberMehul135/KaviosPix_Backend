const express = require("express");
const router = express.Router({ mergeParams: true });

const authMiddleware = require("../middlewares/auth.middleware");
const albumAccessMiddleware = require("../middlewares/albumAccess.middleware");
const ownerOnlyMiddleware = require("../middlewares/ownerOnly.middleware");
const upload = require("../middlewares/multer.middleware");
const {
  createImage,
  getAlbumImages,
  getFavouriteAlbumImages,
  getAlbumImagesTags,
  likeImage,
  addComment,
  deleteImage,
  addTags,
  removeTag,
  editPerson,
  removeComment,
} = require("../controllers/image.controller");

// Album-wise Images :
router.post(
  "/",
  authMiddleware,
  ownerOnlyMiddleware,
  upload.single("image"),
  createImage,
);
router.get("/", authMiddleware, albumAccessMiddleware, getAlbumImages);
router.get(
  "/favourite",
  authMiddleware,
  albumAccessMiddleware,
  getFavouriteAlbumImages,
);
router.get("/tags", authMiddleware, albumAccessMiddleware, getAlbumImagesTags);
router.put(
  "/:imageId/favourite",
  authMiddleware,
  albumAccessMiddleware,
  likeImage,
);
router.put(
  "/:imageId/comments",
  authMiddleware,
  albumAccessMiddleware,
  addComment,
);
router.put(
  "/:imageId/comments/:commentId",
  authMiddleware,
  albumAccessMiddleware,
  removeComment,
);
router.put("/:imageId/tags", authMiddleware, albumAccessMiddleware, addTags);
router.put(
  "/:imageId/tags/:tag",
  authMiddleware,
  albumAccessMiddleware,
  removeTag,
);
router.put("/:imageId/person", authMiddleware, ownerOnlyMiddleware, editPerson);

router.delete("/:imageId", authMiddleware, ownerOnlyMiddleware, deleteImage);

module.exports = router;
