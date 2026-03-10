const Album = require("../models/album.model");
const { v4: uuidv4 } = require("uuid");
const successResponse = require("../utils/successResponse");
const errorResponse = require("../utils/errorResponse");
const AppError = require("../utils/appError");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const {
  validateAlbumData,
  validateShareAlbumData,
} = require("../utils/validation");
const fs = require("fs");
const sendEmail = require("../utils/sendEmails");
const Image = require("../models/image.model");
const mongoose = require("mongoose");

const createAlbum = async (req, res) => {
  try {
    const { name, description, sharedUsers } = req.body;
    const file = req.file;
    const userId = req.user.userId;

    // Validation of data
    validateAlbumData(req);

    // Check Duplicate Entery
    const existingAlbum = await Album.findOne({ name, ownerId: userId });
    if (existingAlbum) {
      throw new AppError("Duplicate entery", 409, [
        {
          filed: "name",
          message: `Album name ${existingAlbum.name} is already exist`,
        },
      ]);
    }

    // Upload to cloudinary
    const result = await uploadOnCloudinary(file.buffer);

    // Save to DB
    const album = new Album({
      albumId: uuidv4(),
      name,
      description,
      ownerId: userId,
      coverImage: result.secure_url,
      publicId: result.public_id,
      sharedUsers,
    });
    const saveAlbum = await album.save();

    successResponse(res, 201, "Album created successfully", {
      album: saveAlbum,
    });
  } catch (err) {
    // File unlink from server in any error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error",
      err.errors,
    );
  }
};

const getAllAlbums = async (req, res) => {
  try {
    const user = req.user;

    const albums = await Album.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(user.userId),
        },
      },
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "albumId",
          as: "images",
        },
      },
      {
        $addFields: {
          imageCount: { $size: "$images" },
        },
      },
      {
        $project: {
          images: 0, // pura images array remove kar diya (sirf count chahiye)
        },
      },
    ]);

    successResponse(res, 200, "Fetch albums successfully", { albums });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error",
      err.errors,
    );
  }
};

const getSharedAlbums = async (req, res) => {
  try {
    const user = req.user;

    const albums = await Album.aggregate([
      {
        $match: {
          ownerId: new mongoose.Types.ObjectId(user.userId),
        },
      },
      {
        $lookup: {
          from: "images",
          localField: "_id",
          foreignField: "albumId",
          as: "images",
        },
      },
      {
        $addFields: {
          imageCount: { $size: "$images" },
        },
      },
      {
        $project: {
          images: 0,
        },
      },
    ]);

    successResponse(res, 200, "Fetch albums successfully", { albums });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error",
      err.errors,
    );
  }
};

const shareAlbum = async (req, res) => {
  try {
    const { emails } = req.body;
    const album = req.album; // from ownerOnlyMiddleware

    // validation of emails
    validateShareAlbumData(req);

    const frontendBaseUrl = process.env.FRONTEND_URL;

    // Add unique emails & send email via nodemailer
    for (let email of emails) {
      // add emails
      if (!album.sharedUsers.includes(email)) {
        album.sharedUsers.push(email);
      }

      const albumLink = `${frontendBaseUrl}/albums/${album._id}`;
      // send mails (nodemailer)
      await sendEmail({
        to: email,
        subject: "Album Invitation",
        html: `
              <h2>You have been invited to view an album</h2>
              <p>Click below to view:</p>
              <a href="${albumLink}">${albumLink}</a>
            `,
      });
    }

    await album.save();

    successResponse(res, 200, "Album shared successfully", { album });
  } catch (err) {
    errorResponse(
      res,
      err.statusCode || 500,
      err.message || "Internal Server Error",
      err.errors,
    );
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const album = req.album;

    // (1) get all images
    const images = await Image.find({ albumId: album._id });

    // (2) delete from cloudinary
    for (const image of images) {
      await deleteFromCloudinary(image.publicId);
    }
    await deleteFromCloudinary(album.publicId);

    // (3) delete from DB
    await Image.deleteMany({ albumId: album._id });
    await album.deleteOne();

    successResponse(res, 200, "Album and its images delete successfully.");
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
  createAlbum,
  getAllAlbums,
  getSharedAlbums,
  shareAlbum,
  deleteAlbum,
};
