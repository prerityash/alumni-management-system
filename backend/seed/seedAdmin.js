// Seed script — run this ONCE to create the default admin account
// Run with: node seed/seedAdmin.js

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
await connectDB();

try {
  // Check if admin already exists
  const existingAdmin = await User.findOne({ role: "admin", email: "admin" });
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.create({
      name: "Admin",
      email: "admin",  // Using 'admin' as email/loginId
      password: hashedPassword,
      role: "admin"
    });
    console.log("✅ Admin user created successfully! (username/email: admin, password: 123456)");
  } else {
    console.log("⚠️ Admin user already exists.");
  }
} catch (err) {
  console.error("❌ Failed to create admin:", err.message);
}

process.exit(0);
