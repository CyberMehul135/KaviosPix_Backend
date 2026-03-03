const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    commentedBy: {
      type: String, // email
      required: true,
    },
  },
  { timestamps: true },
);

const imageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String, // UUID
      required: true,
      unique: true,
    },
    albumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Cloudinary
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    comments: [commentSchema],
    person: {
      type: String,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Image", imageSchema);
