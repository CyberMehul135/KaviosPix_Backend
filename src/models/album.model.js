const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    albumId: {
      type: String, // will Create with UUID
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    publicId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedUsers: [
      {
        type: String, // Email based sharing
        lowercase: true,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Album", albumSchema);
