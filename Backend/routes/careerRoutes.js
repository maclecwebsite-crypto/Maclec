const express = require("express");
const router = express.Router();

const {
  createCareer,
  getCareers,
  getCareerByIdOrSlug,
  updateCareer,
  deleteCareer,
  updateCareerStatus,
  getCareerStats,
} = require("../controllers/careerController");

// Stats route must come before the dynamic ":idOrSlug" route
router.get("/stats/summary", getCareerStats);

router.route("/").post(createCareer).get(getCareers);

router.route("/:idOrSlug").get(getCareerByIdOrSlug);

router.route("/:id").put(updateCareer).delete(deleteCareer);

router.patch("/:id/status", updateCareerStatus);

module.exports = router;
