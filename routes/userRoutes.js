import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";
import { deleteAccount, getUserProfile, toggleFollow, updateMyProfile } from "../controllers/userController.js";
import { getFollowers } from "../controllers/userController.js";
import { getFollowing } from "../controllers/userController.js";
import { getSuggestedUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/suggested", protectRoute, getSuggestedUsers);

// public profile
router.get("/:id", getUserProfile);

// follow/unfollow (protected)
router.post("/:id/follow", protectRoute, toggleFollow);

// update my profile (protected) — supports avatar upload
router.put("/me", protectRoute, upload.single("avatar"), updateMyProfile);
router.delete("/me", protectRoute, deleteAccount);
router.get("/:id/followers", protectRoute, getFollowers);
router.get("/:id/following", protectRoute, getFollowing);

export default router;
