import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Admin Only
router.post("/", protectRoute, adminOnly, createCategory);
router.delete("/:id", protectRoute, adminOnly, deleteCategory);

// Public
router.get("/", getCategories);

export default router;
