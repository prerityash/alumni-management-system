import mongoose from "mongoose";

// Event schema — stores all university events in the database
// Admin creates events, all logged-in users can view them
const eventSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  category: { type: String, required: true }, // Technical, Cultural, Sports, Career, Alumni, Workshop, Startup, Research
  date:     { type: Date, required: true },
  time:     { type: String, default: "TBD" },
  location: { type: String, default: "LPU Campus" },
  seats:    { type: Number, default: 100 },
  fee:      { type: String, default: "Free" },   // "Free" or "₹500" etc.
  reg:      { type: String, default: "Open" },   // "Open" or "Closed"
  img:      { type: String, default: "" },        // image URL
  desc:     { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
