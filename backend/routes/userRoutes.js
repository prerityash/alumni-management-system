import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const CURRENT_YEAR = new Date().getFullYear();

// SIGNUP
router.post("/register", async (req, res) => {
  try {
    const { name, collegeId, email, password, graduationYear } = req.body;

    // role logic
    const role = graduationYear < CURRENT_YEAR ? "alumni" : "student";

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      collegeId,
      email,
      password: hashedPassword,
      graduationYear,
      role
    });

    res.json({ message: "Signup successful, please login" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { collegeId, password } = req.body;

    // ADMIN LOGIN (hardcoded)
    if (collegeId === "admin" && password === "admin123") {
      return res.json({ role: "admin" });
    }

    const user = await User.findOne({ collegeId });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    res.json({
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;