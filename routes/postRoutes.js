import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

import {
  createPost,
  getAllPosts,
  getPostBySlug,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getPostById,
  getFeedPosts,
} from "../controllers/postController.js";

const router = express.Router();

// Public
router.get("/", getAllPosts);
router.get("/feed", protectRoute, getFeedPosts);

router.get("/id/:id", getPostById);
router.get("/:slug", getPostBySlug);

// Protected (User must be logged in)
router.post("/", protectRoute, upload.single("coverImage"), createPost);
router.put("/:id", protectRoute, upload.single("coverImage"), updatePost);
router.delete("/:id", protectRoute, deletePost);

// Likes / Bookmarks
router.post("/:id/like", protectRoute, toggleLike);
router.post("/:id/bookmark", protectRoute, toggleBookmark);

export default router;
