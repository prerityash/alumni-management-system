import express from "express";
import Donation from "../models/Donation.js";

const router = express.Router();

// GET all donations (sorted by newest, populated with user name)
router.get("/", async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new donation
router.post("/create", async (req, res) => {
  try {
    const { amount, cause, paymentMethod, userId } = req.body;

    if (!amount || !cause || !paymentMethod || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newDonation = new Donation({
      amount,
      cause,
      paymentMethod,
      userId,
    });

    await newDonation.save();
    res.status(201).json({ message: "Donation successful", newDonation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
