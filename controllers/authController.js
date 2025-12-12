import User from "../models/User.js"; 
import bcrypt from "bcrypt"; 
import ExpressError from "../utils/ExpressError.js"; 
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js"; // implement with nodemailer
import { generateResetToken } from "../utils/generateResetToken.js";
import dotenv from "dotenv";
dotenv.config();
import crypto from "crypto"; 
export const signup = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return next(new ExpressError(400, "All fields are required"));
    }

    // Check existing
    const emailExist = await User.findOne({ email });
    if (emailExist) return next(new ExpressError(400, "Email already exists"));

    const user = await User.create({
      name,
      username,
      email,
      password, // pre-save hook will hash it
    });

    // Token
    const token = generateToken(user._id);

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",    // render/vercel me true
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

    const savedUser = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: savedUser,
    });
  } catch (error) {
    console.log("Signup Error:", error);
    return next(new ExpressError(500, "Server Error"));
  }
};

export const login=async(req,res,next)=>{ 
    try { 
        const{email,password}=req.body; 
        if(!email||!password){ 
            return next(new ExpressError(400,"Email and Password are required")); 
        } 
        //check user exists 
        const user =await User.findOne({email}).select("+password"); 
        if(!user){ 
            return next(new ExpressError(400,"Invalid email or password")); 
        } 
        //compare password 
        const isMatch= await bcrypt.compare(password,user.password); 
        if(!isMatch){ 
            return next(new ExpressError(400,"Invalid email or password")); 
        } 
        const token=generateToken(user._id); 
        //  res.cookie("token",token,{ 
        //     httpOnly:true, 
        //     secure:false, 
        //     sameSite:"strict", 
        //     maxAge:7*24*60*60*1000, 
        // });
        
        res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",    // render/vercel me true
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
        const loggedUser = await User.findById(user._id).select("-password"); 
 
        res.status(200).json({ 
            success:true, 
            message:"Login successful", 
            user:loggedUser, 
        }); 
 
    } catch (error) { 
        return next(new ExpressError(500,"Server Error")); 
    } 
} 
export const logout=async (req,res,next)=>{ 
    try { 
 
        // res.cookie("token","",{ 
        //     httpOnly:true, 
        //     expires:new Date(0),  //cookie expire instantly 
        // }); 
        res.cookie("token", "", {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  expires: new Date(0)
});


        res.status(200).json({ 
            success: true, 
      message: "Logged out successfully", 
        }) 
         
    } catch (error) { 
        next(error); 
    } 
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ExpressError(400, "Email is required"));

    const user = await User.findOne({ email });
    if (!user) return next(new ExpressError(404, "No user with that email"));

    const { token, hashed } = generateResetToken();

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();
    

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const message = `You requested a password reset. Click below:\n\n${resetUrl}\n\nIf you didn't request this, ignore.`;
    await sendEmail({
      to: user.email,
      subject: "Password reset",
      text: message,
    });

    res.json({ success: true, message: "Reset email sent" });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!password) return next(new ExpressError(400, "Password required"));

    const hashed = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return next(new ExpressError(400, "Token invalid or expired"));

    user.password = password; // pre-save will hash (ensure pre-save hook)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};