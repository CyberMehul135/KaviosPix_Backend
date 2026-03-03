const AppError = require("./appError");

const validateAlbumData = (req) => {
  const { name } = req.body;
  const file = req.file;

  if (!name) {
    throw new AppError("Validation failed", 400, [
      { field: "name", message: "Name is required." },
    ]);
  } else if (!file) {
    throw new AppError("Validation failed", 400, [
      { field: "coverImage", message: "Cover Image is required." },
    ]);
  }
};

const validateShareAlbumData = (req) => {
  const { emails } = req.body;
  if (!emails || emails.length === 0) {
    throw new AppError("Validation failed", 400, [
      { field: "emails", message: "Emails are required" },
    ]);
  }
};

const validateCreateImageData = (req) => {
  const { albumId } = req.params;
  const file = req.file;

  if (!albumId) {
    throw new AppError("Validation failed", 400, [
      { field: "albumId", message: "Album ID is required." },
    ]);
  }

  if (!file) {
    throw new AppError("Validation failed", 400, [
      { field: "image", message: "Image file is required." },
    ]);
  }
};

const validateAddCommentData = (req) => {
  const { imageId } = req.params;
  const { comment } = req.body;

  if (!imageId) {
    throw new AppError("Validation failed", 400, [
      { field: "imageId", message: "Image ID is required." },
    ]);
  }

  if (!comment) {
    throw new AppError("Validation failed", 400, [
      { field: "comment", message: "Comment is required." },
    ]);
  }

  if (comment.trim().length === 0) {
    throw new AppError("Validation failed", 400, [
      { field: "comment", message: "Comment cannot be empty." },
    ]);
  }

  if (comment.length > 500) {
    throw new AppError("Validation failed", 400, [
      { field: "comment", message: "Comment cannot exceed 500 characters." },
    ]);
  }
};

const validateAddTagData = (req) => {
  const { imageId } = req.params;
  const { tag } = req.body;

  if (!imageId) {
    throw new AppError("Validation failed", 400, [
      { field: "imageId", message: "Image ID is required." },
    ]);
  }

  if (!tag) {
    throw new AppError("Validation failed", 400, [
      { field: "tag", message: "Tag is required." },
    ]);
  }

  if (tag.trim().length === 0) {
    throw new AppError("Validation failed", 400, [
      { field: "tag", message: "Tag cannot be empty." },
    ]);
  }

  if (tag.length > 30) {
    throw new AppError("Validation failed", 400, [
      { field: "tag", message: "Tag cannot exceed 30 characters." },
    ]);
  }
};

module.exports = {
  validateAlbumData,
  validateShareAlbumData,
  validateCreateImageData,
  validateAddCommentData,
  validateAddTagData,
};
