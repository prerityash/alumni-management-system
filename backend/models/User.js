import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  collegeId: { type: String, unique: true, sparse: true },
  email: { type: String, unique: true },
  password: String,
  graduationYear: Number,
  role: {
    type: String,
    enum: ["admin", "alumni", "student"]
  },
  phone: String,
  linkedin: String,
  course: String,
  company: String,
  jobPost: String,
  workExperience: String,
  bio: String,
  rating: { type: Number, default: 0 },
  profilePic: String,
  
  // Mentorship Setup
  isMentorEnabled: { type: Boolean, default: false },
  mentorDay: String,
  mentorTime: String,
  mentorEmail: String,
  mentorContact: String,
  mentorLink: String
}, { timestamps: true });

export default mongoose.model("User", userSchema);