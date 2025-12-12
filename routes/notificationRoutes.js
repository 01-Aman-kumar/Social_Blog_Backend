import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAllAsRead,
  markOneAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notificationController.js";

const router = express.Router();

// GET all notifications
router.get("/", protectRoute, getNotifications);

// MARK ALL READ
router.put("/read", protectRoute, markAllAsRead);

// MARK SINGLE READ
router.put("/:id/read", protectRoute, markOneAsRead);

// DELETE SINGLE
router.delete("/:id", protectRoute, deleteNotification);

// DELETE ALL
router.delete("/", protectRoute, deleteAllNotifications);

export default router;
