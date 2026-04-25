import express from "express";
import Meeting from "../models/Meeting.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET meetings for a user — must be logged in
// Extra check: you can only see YOUR OWN meetings (req.user.userId must match the userId param)
router.get("/:userId", protect, async (req, res) => {
  try {
    // Security: only allow fetching your own meetings
    if (req.user.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: "You can only view your own meetings." });
    }

    const meetings = await Meeting.find({
      $or: [{ studentId: req.params.userId }, { alumniId: req.params.userId }]
    })
    .populate("studentId", "name email")
    .populate("alumniId", "name email role")
    .sort({ date: 1 });

    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a meeting — any logged-in user can book (student books, alumni confirms)
router.post("/create", protect, async (req, res) => {
  try {
    const meeting = await Meeting.create(req.body);
    res.json({ message: "Meeting scheduled", meeting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
