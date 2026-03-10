const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     if (!localFilePath) return null;

//     // Upload to cloudinary
//     const response = await cloudinary.uploader.upload(localFilePath, {
//       folder: "upload",
//     });

//     // Delete local file after successful uploaded
//     fs.unlinkSync(localFilePath);

//     return response;
//   } catch (err) {
//     // Remove locally saved temporary file as the upload operation got failed
//     fs.unlinkSync(localFilePath);
//     return null;
//   }
// };

const uploadOnCloudinary = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "upload" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error", err);
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
