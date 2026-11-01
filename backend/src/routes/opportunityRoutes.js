const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/opportunityController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, ctrl.list);
router.get("/mine", protect, authorize("organization"), ctrl.mine);
router.post("/", protect, authorize("organization"), ctrl.create);
router.get("/:id", protect, ctrl.detail);
router.patch("/:id", protect, authorize("organization", "admin"), ctrl.update);
router.delete("/:id", protect, authorize("organization", "admin"), ctrl.remove);

module.exports = router;