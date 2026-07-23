const asyncHandler = require("express-async-handler");
const ContactQuery = require("../models/ContactQuery");
const { sendSuccess, sendError } = require("../utils/apiResponse");


const createContactQuery = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };

  const query = await ContactQuery.create(payload);
  return sendSuccess(res, 201, "Your query has been submitted successfully", query);
});


const getContactQueries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    queryType,
    priority,
    search,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (queryType) filter.queryType = queryType;
  if (priority) filter.priority = priority;
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [queries, total] = await Promise.all([
    ContactQuery.find(filter).sort(sort).skip(skip).limit(limitNum),
    ContactQuery.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Contact queries fetched successfully", queries, {
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});


const getContactQueryById = asyncHandler(async (req, res) => {
  const query = await ContactQuery.findById(req.params.id);

  if (!query) {
    return sendError(res, 404, "Query not found");
  }

  // Mark as read the first time an admin/support agent opens it
  if (!query.isRead) {
    query.isRead = true;
    await query.save();
  }

  return sendSuccess(res, 200, "Query fetched successfully", query);
});


const updateContactQuery = asyncHandler(async (req, res) => {
  const query = await ContactQuery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!query) {
    return sendError(res, 404, "Query not found");
  }

  return sendSuccess(res, 200, "Query updated successfully", query);
});


const respondToContactQuery = asyncHandler(async (req, res) => {
  const { response, respondedBy } = req.body;

  if (!response || !response.trim()) {
    return sendError(res, 400, "A response message is required");
  }

  const query = await ContactQuery.findByIdAndUpdate(
    req.params.id,
    {
      response,
      respondedBy,
      respondedAt: new Date(),
      status: "resolved",
    },
    { new: true, runValidators: true }
  );

  if (!query) {
    return sendError(res, 404, "Query not found");
  }

  return sendSuccess(res, 200, "Response saved successfully", query);
});


const updateContactQueryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["new", "in-progress", "resolved", "closed", "spam"];

  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const query = await ContactQuery.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!query) {
    return sendError(res, 404, "Query not found");
  }

  return sendSuccess(res, 200, "Query status updated", query);
});


const deleteContactQuery = asyncHandler(async (req, res) => {
  const query = await ContactQuery.findByIdAndDelete(req.params.id);

  if (!query) {
    return sendError(res, 404, "Query not found");
  }

  return sendSuccess(res, 200, "Query deleted successfully");
});

const getContactQueryStats = asyncHandler(async (req, res) => {
  const [byStatus, byType, unreadCount, total] = await Promise.all([
    ContactQuery.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ContactQuery.aggregate([{ $group: { _id: "$queryType", count: { $sum: 1 } } }]),
    ContactQuery.countDocuments({ isRead: false }),
    ContactQuery.countDocuments(),
  ]);

  return sendSuccess(res, 200, "Contact query stats fetched successfully", {
    total,
    unreadCount,
    byStatus,
    byType,
  });
});

module.exports = {
  createContactQuery,
  getContactQueries,
  getContactQueryById,
  updateContactQuery,
  respondToContactQuery,
  updateContactQueryStatus,
  deleteContactQuery,
  getContactQueryStats,
};
