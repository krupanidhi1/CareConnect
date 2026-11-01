const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/donationController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, authorize("donor"), ctrl.create);
router.get("/mine", protect, authorize("donor"), ctrl.mine);
router.get("/received", protect, authorize("organization"), ctrl.received);
router.get("/", protect, authorize("admin"), ctrl.list);
router.patch("/:id/status", protect, authorize("organization", "admin"), ctrl.updateStatus);

module.exports = router;