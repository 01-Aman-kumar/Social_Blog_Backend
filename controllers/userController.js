import User from "../models/User.js";
import Post from "../models/Post.js";
import ExpressError from "../utils/ExpressError.js";
import { createNotification } from "../utils/createNotification.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";

// GET PUBLIC PROFILE (user, posts, bookmarked)
export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) return next(new ExpressError(404, "User not found"));

    const posts = await Post.find({ author: id }).sort({ createdAt: -1 });
    const bookmarked = await Post.find({ bookmarks: id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      posts,
      bookmarked,
    });
  } catch (err) {
    next(err);
  }
};

// TOGGLE FOLLOW / UNFOLLOW
export const toggleFollow = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const meId = req.user._id;

    if (String(meId) === String(targetId)) {
      return next(new ExpressError(400, "You cannot follow yourself"));
    }

    const target = await User.findById(targetId);
    const me = await User.findById(meId);

    if (!target || !me) return next(new ExpressError(404, "User not found"));

    const alreadyFollowing = target.followers.includes(meId);

    if (alreadyFollowing) {
      // Unfollow
      target.followers.pull(meId);
      me.following.pull(targetId);
      await target.save();
      await me.save();

      return res.json({ success: true, message: "Unfollowed user" });
    }

    // Follow
    target.followers.push(meId);
    me.following.push(targetId);
    await target.save();
    await me.save();

    // 🔥 FOLLOW NOTIFICATION (finally correct)
    await createNotification({
      user: targetId,
      fromUser: meId,
      type: "follow",
    });

    return res.json({ success: true, message: "Followed user" });
  } catch (err) {
    next(err);
  }
};


// UPDATE CURRENT USER PROFILE (me)
export const updateMyProfile = async (req, res, next) => {
  try {
    const meId = req.user._id;
    const { name, username, bio } = req.body;
    const avatarPath = req.file ? req.file.path : undefined;

    // validate unique username if changed
    if (username) {
      const ex = await User.findOne({ username, _id: { $ne: meId } });
      if (ex) return next(new ExpressError(400, "Username already taken"));
    }

    const user = await User.findById(meId);
    if (!user) return next(new ExpressError(404, "User not found"));

    if (name) user.name = name;
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatarPath) user.avatar = avatarPath;

    await user.save();

    const safeUser = await User.findById(meId).select("-password");
    res.json({ success: true, message: "Profile updated", user: safeUser });
  } catch (err) {
    next(err);
  }
};
export const getFollowers = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("followers", "name username avatar");

    if (!user) {
      return next(new ExpressError(404, "User not found"));
    }

    res.json({
      success: true,
      followers: user.followers,
    });

  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate("following", "name username avatar");

    if (!user) {
      return next(new ExpressError(404, "User not found"));
    }

    res.json({
      success: true,
      following: user.following,
    });

  } catch (error) {
    next(error);
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id).select("following");

    // Suggested = users NOT in following and NOT user himself
    const suggested = await User.find({
      _id: { $ne: req.user._id, $nin: currentUser.following }
    })
      .select("name username avatar followers")
      .sort({ followers: -1 }) // most popular first
      .limit(10);

    res.json({
      success: true,
      users: suggested,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Delete all posts authored by user
    await Post.deleteMany({ author: userId });

    // 2. Delete all comments made by user (Optional: or keep them as "Deleted User")
    if (Comment) {
       await Comment.deleteMany({ user: userId });
    }
    
    // 3. Delete all notifications related to user (sent OR received)
    if (Notification) {
       await Notification.deleteMany({ $or: [{ user: userId }, { fromUser: userId }] });
    }

    // 4. Remove user from 'followers' arrays of other users
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );

    // 5. Remove user from 'following' arrays of other users
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    
    // 6. Remove user from 'likes' and 'bookmarks' in Posts
    await Post.updateMany(
       {},
       { $pull: { likes: userId, bookmarks: userId } }
    );

    // 7. Finally, delete the user
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};