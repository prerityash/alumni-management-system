import mongoose from "mongoose";

// EventRegistration — stores each user's event registration
// One document = one ticket
const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",  required: true },

  // Unique ticket ID shown to the user e.g. "TKT-2026-AB3X9"
  ticketId: { type: String, unique: true },

  // Copied from user at registration time (so we still have it even if user changes details)
  name:  { type: String, default: "" },
  email: { type: String, default: "" },

  status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" }
}, { timestamps: true });

// Prevent a user from registering for the same event twice
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("EventRegistration", registrationSchema);
