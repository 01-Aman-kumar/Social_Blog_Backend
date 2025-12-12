import Post from "../models/Post.js";
import Category from "../models/Category.js";
import ExpressError from "../utils/ExpressError.js";
import slugify from "slugify";
import User from "../models/User.js";
import { createNotification } from "../utils/createNotification.js";

// CREATE POST
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, status } = req.body;

    if (!title || !content || !category) {
      return next(new ExpressError(400, "Title, content & category are required"));
    }

    // Validate category
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new ExpressError(404, "Category not found"));
    }

    const slug = slugify(title, { lower: true, strict: true });

    const coverImage = req.file ? req.file.path : "";

    const post = await Post.create({
      title,
      slug,
      content,
      coverImage,
      author: req.user._id,
      category,
      tags: tags ? tags.split(",") : [],
      status: status || "draft",
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL POSTS WITH FILTERS
export const getAllPosts = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "", category, author } = req.query;

    page = Number(page);
    limit = Number(limit);

    let query = { status: "published" };

    // Search filter
    if (search) {
  query.$or = [
    { title: { $regex: search, $options: "i" } },
    { content: { $regex: search, $options: "i" } },
    { tags: { $regex: search, $options: "i" } }
  ];
}

    // Category filter
    if (category) {
      query.category = category;
    }

    // Author filter
    if (author) {
      query.author = author;
    }

    const posts = await Post.find(query)
      .populate("author", "name username avatar")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE POST
export const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({ slug })
      .populate("author", "name username avatar")
      .populate("category", "name");

    if (!post) return next(new ExpressError(404, "Post not found"));

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE POST
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new ExpressError(404, "Post not found"));

    if (String(post.author) !== String(req.user._id)) {
      return next(new ExpressError(403, "Not authorized to update this post"));
    }

    const { title, content, category, tags, status } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (tags) post.tags = tags.split(",");
    if (status) post.status = status;

    if (req.file) post.coverImage = req.file.path;

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE POST
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new ExpressError(404, "Post not found"));

    if (String(post.author) !== String(req.user._id)) {
      return next(new ExpressError(403, "Not authorized to delete this post"));
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// LIKE / UNLIKE
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new ExpressError(404, "Post not found"));

    const userId = req.user._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes.pull(userId);
      await post.save();
      return res.json({ success: true, message: "Post unliked" });
    }

    // LIKE post
    post.likes.push(userId);
    await post.save();

    // 🔥 Notification only when liking (not unliking)
    await createNotification({
      user: post.author,
      fromUser: userId,
      type: "like",
      post: post._id,
    });

    res.json({ success: true, message: "Post liked" });
  } catch (error) {
    next(error);
  }
};


// BOOKMARK / UNBOOKMARK
export const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(new ExpressError(404, "Post not found"));

    const userId = req.user._id;

    if (post.bookmarks.includes(userId)) {
      post.bookmarks.pull(userId);
      await post.save();
      return res.json({ success: true, message: "Bookmark removed" });
    }

    post.bookmarks.push(userId);
    await post.save();

    res.json({ success: true, message: "Post bookmarked" });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username avatar")
      .populate("category", "name");

    if (!post) return next(new ExpressError(404, "Post not found"));

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("following");

    if (!user) {
      return next(new ExpressError(404, "User not found"));
    }

    // Fetch posts where author is in following list
    const posts = await Post.find({
      author: { $in: user.following },
      status: "published",
    })
      .populate("author", "name username avatar")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      posts,
    });
  } catch (error) {
    next(error);
  }
};
