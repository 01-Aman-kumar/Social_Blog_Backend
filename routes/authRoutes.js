import express  from "express";  
import { protectRoute } from "../middleware/authMiddleware.js"; 
import { forgotPassword, login, logout, resetPassword, signup } from "../controllers/authController.js";
const router = express.Router(); 
router.route("/signup").post(signup); 
router.route("/login").post(login); 
router.route("/logout").get(logout);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword); 
router.route("/me").get(protectRoute,(req,res)=>{ 
res.json({ 
success:true, 
user:req.user, 
}); 
}); 
export default router; 