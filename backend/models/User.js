import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  collegeId: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  graduationYear: Number,
  role: {
    type: String,
    enum: ["admin", "alumni", "student"]
  }
}, { timestamps: true });

export default mongoose.model("User", userSchema);