import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";

import {
  addComment,
  getComments,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/:postId", getComments);
router.post("/", protectRoute, addComment);
router.delete("/:id", protectRoute, deleteComment);

export default router;
