import express from "express";
import EventRegistration from "../models/EventRegistration.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

// Helper: generate a unique ticket ID like "TKT-2026-AB3X9"
function generateTicketId() {
  const year  = new Date().getFullYear();
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 chars
  const part2 = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 chars
  return `TKT-${year}-${part1}${part2}`;
}

// ── REGISTER FOR AN EVENT ─────────────────────────────────────
// Any logged-in user (student or alumni) can register
router.post("/create", protect, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.userId; // from JWT, not from body (safer)

    // Check the event exists and is not expired
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const eventDate = new Date(event.date);
    eventDate.setHours(23, 59, 59, 999); // allow registering on event day
    if (eventDate < new Date()) {
      return res.status(400).json({ error: "This event has already ended. Registration is closed." });
    }

    // Get user details to store on the ticket
    const user = await User.findById(userId).select("name email");

    // Create registration — if duplicate, MongoDB unique index will throw error
    const ticketId = generateTicketId();
    const registration = await EventRegistration.create({
      eventId,
      userId,
      ticketId,
      name:  user.name,
      email: user.email
    });

    // Populate event info for the response
    await registration.populate("eventId", "title category date time location fee");

    res.status(201).json({
      message: "Registered successfully!",
      registration
    });

  } catch (err) {
    // Duplicate key error — user already registered
    if (err.code === 11000) {
      return res.status(400).json({ error: "You are already registered for this event." });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── GET MY REGISTRATIONS (MY TICKETS) ────────────────────────
// Returns all tickets for the currently logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user.userId })
      .populate("eventId", "title category date time location fee img")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET ALL REGISTRATIONS FOR AN EVENT (admin only) ───────────
router.get("/event/:eventId", protect, allowRoles("admin"), async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.eventId })
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── CANCEL A REGISTRATION (admin only) ───────────────────────
router.delete("/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    await EventRegistration.findByIdAndDelete(req.params.id);
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
