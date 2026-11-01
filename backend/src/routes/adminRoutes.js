const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/stats", ctrl.stats);
router.get("/analytics", ctrl.analytics);
router.get("/users", ctrl.users);
router.get("/users/:id", ctrl.user);
router.get("/organizations", ctrl.organizations);
router.patch("/organizations/:id/review", ctrl.reviewOrganization);
router.get("/donations", ctrl.donations);
router.get("/reports/donations.csv", ctrl.exportDonations);

module.exports = router;