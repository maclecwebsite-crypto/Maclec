const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Site queries can include a captured video and/or several photos of the
// site, so this needs its own storage config (separate from utils/upload.js,
// whose 5MB limit and image-only transform are too small for video).
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "site_video") {
      return {
        folder: "site-queries/videos",
        resource_type: "video",
        allowed_formats: ["mp4", "mov", "webm", "m4v"],
      };
    }
    // site_photos field
    return {
      folder: "site-queries/photos",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1600, height: 1600, crop: "limit" }],
    };
  },
});

const siteMediaUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file — video-friendly
});

module.exports = siteMediaUpload;
