const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.fieldname === "photo") {
      return {
        folder: "assets",
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 600, height: 600, crop: "limit" }],
      };
    }
    // resume field
    return {
      folder: "assets",
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx"],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;