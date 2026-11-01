const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/organizationController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, ctrl.list);
router.get("/me", protect, authorize("organization"), ctrl.mine);
router.post("/", protect, authorize("organization"), ctrl.create);
router.post("/me/verification", protect, authorize("organization"), ctrl.submitVerification);
router.get("/:id", protect, authorize("organization", "admin"), ctrl.detail);
router.patch("/:id", protect, authorize("organization", "admin"), ctrl.update);

module.exports = router;