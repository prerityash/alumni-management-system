import express from "express";
import Event from "../models/Event.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// GET all events — any logged-in user can view events
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // sorted by date ascending
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create event — only admin can create events
router.post("/create", protect, allowRoles("admin"), async (req, res) => {
  try {
    const { title, category, date, time, location, seats, fee, reg, img, desc } = req.body;
    if (!title || !category || !date) {
      return res.status(400).json({ error: "Title, category, and date are required" });
    }
    const event = await Event.create({ title, category, date, time, location, seats, fee, reg, img, desc });
    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE event — only admin can delete events
router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
