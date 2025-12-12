import User from "../models/User.js";
import Post from "../models/Post.js";
import Category from "../models/Category.js";
import ExpressError from "../utils/ExpressError.js";

// GET users (paginate)
export const adminGetUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const users = await User.find()
      .select("name username email role createdAt banned avatar followers following")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();
    res.json({ success: true, users, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// Toggle ban/unban user (soft ban)
export const adminToggleBanUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new ExpressError(404, "User not found"));
    user.banned = !user.banned;
    await user.save();
    res.json({ success: true, message: user.banned ? "User banned" : "User unbanned" });
  } catch (err) { next(err); }
};

// GET posts (paginate)
export const adminGetPosts = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const posts = await Post.find()
      .populate("author", "name username email")
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments();
    res.json({ success: true, posts, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// DELETE post
export const adminDeletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return next(new ExpressError(404, "Post not found"));
    res.json({ success: true, message: "Post deleted" });
  } catch (err) { next(err); }
};

// Categories
export const adminGetCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories: cats });
  } catch (err) { next(err); }
};

export const adminCreateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return next(new ExpressError(400, "Name required"));
    const exists = await Category.findOne({ name });
    if (exists) return next(new ExpressError(400, "Category exists"));
    const c = await Category.create({ name, createdBy: req.user._id });
    res.status(201).json({ success: true, category: c });
  } catch (err) { next(err); }
};

export const adminDeleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) { next(err); }
};
