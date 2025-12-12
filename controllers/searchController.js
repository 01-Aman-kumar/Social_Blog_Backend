import Post from "../models/Post.js";

export const searchSuggestions = async (req, res, next) => {
  try {
    const q = req.query.q || "";

    if (!q) return res.json([]);

    const posts = await Post.find(
      { title: { $regex: q, $options: "i" } },
      "title slug"
    )
      .limit(5);

    res.json(posts);
  } catch (err) {
    next(err);
  }
};
