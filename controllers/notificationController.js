import Notification from "../models/Notification.js";

// GET ALL
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate("fromUser", "name username avatar")
      .populate("post", "title slug")
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// MARK ALL READ
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// MARK ONE READ
export const markOneAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification)
      return next(new ExpressError(404, "Notification not found"));

    notification.read = true;
    await notification.save();

    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
};

// DELETE ONE
export const deleteNotification = async (req, res, next) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deleted)
      return next(new ExpressError(404, "Notification not found"));

    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
};

// DELETE ALL
export const deleteAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user._id });

    res.json({ success: true, message: "All notifications cleared" });
  } catch (err) {
    next(err);
  }
};
