import express from "express";
import { getMyProfile, updateProfile } from "../controllers/instructorController.js";
import { protect, authorize } from "../middleware/AuthMiddleware.js";

const router = express.Router();

// GET: /api/instructor/profile
router.get("/profile", protect, authorize("instructor"), getMyProfile);

// PUT: /api/instructor/profile/update
router.put("/profile/update", protect, authorize("instructor"), updateProfile);

export default router;