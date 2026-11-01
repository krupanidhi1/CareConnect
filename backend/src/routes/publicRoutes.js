const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/publicController");
const organizationCtrl = require("../controllers/organizationController");
const requirementCtrl = require("../controllers/requirementController");

router.get("/stats", ctrl.stats);
router.get("/organizations/featured", ctrl.featuredOrganizations);
router.get("/organizations", organizationCtrl.list);
router.get("/organizations/:id", organizationCtrl.publicDetail);
router.get("/requirements", requirementCtrl.publicList);
router.get("/requirements/urgent", ctrl.urgentRequirements);

module.exports = router;