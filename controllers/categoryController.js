import Category from "../models/Category.js";
import ExpressError from "../utils/ExpressError.js";

// CREATE CATEGORY (Admin Only)
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(new ExpressError(400, "Category name is required"));
    }

    // check if exists
    const exists = await Category.findOne({ name });
    if (exists) {
      return next(new ExpressError(400, "Category already exists"));
    }

    const category = await Category.create({
      name,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL CATEGORIES
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE CATEGORY (Admin Only)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return next(new ExpressError(404, "Category not found"));
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
