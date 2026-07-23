const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Career = require("../models/Career");
const { sendSuccess, sendError } = require("../utils/apiResponse");


const createApplication = asyncHandler(async (req, res) => {
  const { job } = req.body;

  const career = await Career.findById(job);
  if (!career) {
    return sendError(res, 404, "The job you are applying to does not exist");
  }
  if (!career.isOpen) {
    return sendError(res, 400, "This job posting is no longer accepting applications");
  }

  // Duplicate application guard (also enforced at DB level via unique index)
  const existing = await Application.findOne({ job, email: req.body.email });
  if (existing) {
    return sendError(res, 409, "You have already applied for this position");
  }

  const application = await Application.create(req.body);

  career.applicationsCount = (career.applicationsCount || 0) + 1;
  await career.save();

  return sendSuccess(res, 201, "Application submitted successfully", application);
});


const getApplications = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    job,
    status,
    search,
    sort = "-createdAt",
  } = req.query;

  const filter = {};
  if (job) filter.job = job;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { fullName: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate("job", "title department location employmentType status")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Application.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, "Applications fetched successfully", applications, {
    meta: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});


const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate(
    "job",
    "title department location employmentType status"
  );

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  return sendSuccess(res, 200, "Application fetched successfully", application);
});

/**
 * @desc    Update an application (recruiter edits, e.g. notes, rating)
 * @route   PUT /api/applications/:id
 * @access  Private (Admin/HR)
 */
const updateApplication = asyncHandler(async (req, res) => {
  // Prevent re-pointing an application to a different job via a generic update
  delete req.body.job;

  const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  return sendSuccess(res, 200, "Application updated successfully", application);
});


const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = [
    "applied",
    "under-review",
    "shortlisted",
    "interview-scheduled",
    "rejected",
    "offered",
    "hired",
    "withdrawn",
  ];

  if (!allowedStatuses.includes(status)) {
    return sendError(res, 400, `Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  return sendSuccess(res, 200, "Application status updated", application);
});


const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  await Career.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

  return sendSuccess(res, 200, "Application deleted successfully");
});

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
};
