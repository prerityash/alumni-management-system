import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect, allowRoles } from "../middleware/auth.js";

const router = express.Router();

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────
// Helper: create JWT and set it as an HTTP-only cookie
//
// httpOnly: true  → JS cannot read this cookie (safe from XSS attacks)
// sameSite: lax   → cookie is sent on normal navigation (not cross-site)
// secure: false   → set to true in production (requires HTTPS)
// maxAge: 7 days  → cookie expires in 7 days
// ─────────────────────────────────────────────────────────────
function sendTokenCookie(res, userId, role) {
  const token = jwt.sign(
    { userId, role },           // payload: who the user is
    process.env.JWT_SECRET,     // secret key from .env
    { expiresIn: "7d" }         // token expires in 7 days
  );

  res.cookie("token", token, {
    httpOnly: true,                              // cannot be accessed by JavaScript
    sameSite: "lax",                             // safe for same-site requests
    secure: process.env.NODE_ENV === "production", // true on Render (HTTPS), false locally
    maxAge: 7 * 24 * 60 * 60 * 1000             // 7 days in milliseconds
  });
}

// ─────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no login required)
// ─────────────────────────────────────────────────────────────

// SIGNUP — anyone can register
router.post("/register", async (req, res) => {
  try {
    const { name, collegeId, email, password, graduationYear, role: clientRole } = req.body;

    // Backend Validation
    if (!name) return res.status(400).json({ error: "username is empty" });
    if (!email) return res.status(400).json({ error: "email is empty" });
    if (!password) return res.status(400).json({ error: "password is empty" });
    if (password.length < 6) return res.status(400).json({ error: "minlength of password is 6" });

<<<<<<< HEAD
    // role logic
    const role = clientRole || (graduationYear < CURRENT_YEAR ? "alumni" : "student");

=======
    // Determine role
    const role = clientRole || (graduationYear < CURRENT_YEAR ? "alumni" : "student");

    if (role === "admin") {
      return res.status(403).json({ error: "Cannot register as admin" });
    }

>>>>>>> 647fc08 (added jwt and admin page)
    if (role === "student" && !collegeId) return res.status(400).json({ error: "college id is empty" });
    if (role === "alumni" && !graduationYear) return res.status(400).json({ error: "graduation year is empty" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, collegeId, email, password: hashedPassword, graduationYear, role });

    res.json({ message: "Signup successful, please login" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGIN — verify password, then issue JWT cookie
router.post("/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;

<<<<<<< HEAD
  // Backend Validation
  if (!loginId) return res.status(400).json({ error: "username is empty" });
  if (!password) return res.status(400).json({ error: "password is empty" });

  const user = await User.findOne({
    $or: [{ email: loginId }, { collegeId: loginId }]
  });
=======
    // Backend Validation
    if (!loginId) return res.status(400).json({ error: "username is empty" });
    if (!password) return res.status(400).json({ error: "password is empty" });
>>>>>>> 647fc08 (added jwt and admin page)

    const user = await User.findOne({
      $or: [{ email: loginId }, { collegeId: loginId }]
    });

    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    // ✅ Issue JWT as a cookie
    sendTokenCookie(res, user._id, user.role);

    // Return user info for the frontend (to show name, redirect to correct dashboard)
    res.json({
      role: user.role,
      name: user.name,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// LOGOUT — clear the cookie
router.post("/logout", (req, res) => {
  // Clear the cookie by setting maxAge to 0
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0  // expire immediately
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
// RBAC check: req.user.userId (from JWT) must match req.params.id
router.put("/:id", protect, async (req, res) => {
  try {
    // Security check: only allow updating your OWN profile
    // req.user is set by the protect middleware from the JWT token
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

<<<<<<< HEAD
export default router;
=======
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

export default router;
>>>>>>> 647fc08 (added jwt and admin page)
