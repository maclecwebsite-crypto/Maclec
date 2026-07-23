const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * ContactQuery Schema
 * Represents a message submitted through the "Contact Us" form
 * or raised by a client (general inquiry, support, sales, partnership, etc.)
 */
const contactQuerySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
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
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },
    queryType: {
      type: String,
      enum: ["general", "support", "sales", "partnership", "feedback", "complaint", "other"],
      default: "general",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["new", "in-progress", "resolved", "closed", "spam"],
      default: "new",
      index: true,
    },
    source: {
      type: String,
      enum: ["website", "email", "phone", "chat", "social-media", "other"],
      default: "website",
    },
    attachments: {
      type: [String], // file URLs
      default: [],
    },
    response: {
      type: String,
      trim: true,
      // the reply sent back to the client, if any
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
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

// Text index to support keyword search across queries
contactQuerySchema.index({
  name: "text",
  email: "text",
  subject: "text",
  message: "text",
  company: "text",
});

module.exports = mongoose.model("ContactQuery", contactQuerySchema);
