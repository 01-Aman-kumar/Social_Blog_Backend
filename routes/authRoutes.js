import express  from "express";  
import { protectRoute } from "../middleware/authMiddleware.js"; 
import { forgotPassword, login, logout, resetPassword, sendOtp, signup, verifyOtp } from "../controllers/authController.js";
const router = express.Router(); 
router.route("/signup").post(signup); 
router.route("/login").post(login); 
router.route("/logout").get(logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword); 
router.route("/me").get(protectRoute,(req,res)=>{ 
res.json({ 
success:true, 
user:req.user, 
}); 
}); 
export default router; 