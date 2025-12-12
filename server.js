import express from 'express'; 
import dotenv from "dotenv"; 
import cors from "cors"; 
import connectDB from "./config/db.js"; 
import ExpressError from './utils/ExpressError.js'; 
import cookieParser from "cookie-parser"; 
import authRoutes from "./routes/authRoutes.js"; 
import categoryRoutes from "./routes/categoryRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sendEmail from './utils/sendEmail.js';
dotenv.config(); 
const app=express(); 
connectDB(); 
app.use(cors({ 
origin: process.env.CLIENT_URL, 
credentials: true, // important for cookies 
})); 
app.use(express.json()); 
app.use(cookieParser()); 
app.get("/",(req,res)=>{ 
res.send("Server is running..."); 
}); 

app.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "your_email@gmail.com",
      subject: "Test Email",
      text: "Email system is working!",
    });

    res.send("Email sent!");
  } catch (error) {
    res.status(500).send(error.message);
  }
});


//All Routes 
app.use("/api/auth",authRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
// 404 Error Handling Middleware 
app.use((req, res, next) => { 
next(new ExpressError(404,"Page Not Found")); 
}); 
// Error Handling Middleware 
app.use((err,req,res,next)=>{ 
let {statusCode=500,message="Something went wrong"}=err; 
res.status(statusCode).json({message}); 
});

const PORT=process.env.PORT; 
app.listen(PORT,()=>{ 
console.log("server is running on Port "+PORT); 
}); 