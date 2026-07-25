const asyncHandler = require("express-async-handler");
const SiteQuery = require("../models/SiteQuery");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Numeric fields arrive as strings over multipart/form-data — coerce them,
// leaving undefined (rather than NaN) when a field wasn't sent at all.
const toNumber = (val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const num = Number(val);
  return Number.isFinite(num) ? num : undefined;
};

const createSiteQuery = asyncHandler(async (req, res) => {
  const {
    country,
    state,
    latitude,
    longitude,
    watertype,
    waterSourceCategory,
    width_m,
    depth_m,
    velocity_mps,
    discharge_cumecs,
    variation_m,
    length_m,
    fullName,
    email,
    organization,
    preferredDate,
    preferredTime,
    message,
  } = req.body;

  if (!fullName || !fullName.trim()) {
    return sendError(res, 400, "Full name is required");
  }
  if (!email || !email.trim()) {
    return sendError(res, 400, "Email is required");
  }

  const videoFile = req.files?.site_video?.[0];
  const photoFiles = req.files?.site_photos || [];

  const payload = {
    country,
    state,
    location: {
      latitude: toNumber(latitude),
      longitude: toNumber(longitude),
    },
    siteMedia: {
      videoUrl: videoFile ? videoFile.path : undefined, // Cloudinary secure URL
      photoUrls: photoFiles.map((f) => f.path),
    },
    waterSourceType: watertype,
    waterSourceCategory: ["hydro", "psp"].includes(waterSourceCategory) ? waterSourceCategory : "",
    widthM: toNumber(width_m),
    depthM: toNumber(depth_m),
    velocityMps: toNumber(velocity_mps),
    dischargeCumecs: toNumber(discharge_cumecs),
    variationM: toNumber(variation_m),
    lengthM: toNumber(length_m),
    fullName,
    email,
    organization,
    preferredDate,
    preferredTime,
    message,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };

  const siteQuery = await SiteQuery.create(payload);
  return sendSuccess(res, 201, "Your site query has been submitted successfully", siteQuery);
});

const getSiteQueries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    waterSourceCategory,
    search,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (waterSourceCategory) filter.waterSourceCategory = waterSourceCategory;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [queries, total] = await Promise.all([
    SiteQuery.find(filter).sort(sort).skip(skip).limit(limitNum),
    SiteQuery.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Site queries fetched successfully", queries, {
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

const getSiteQueryById = asyncHandler(async (req, res) => {
  const siteQuery = await SiteQuery.findById(req.params.id);

  if (!siteQuery) {
    return sendError(res, 404, "Site query not found");
  }

  if (!siteQuery.isRead) {
    siteQuery.isRead = true;
    await siteQuery.save();
  }

  return sendSuccess(res, 200, "Site query fetched successfully", siteQuery);
});

const updateSiteQueryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["new", "reviewed", "scheduled", "completed", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const siteQuery = await SiteQuery.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!siteQuery) {
    return sendError(res, 404, "Site query not found");
  }

  return sendSuccess(res, 200, "Site query status updated", siteQuery);
});

const deleteSiteQuery = asyncHandler(async (req, res) => {
  const siteQuery = await SiteQuery.findByIdAndDelete(req.params.id);

  if (!siteQuery) {
    return sendError(res, 404, "Site query not found");
  }

  return sendSuccess(res, 200, "Site query deleted successfully");
});

const getSiteQueryStats = asyncHandler(async (req, res) => {
  const [byStatus, byCategory, unreadCount, total] = await Promise.all([
    SiteQuery.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    SiteQuery.aggregate([{ $group: { _id: "$waterSourceCategory", count: { $sum: 1 } } }]),
    SiteQuery.countDocuments({ isRead: false }),
    SiteQuery.countDocuments(),
  ]);

  return sendSuccess(res, 200, "Site query stats fetched successfully", {
    total,
    unreadCount,
    byStatus,
    byCategory,
  });
});

module.exports = {
  createSiteQuery,
  getSiteQueries,
  getSiteQueryById,
  updateSiteQueryStatus,
  deleteSiteQuery,
  getSiteQueryStats,
};
