import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// Root route -> serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/applications", applicationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
