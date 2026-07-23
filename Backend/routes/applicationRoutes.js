const express = require("express");
const router = express.Router();

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

router.route("/").post(createApplication).get(getApplications);

router.route("/:id").get(getApplicationById).put(updateApplication).delete(deleteApplication);

router.patch("/:id/status", updateApplicationStatus);

module.exports = router;
