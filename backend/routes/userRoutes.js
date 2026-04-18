import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const router = express.Router();

const CURRENT_YEAR = new Date().getFullYear();

// SIGNUP
router.post("/register", async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);
    const { name, collegeId, email, password, graduationYear, role: clientRole } = req.body;

    // role logic
    const role = clientRole || (graduationYear < CURRENT_YEAR ? "alumni" : "student");

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
  const { loginId, password } = req.body;

  const user = await User.findOne({
    $or: [{ email: loginId }, { collegeId: loginId }]
  });

  if (!user) return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(400).json({ error: "Invalid password" });

  res.json({
    role: user.role,
    name: user.name,
    userId: user._id
  });
});

// GET STATS (TOTAL ALUMNI)
router.get("/stats", async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({ role: "alumni" });
    res.json({ totalAlumni });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH ALUMNI BY FILTERS
router.get("/alumni/search", async (req, res) => {
  try {
    const { year, email, course } = req.query;
    
    // Core query ensures we only search alumni
    const query = { role: "alumni" };

    if (year) query.graduationYear = Number(year);
    if (email) query.email = { $regex: email, $options: "i" }; // case-insensitive partial match
    if (course) query.course = { $regex: course, $options: "i" };
    
    const alumni = await User.find(query).select("-password").sort({ name: 1 });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SUGGESTED MENTORS (ALUMNI SORTED BY RATING)
router.get("/mentors/all", async (req, res) => {
  try {
    const mentors = await User.find({ role: "alumni" })
                              .sort({ rating: -1 })
                              .limit(5)
                              .select("-password");
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET FULL MENTOR DIRECTORY
router.get("/mentors/directory", async (req, res) => {
  try {
    const mentors = await User.find({ role: "alumni", isMentorEnabled: true })
                              .select("-password")
                              .sort({ name: 1 });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER PROFILE
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER PROFILE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");
    if (!updatedUser) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;