import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives notification
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who triggered it
    type: { 
      type: String, 
      enum: ["follow", "like", "comment"], 
      required: true 
    },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
