import express from "express";
import Donation from "../models/Donation.js";
import { protect, allowRoles } from "../middleware/auth.js";
import Razorpay from "razorpay";

const router = express.Router();

// GET Razorpay Public Key for Frontend
router.get("/get-key", protect, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// POST create Razorpay order
router.post("/create-order", protect, allowRoles("alumni"), async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: "Amount is required" });

    // Razorpay amount is in paise (smallest currency unit), so multiply by 100
    // Assuming amount passed is in INR for Razorpay. If USD, Razorpay supports currency "USD" too.
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all donations — any logged-in user can see the donation list
router.get("/", protect, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new donation — only alumni can donate
// (Donation button is only shown on the alumni dashboard)
router.post("/create", protect, allowRoles("alumni"), async (req, res) => {
  try {
    const { amount, cause, paymentMethod, userId } = req.body;

    if (!amount || !cause || !paymentMethod || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newDonation = new Donation({ amount, cause, paymentMethod, userId });
    await newDonation.save();
    res.status(201).json({ message: "Donation successful", newDonation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
