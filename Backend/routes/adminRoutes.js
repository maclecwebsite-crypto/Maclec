const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/adminAuth");
const {
  login,
  logout,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  unpublishJob,
  getApplications,
  deleteApplication,
  downloadResume,
} = require("../controllers/adminController");

// Auth (not protected)
router.post("/login", login);
router.post("/logout", logout);

// Everything below requires a valid admin session token
router.use(requireAdmin);

router.route("/jobs").get(getJobs).post(createJob);
router.route("/jobs/:id").put(updateJob).delete(deleteJob);
router.patch("/jobs/:id/publish", publishJob);
router.patch("/jobs/:id/unpublish", unpublishJob);

router.get("/applications", getApplications);
router.delete("/applications/:id", deleteApplication);
router.get("/applications/:id/resume", downloadResume);

module.exports = router;
