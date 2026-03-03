const Album = require("../models/album.model");
const AppError = require("../utils/appError");

const ownerOnlyMiddleware = async (req, res, next) => {
  try {
    const { albumId } = req.params;

    // check album exist
    const album = await Album.findById(albumId);
    if (!album) {
      throw new AppError("Album not found", 404);
    }

    // check loggedIn-user isOwner
    const isOwner = album.ownerId.toString() === req.user.userId;
    if (!isOwner) {
      throw new AppError("only owner can perform this action", 403);
    }

    req.album = album;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = ownerOnlyMiddleware;
