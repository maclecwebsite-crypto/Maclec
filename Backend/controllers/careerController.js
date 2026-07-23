const asyncHandler = require("express-async-handler");
const Career = require("../models/Career");
const Application = require("../models/Application");
const { sendSuccess, sendError } = require("../utils/apiResponse");


const createCareer = asyncHandler(async (req, res) => {
  const career = await Career.create(req.body);
  return sendSuccess(res, 201, "Job posting created successfully", career);
});


const getCareers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    department,
    employmentType,
    workMode,
    location,
    search,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = new RegExp(department, "i");
  if (employmentType) filter.employmentType = employmentType;
  if (workMode) filter.workMode = workMode;
  if (location) filter.location = new RegExp(location, "i");
  if (search) filter.$text = { $search: search };

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [careers, total] = await Promise.all([
    Career.find(filter).sort(sort).skip(skip).limit(limitNum),
    Career.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Job postings fetched successfully", careers, {
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});


const getCareerByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

  const career = isObjectId
    ? await Career.findById(idOrSlug)
    : await Career.findOne({ slug: idOrSlug });

  if (!career) {
    return sendError(res, 404, "Job posting not found");
  }

  return sendSuccess(res, 200, "Job posting fetched successfully", career);
});


const updateCareer = asyncHandler(async (req, res) => {
  const career = await Career.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!career) {
    return sendError(res, 404, "Job posting not found");
  }

  return sendSuccess(res, 200, "Job posting updated successfully", career);
});


const deleteCareer = asyncHandler(async (req, res) => {
  const career = await Career.findByIdAndDelete(req.params.id);

  if (!career) {
    return sendError(res, 404, "Job posting not found");
  }

  // Clean up applications tied to this job posting
  await Application.deleteMany({ job: career._id });

  return sendSuccess(res, 200, "Job posting deleted successfully");
});


const updateCareerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["draft", "open", "closed", "on-hold"];

  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const career = await Career.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!career) {
    return sendError(res, 404, "Job posting not found");
  }

  return sendSuccess(res, 200, "Job posting status updated", career);
});


const getCareerStats = asyncHandler(async (req, res) => {
  const [byStatus, byDepartment, total] = await Promise.all([
    Career.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Career.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
    Career.countDocuments(),
  ]);

  return sendSuccess(res, 200, "Career stats fetched successfully", {
    total,
    byStatus,
    byDepartment,
  });
});

module.exports = {
  createCareer,
  getCareers,
  getCareerByIdOrSlug,
  updateCareer,
  deleteCareer,
  updateCareerStatus,
  getCareerStats,
};
