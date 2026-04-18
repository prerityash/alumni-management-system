import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  title: String,
  role: String,
  postType: { type: String, enum: ["job", "internship", "general"], default: "general" },
  type: String, /* Remote/Onsite/Hybrid or Online/Offline */
  location: String,
  vacancy: Number,
  stipend: String,
  experience: String,
  link: String,
  description: String,
  isExpired: { type: Boolean, default: false },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;