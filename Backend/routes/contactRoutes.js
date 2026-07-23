const express = require("express");
const router = express.Router();

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

// Stats route must come before the dynamic ":id" route
router.get("/stats/summary", getContactQueryStats);

router.route("/").post(createContactQuery).get(getContactQueries);

router.route("/:id").get(getContactQueryById).put(updateContactQuery).delete(deleteContactQuery);

router.patch("/:id/respond", respondToContactQuery);
router.patch("/:id/status", updateContactQueryStatus);

module.exports = router;
