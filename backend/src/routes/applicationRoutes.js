const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("volunteer"), ctrl.apply);
router.get("/mine", protect, authorize("volunteer"), ctrl.mine);
router.get("/received", protect, authorize("organization"), ctrl.received);
router.patch("/:id/status", protect, authorize("organization", "admin"), ctrl.updateStatus);

module.exports = router;