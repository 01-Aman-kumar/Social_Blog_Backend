import Notification from "../models/Notification.js";

export const createNotification = async ({ user, fromUser, type, post }) => {
  try {
    // Do not notify yourself
    if (String(user) === String(fromUser)) return;

    await Notification.create({
      user,
      fromUser,
      type,
      post,
    });
  } catch (err) {
    console.error("Notification Error:", err);
  }
};
