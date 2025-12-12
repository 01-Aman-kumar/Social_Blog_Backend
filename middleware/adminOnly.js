import ExpressError from "../utils/ExpressError.js";

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ExpressError(401, "Not authenticated"));
  }

  if (req.user.role !== "admin") {
    return next(new ExpressError(403, "Access Denied: Admins Only"));
  }

  next();
};
