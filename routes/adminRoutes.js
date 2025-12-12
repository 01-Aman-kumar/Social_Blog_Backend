import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  adminGetUsers,
  adminToggleBanUser,
  adminGetPosts,
  adminDeletePost,
  adminGetCategories,
  adminCreateCategory,
  adminDeleteCategory
} from "../controllers/adminController.js";

const router = express.Router();

// 👇 Middleware chain → user must be logged in AND be admin
router.use(protectRoute, adminOnly);

// USERS
router.get("/users", adminGetUsers);
router.put("/users/:id/ban", adminToggleBanUser);

// POSTS
router.get("/posts", adminGetPosts);
router.delete("/posts/:id", adminDeletePost);

// CATEGORIES
router.get("/categories", adminGetCategories);
router.post("/categories", adminCreateCategory);
router.delete("/categories/:id", adminDeleteCategory);

export default router;
