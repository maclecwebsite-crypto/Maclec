const express = require("express");
const router = express.Router();

const siteMediaUpload = require("../utils/siteMediaUpload");
const { requireAdmin } = require("../middleware/adminAuth");
const {
  createSiteQuery,
  getSiteQueries,
  getSiteQueryById,
  updateSiteQueryStatus,
  deleteSiteQuery,
  getSiteQueryStats,
} = require("../controllers/siteQueryController");

// Public: anyone completing the Atlas assessment console can submit
router.post(
  "/",
  siteMediaUpload.fields([
    { name: "site_video", maxCount: 1 },
    { name: "site_photos", maxCount: 10 },
  ]),
  createSiteQuery
);

router.use(requireAdmin);

router.get("/stats/summary", getSiteQueryStats);

router.get("/", getSiteQueries);

router.route("/:id").get(getSiteQueryById).delete(deleteSiteQuery);

router.patch("/:id/status", updateSiteQueryStatus);

module.exports = router;
