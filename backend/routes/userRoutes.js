import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect, allowRoles } from "../middleware/auth.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

const CURRENT_YEAR = new Date().getFullYear();



// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no login required)
// ─────────────────────────────────────────────────────────────

// SIGNUP — anyone can register
router.post("/register", [
  body("name").notEmpty().withMessage("username is empty"),
  body("email").notEmpty().withMessage("email is empty"),
  // collegeId (registration no) is only required for students
  body("collegeId")
    .if(body("role").equals("student"))
    .notEmpty().withMessage("registration no is empty"),
  body("password")
    .notEmpty().withMessage("password is empty")
    .isLength({ min: 6 }).withMessage("minlength of password is 6")
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, collegeId, email, password, graduationYear, role: clientRole } = req.body;

    // Determine role
    const role = clientRole || (graduationYear < CURRENT_YEAR ? "alumni" : "student");

    if (role === "admin") {
      return res.status(403).json({ error: "Cannot register as admin" });
    }

    // Extra safety: alumni must have a graduation year
    if (role === "alumni" && !graduationYear) {
      return res.status(400).json({ error: "graduation year is empty" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, collegeId, email, password: hashedPassword, graduationYear, role });

    res.json({ message: "Signup successful, please login" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN — verify credentials, then set a signed JWT as an HTTP-only cookie
// HTTP-only = JS cannot read it → safe from XSS attacks
// The browser sends it automatically on every request to this domain
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId) return res.status(400).json({ error: "username is empty" });
    if (!password) return res.status(400).json({ error: "password is empty" });

    const user = await User.findOne({
      $or: [{ email: loginId }, { collegeId: loginId }, { name: loginId }]
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    // Sign the JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Store JWT in an HTTP-only cookie — JS cannot read this
    res.cookie("token", token, {
      httpOnly: true,                                         // not accessible via JS
      sameSite: "lax",                                       // sent on normal navigation
      secure: process.env.NODE_ENV === "production",          // HTTPS only in production
      maxAge: 7 * 24 * 60 * 60 * 1000                        // 7 days in ms
    });

    // Only send non-sensitive info in the response body (NOT the token)
    res.json({ role: user.role, name: user.name, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGOUT — clear the HTTP-only cookie
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0   // expire immediately
  });
  res.json({ message: "Logged out successfully" });
});


// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTES (login required for all below)
// ─────────────────────────────────────────────────────────────

// GET STATS (total alumni) — any logged-in user
router.get("/stats", protect, async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({ role: "alumni" });
    res.json({ totalAlumni });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SEARCH ALUMNI BY FILTERS — any logged-in user
router.get("/alumni/search", protect, async (req, res) => {
  try {
    const { year, email, course } = req.query;
    const query = { role: "alumni" };

    if (year) query.graduationYear = Number(year);
    if (email) query.email = { $regex: email, $options: "i" };
    if (course) query.course = { $regex: course, $options: "i" };

    const alumni = await User.find(query).select("-password").sort({ name: 1 });
    res.json(alumni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SUGGESTED MENTORS — any logged-in user
router.get("/mentors/all", protect, async (req, res) => {
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

// GET FULL MENTOR DIRECTORY — any logged-in user
router.get("/mentors/directory", protect, async (req, res) => {
  try {
    const mentors = await User.find({ role: "alumni", isMentorEnabled: true })
      .select("-password")
      .sort({ name: 1 });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN-ONLY ROUTES
// ─────────────────────────────────────────────────────────────

// GET ALL USERS — admin sees every student and alumni account
router.get("/admin/all-users", protect, allowRoles("admin"), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE A USER — admin can remove any student or alumni account
router.delete("/admin/delete/:id", protect, allowRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") return res.status(403).json({ error: "Cannot delete admin account" });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER PROFILE — any logged-in user
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE USER PROFILE — only the owner can update their own profile
router.put("/:id", protect, async (req, res) => {
  try {
    if (req.user.userId.toString() !== req.params.id) {
      return res.status(403).json({ error: "You can only update your own profile." });
    }

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
