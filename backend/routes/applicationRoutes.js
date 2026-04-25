import express from "express";
import Application from "../models/Application.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// GET applications for a student — must be logged in
// Extra check: you can only see YOUR OWN applications
router.get("/:userId", protect, async (req, res) => {
  try {
    // Security: only allow fetching your own applications
    if (req.user.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: "You can only view your own applications." });
    }

    const apps = await Application.find({ studentId: req.params.userId })
      .populate("postId")
      .sort({ createdAt: -1 });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE application — only students can apply to jobs
router.post("/create", protect, allowRoles("student"), async (req, res) => {
  try {
    const app = await Application.create(req.body);
    res.json({ message: "Applied successfully", application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
