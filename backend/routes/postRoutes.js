import express from "express";
import Post from "../models/Post.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// CREATE POST — only alumni can post jobs/internships
router.post("/create", protect, allowRoles("alumni"), async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL POSTS — any logged-in user can view
router.get("/", protect, async (req, res) => {
  try {
    const posts = await Post.find().populate("postedBy", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH POSTS WITH FILTERS — any logged-in user
router.get("/search/filters", protect, async (req, res) => {
  try {
    const { role, location, type, experience, authorId } = req.query;
    let query = {};

    if (role) query.role = { $regex: role, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (type) query.type = { $regex: type, $options: "i" };
    if (experience) query.experience = { $regex: experience, $options: "i" };
    if (authorId) query.postedBy = authorId;

    const posts = await Post.find(query).populate("postedBy", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARK POST AS EXPIRED — only alumni can expire posts
router.put("/:id/expire", protect, allowRoles("alumni"), async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isExpired: true }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE POST — only alumni can delete posts
router.delete("/:id", protect, allowRoles("alumni"), async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;