import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { createNotification } from "../utils/createNotification.js";
import ExpressError from "../utils/ExpressError.js";

// ADD COMMENT
export const addComment = async (req, res, next) => {
  try {
    const { postId, text } = req.body;

    if (!text) return next(new ExpressError(400, "Comment text is required"));

    const post = await Post.findById(postId);
    if (!post) return next(new ExpressError(404, "Post not found"));

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      text,
    });

    // 🔥 Notify post owner (except self-comment)
    await createNotification({
      user: post.author,
      fromUser: req.user._id,
      type: "comment",
      post: post._id,
    });

    res.status(201).json({ success: true, message: "Comment added", comment });
  } catch (error) {
    next(error);
  }
};


// GET COMMENTS FOR POST
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("user", "name username avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE COMMENT
export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) return next(new ExpressError(404, "Comment not found"));

    if (String(comment.user) !== String(req.user._id)) {
      return next(new ExpressError(403, "Not authorized"));
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    next(error);
  }
};
