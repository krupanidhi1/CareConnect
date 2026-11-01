const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/requirementController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("admin"), ctrl.list);
router.get("/mine", protect, authorize("organization"), ctrl.mine);
router.post("/", protect, authorize("organization"), ctrl.create);
router.patch("/:id", protect, authorize("organization", "admin"), ctrl.update);
router.delete("/:id", protect, authorize("organization", "admin"), ctrl.remove);

module.exports = router;