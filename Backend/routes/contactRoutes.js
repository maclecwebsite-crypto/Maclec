const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/adminAuth");
const {
  createContactQuery,
  getContactQueries,
  getContactQueryById,
  updateContactQuery,
  respondToContactQuery,
  updateContactQueryStatus,
  deleteContactQuery,
  getContactQueryStats,
} = require("../controllers/contactController");

// Public: anyone can submit the contact form
router.post("/", createContactQuery);

router.use(requireAdmin);

router.get("/stats/summary", getContactQueryStats);

router.get("/", getContactQueries);

router.route("/:id").get(getContactQueryById).put(updateContactQuery).delete(deleteContactQuery);

router.patch("/:id/respond", respondToContactQuery);
router.patch("/:id/status", updateContactQueryStatus);

module.exports = router;