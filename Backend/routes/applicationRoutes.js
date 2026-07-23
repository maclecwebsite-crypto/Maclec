const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require("../controllers/applicationController");

router
  .route("/")
  .post(
    upload.fields([
      { name: "resume", maxCount: 1 },
      { name: "photo", maxCount: 1 },
    ]),
    createApplication
  )
  .get(getApplications);

router.route("/:id").get(getApplicationById).put(updateApplication).delete(deleteApplication);

router.patch("/:id/status", updateApplicationStatus);

module.exports = router;