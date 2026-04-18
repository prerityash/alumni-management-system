import express from "express";
import Post from "../models/Post.js";

const router = express.Router();

// CREATE POST
router.post("/create", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const post = await Post.create(req.body);

    console.log("SAVED:", post);

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET POSTS
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("postedBy", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH POSTS
router.get("/search/filters", async (req, res) => {
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

// MARK EXPIRED
router.put("/:id/expire", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { isExpired: true }, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;