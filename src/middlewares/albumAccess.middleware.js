const Album = require("../models/album.model");
const AppError = require("../utils/appError");

const albumAccessMiddleware = async (req, res, next) => {
  try {
    const { albumId } = req.params;

    // check album exists
    const album = await Album.findById(albumId);

    if (!album) {
      throw new AppError("Album not found.", 404);
    }

    // check loggedIn-user is owner or sharedUser
    const isOwner = album.ownerId.toString() === req.user.userId;
    const isSharedUser = album.sharedUsers.includes(req.user.email);

    if (!isOwner && !isSharedUser) {
      throw new AppError("Access denied", 403);
    }

    req.album = album; // reuse later
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = albumAccessMiddleware;
