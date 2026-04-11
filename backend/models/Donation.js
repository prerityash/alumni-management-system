import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    cause: {
      type: String,
      required: true,
      enum: ["Medical aid", "Research and innovation", "Education", "Disaster"],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Credit/Debit Card", "Bank Transfer", "UPI"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;
