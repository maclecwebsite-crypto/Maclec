const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const Career = require("../models/Career");
const { sendSuccess, sendError } = require("../utils/apiResponse");


const createApplication = async (req, res, next) => {
  try {
    const { job_title, first_name, last_name, email, phone, linkedin, portfolio, message } = req.body;

    const resumeFile = req.files?.resume?.[0];
    const photoFile = req.files?.photo?.[0];

    if (!resumeFile) {
      return res.status(400).json({ error: "Resume file is required." });
    }
    if (!photoFile) {
      return res.status(400).json({ error: "Photo is required." });
    }

    const job = await Career.findOne({ title: job_title });
    if (!job && job_title !== "General Application") {
      return res.status(404).json({ error: "This position is no longer available." });
    }

    const application = await Application.create({
      job: job ? job._id : undefined,
      fullName: `${first_name} ${last_name}`.trim(),
      email,
      phone,
      resumeUrl: resumeFile.path,   // Cloudinary secure URL
      photoUrl: photoFile.path,     // Cloudinary secure URL
      coverLetter: message,
      linkedInUrl: linkedin,
      portfolioUrl: portfolio,
    });

    if (job) {
      job.applicationsCount = (job.applicationsCount || 0) + 1;
      await job.save();
    }

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
};


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
