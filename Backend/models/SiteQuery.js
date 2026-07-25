const mongoose = require("mongoose");
const { Schema } = mongoose;

const siteQuerySchema = new Schema(
  {
    // ===== Step 1: Select Location =====
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
    },
    siteMedia: {
      videoUrl: {
        type: String,
        trim: true,
      },
      photoUrls: {
        type: [String], // Cloudinary secure URLs
        default: [],
      },
    },

    // ===== Step 2: Site Parameters =====
    waterSourceType: {
      type: String,
      trim: true,
      // e.g. "River / Canal" (SHK Turbine) or "Pumped Storage Canal" (SHK PSP)
    },
    waterSourceCategory: {
      type: String,
      enum: ["hydro", "psp", ""],
      default: "",
    },
    widthM: {
      type: Number, // Approximate water width (m)
    },
    depthM: {
      type: Number, // Approximate water depth (m)
    },
    velocityMps: {
      type: Number, // Average water velocity (m/sec)
    },
    dischargeCumecs: {
      type: Number, // Average discharge (cumecs)
    },
    variationM: {
      type: Number, // Water level variation (m)
    },
    lengthM: {
      type: Number, // Length available for installation (m)
    },

    // ===== Step 3: Book Consultation =====
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    organization: {
      type: String,
      trim: true,
    },
    preferredDate: {
      type: String, // stored as submitted (e.g. "2026-08-14") for straightforward round-tripping
      trim: true,
    },
    preferredTime: {
      type: String, // e.g. "09:00"
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },

    // ===== Admin / meta =====
    status: {
      type: String,
      enum: ["new", "reviewed", "scheduled", "completed", "cancelled"],
      default: "new",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

siteQuerySchema.index({
  fullName: "text",
  email: "text",
  organization: "text",
  message: "text",
});

module.exports = mongoose.model("SiteQuery", siteQuerySchema);
