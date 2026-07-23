const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Application Schema
 * Represents a candidate's application submitted against a Career (job posting).
 */
const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: "Career",
      required: [true, "Job reference is required"],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume file URL is required"],
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: [3000, "Cover letter cannot exceed 3000 characters"],
    },
    linkedInUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    totalExperienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    currentCompany: {
      type: String,
      trim: true,
    },
    currentCTC: {
      type: Number,
      min: 0,
    },
    expectedCTC: {
      type: Number,
      min: 0,
    },
    noticePeriodDays: {
      type: Number,
      min: 0,
      default: 0,
    },
    source: {
      type: String,
      enum: ["website", "linkedin", "referral", "job-board", "other"],
      default: "website",
    },
    status: {
      type: String,
      enum: [
        "applied",
        "under-review",
        "shortlisted",
        "interview-scheduled",
        "rejected",
        "offered",
        "hired",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      // internal recruiter notes, not shown to candidate
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the exact same email applying twice to the exact same job
applicationSchema.index({ job: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
