const asyncHandler = require("express-async-handler");
const Career = require("../models/Career");
const Application = require("../models/Application");
const { issueToken, revokeToken } = require("../middleware/adminAuth");

// ---- Auth ----

const login = (req, res) => {
  const { password } = req.body;

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Admin password is not configured on the server." });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  const token = issueToken();
  return res.status(200).json({ success: true, token });
};

const logout = (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) revokeToken(token);
  return res.status(200).json({ success: true });
};

// ---- Jobs ----

function toAdminJob(job) {
  return {
    id: job._id,
    title: job.title,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    summary: job.summary,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    keywords: job.keywords,
    externalApplyUrl: job.externalApplyUrl,
    isActive: job.isActive,
    postedDate: job.postedDate,
  };
}

const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Career.find().sort("-createdAt");
  res.status(200).json(jobs.map(toAdminJob));
});

const createJob = asyncHandler(async (req, res) => {
  const job = await Career.create({
    ...req.body,
    // Career schema requires a status + employmentType format; keep these
    // sensible defaults so the admin form (which doesn't set them) still works.
    status: req.body.isActive === false ? "closed" : "open",
    employmentType: (req.body.employmentType || "full-time").toLowerCase(),
  });
  res.status(201).json(toAdminJob(job));
});

const updateJob = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.employmentType) update.employmentType = update.employmentType.toLowerCase();
  if (typeof update.isActive === "boolean") {
    update.status = update.isActive ? "open" : "closed";
  }

  const job = await Career.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!job) return res.status(404).json({ error: "Job posting not found." });
  res.status(200).json(toAdminJob(job));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Career.findByIdAndDelete(req.params.id);
  if (!job) return res.status(404).json({ error: "Job posting not found." });
  await Application.deleteMany({ job: job._id });
  res.status(200).json({ success: true });
});

const setJobActive = (isActive) =>
  asyncHandler(async (req, res) => {
    const job = await Career.findByIdAndUpdate(
      req.params.id,
      { isActive, status: isActive ? "open" : "closed" },
      { new: true }
    );
    if (!job) return res.status(404).json({ error: "Job posting not found." });
    res.status(200).json(toAdminJob(job));
  });

// ---- Applications ----

function toAdminApplication(app) {
  const [firstName, ...rest] = (app.fullName || "").split(" ");
  return {
    id: app._id,
    firstName: firstName || app.fullName || "",
    lastName: rest.join(" "),
    email: app.email,
    phone: app.phone,
    jobTitle: app.job && app.job.title ? app.job.title : "General Application",
    linkedIn: app.linkedInUrl,
    portfolio: app.portfolioUrl,
    message: app.coverLetter,
    submittedAt: app.appliedAt || app.createdAt,
    resumeUrl: app.resumeUrl,
    resumeFileName: (app.resumeUrl || "").split("/").pop() || "resume",
  };
}

const getApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find().sort("-createdAt").populate("job", "title");
  res.status(200).json(applications.map(toAdminApplication));
});

const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findByIdAndDelete(req.params.id);
  if (!application) return res.status(404).json({ error: "Application not found." });
  if (application.job) {
    await Career.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
  }
  res.status(200).json({ success: true });
});

const downloadResume = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application || !application.resumeUrl) {
    return res.status(404).json({ error: "Resume not found." });
  }

  // Proxy the Cloudinary file back through our own API so the admin panel's
  // fetch() call (which needs to send the Bearer auth header) can reach it.
  const upstream = await fetch(application.resumeUrl);
  if (!upstream.ok) {
    return res.status(502).json({ error: "Failed to fetch resume file." });
  }

  res.setHeader(
    "Content-Type",
    upstream.headers.get("content-type") || "application/octet-stream"
  );
  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.status(200).send(buffer);
});

module.exports = {
  login,
  logout,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  publishJob: setJobActive(true),
  unpublishJob: setJobActive(false),
  getApplications,
  deleteApplication,
  downloadResume,
};
