import jwt from "jsonwebtoken"; 
import User from "../models/User.js"; 
import ExpressError from "../utils/ExpressError.js"; 
export const protectRoute = async (req, res, next) => { 
  try { 
    const token = req.cookies?.token; 
    if (!token) { 
      return next(new ExpressError(401, "Unauthorized: No token provided")); 
    } 
    let decoded; 
    try { 
      decoded = jwt.verify(token, process.env.JWT_SECRET); 
    } catch (err) { 
      return next(new ExpressError(401, "Invalid or expired token")); 
    } 
    const user = await User.findById(decoded.id).select("-password"); 
    if (!user) { 
      return next(new ExpressError(401, "Unauthorized: User not found")); 
    }
    if (user.banned) return next(new ExpressError(403, "Account banned"));
 
    req.user = user; 
    next(); 
  } catch (error) { 
    console.error("Auth Error:", error); 
    return next(new ExpressError(500, "Server Error: ProtectRoute failed")); 
  } 
}; 


