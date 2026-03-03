const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const Image = require("../models/image.model");
const Album = require("../models/album.model");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const AppError = require("../utils/appError");
const successResponse = require("../utils/successResponse");
const errorResponse = require("../utils/errorResponse");
const mongoose = require("mongoose");
const {
  validateCreateImageData,
  validateAddCommentData,
  validateAddTagData,
} = require("../utils/validation");

// album specific images
const createImage = async (req, res) => {
  try {
    const file = req.file;
    const albumId = req.params.albumId;

    // Validation of data
    validateCreateImageData(req);
    // Check Duplicate entry

    // Upload to cloudinary
    const result = await uploadOnCloudinary(file.path);

    // Save to DB
    const image = new Image({
      imageId: uuidv4(),
      albumId,
      name: file.originalname,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      size: file.size,
    });
    const saveImage = await image.save();

    successResponse(res, 201, "Image added successfully", { image: saveImage });
  } catch (err) {
    // File unlink from server in any error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const getAlbumImages = async (req, res) => {
  try {
    const albumId = new mongoose.Types.ObjectId(req.params.albumId);

    const result = await Album.aggregate([
      {
        $match: { _id: albumId },
      },
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "albumId",
          as: "images",
        },
      },
    ]);

    successResponse(res, 200, "Images fetched successfully", result[0]);
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const getFavouriteAlbumImages = async (req, res) => {
  try {
    const { albumId } = req.params;

    const favouriteImages = await Image.find({
      albumId,
      isFavourite: true,
    });

    successResponse(res, 200, "Favourite images fetched successfuly", {
      albumImages: favouriteImages,
    });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const likeImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // Check image exists
    const image = await Image.findById(imageId);

    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image is not found" },
      ]);
    }

    // Toggle
    image.isFavourite = !image.isFavourite;

    await image.save();

    successResponse(res, 200, "image liked successfully", { image });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const addComment = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { comment } = req.body;

    // Validation of data
    validateAddCommentData(req);

    // Check image exist
    const image = await Image.findById(imageId);

    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image is not found." },
      ]);
    }

    // Add comment
    image.comments.push({
      text: comment,
      commentedBy: req.user.email,
    });

    await image.save();

    successResponse(res, 200, "Comment added successfully", { image });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const removeComment = async (req, res) => {
  try {
    const { albumId, imageId, commentId } = req.params;

    // check image is exist
    const image = await Image.findOne({
      _id: imageId,
      albumId,
    });

    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image not found." },
      ]);
    }

    // Remove comment
    const updatedImage = await Image.findOneAndUpdate(
      { _id: imageId, albumId },
      {
        $pull: {
          comments: { _id: commentId },
        },
      },
      { new: true },
    );

    successResponse(res, 200, "Comment deleted successfully", {
      image: updatedImage,
    });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const addTags = async (req, res) => {
  try {
    const { imageId } = req.params;
    const { tag } = req.body;

    // 0. validation of data
    validateAddTagData(req);

    // 1. check image exist
    const image = await Image.findById(imageId);
    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image is not found." },
      ]);
    }

    // 2. add tag
    image.tags.push(tag);
    await image.save();

    successResponse(res, 200, "Tag added auccessfully", { image });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const removeTag = async (req, res) => {
  try {
    const { albumId, imageId, tag } = req.params;

    // 0. check image exist
    const image = await Image.findOne({ _id: imageId, albumId });
    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image not found." },
      ]);
    }

    // 1. remove tag
    const updatedImage = await Image.findOneAndUpdate(
      { _id: imageId, albumId },
      {
        $pull: {
          tags: tag,
        },
      },
      { new: true },
    );

    successResponse(res, 200, "tag deleted successfully", {
      image: updatedImage,
    });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const editPerson = async (req, res) => {
  try {
    const { albumId, imageId } = req.params;
    const { person } = req.body;

    // 1. check image exist
    const image = await Image.findOne({ _id: imageId, albumId });
    if (!image) {
      throw new AppError("Validation failed", 400, [
        { field: "image", message: "Image is not found." },
      ]);
    }

    // 2. edit person
    image.person = person;
    await image.save();

    successResponse(res, 200, "Person edited successfully", { image });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;

    // (1) get image
    const image = await Image.findById(imageId);

    // (2) delete from cloudinary
    await deleteFromCloudinary(image.publicId);

    // (3) delete from DB
    await image.deleteOne();

    successResponse(res, 200, "Image delete successfully.");
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

// global
const getAllImages = async (req, res) => {
  try {
    const userId = req.user.userId;

    // (1) find albums where user is owner
    const albums = await Album.find({ ownerId: userId });

    // (2) get user albumIds
    const albumIds = albums.map((album) => album._id);

    // (3) find images of albumIds
    const images = await Image.find({ albumId: { $in: albumIds } });

    successResponse(res, 200, "User images fetched successfully.", { images });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

const getAllFavouriteImages = async (req, res) => {
  try {
    const userId = req.user.userId;

    // (1) find albums where user is owner
    const albums = await Album.find({ ownerId: userId });

    // (2) collect albumIds
    const albumIds = albums.map((album) => album._id);

    // (3) find images of albumIds
    const images = await Image.find({
      albumId: { $in: albumIds },
      isFavourite: true,
    }).populate("albumId");

    successResponse(res, 200, "favourite images fetched successfully.", {
      images,
    });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal server error",
      err.errors,
    );
  }
};

module.exports = {
  createImage,
  getAlbumImages,
  getFavouriteAlbumImages,
  likeImage,
  addComment,
  removeComment,
  addTags,
  removeTag,
  editPerson,
  deleteImage,

  getAllImages,
  getAllFavouriteImages,
};
