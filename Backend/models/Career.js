const mongoose = require("mongoose");
const { Schema } = mongoose;


const careerSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [150, "Job title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      // e.g. Engineering, Sales, Marketing, HR, Design, Finance
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    workMode: {
      type: String,
      enum: ["on-site", "remote", "hybrid"],
      default: "on-site",
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "temporary"],
      required: [true, "Employment type is required"],
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead", "manager", "executive"],
      default: "mid",
    },
    minExperienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    perks: {
      type: [String],
      default: [],
    },
    salaryRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: "USD" },
      isDisclosed: { type: Boolean, default: false },
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "on-hold"],
      default: "draft",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    closingDate: {
      type: Date,
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Text index to support search across common fields
careerSchema.index({
  title: "text",
  department: "text",
  location: "text",
  skills: "text",
});

// Auto-generate a URL-friendly slug from the title before validation
careerSchema.pre("validate", function (next) {
  if (this.title && (!this.slug || this.isModified("title"))) {
    this.slug =
      this.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Math.random().toString(36).substring(2, 7);
  }
  next();
});

// Virtual: is the job still accepting applications?
careerSchema.virtual("isOpen").get(function () {
  if (this.status !== "open") return false;
  if (this.closingDate && this.closingDate < new Date()) return false;
  return true;
});

careerSchema.set("toJSON", { virtuals: true });
careerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Career", careerSchema);