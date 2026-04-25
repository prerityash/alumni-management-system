// Seed script — run this ONCE to add the 10 initial events to the database
// Run with: node seed/seedEvents.js

import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Event from "../models/Event.js";

dotenv.config();
await connectDB();

// Helper: get a date N days from today as ISO string
function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

const events = [
  {
    title: "National Level Hackathon 2026",
    category: "Technical",
    date: daysFromToday(5),
    time: "9:00 AM – 9:00 PM",
    location: "Main Auditorium, LPU",
    seats: 200,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=700&q=70",
    desc: "Join teams from across the country in a 12-hour coding challenge. Build innovative solutions for smart cities, healthcare, and sustainability. Best teams win scholarships worth ₹3 Lakh."
  },
  {
    title: "Alumni Annual Reunion 2026",
    category: "Alumni",
    date: daysFromToday(12),
    time: "6:00 PM – 10:00 PM",
    location: "Convention Hall, Block 32",
    seats: 500,
    fee: "₹500",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=700&q=70",
    desc: "An evening of nostalgia, networking, and celebration with batchmates and faculty. Enjoy cultural performances, gala dinner, and reconnect with your roots at LPU."
  },
  {
    title: "TechTalks: AI & Machine Learning",
    category: "Technical",
    date: daysFromToday(3),
    time: "11:00 AM – 1:00 PM",
    location: "Seminar Hall A, CSE Block",
    seats: 150,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=70",
    desc: "Industry experts from Google and Microsoft will share insights on AI/ML trends, career pathways, and live demos of cutting-edge research. Q&A session included."
  },
  {
    title: "Cultural Fiesta – Rangmanch 2026",
    category: "Cultural",
    date: daysFromToday(20),
    time: "4:00 PM – 9:00 PM",
    location: "Open Air Theatre",
    seats: 1000,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700&q=70",
    desc: "Celebrate the vibrant diversity of cultures through dance, music, drama, and art exhibitions. Representing 30+ states and 10+ countries with over 100 performances."
  },
  {
    title: "Startup Pitch Battle 2026",
    category: "Startup",
    date: daysFromToday(8),
    time: "10:00 AM – 5:00 PM",
    location: "Innovation Hub, Block 80",
    seats: 300,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&q=70",
    desc: "Present your startup idea to a panel of 10 angel investors. Top 3 startups win seed funding up to ₹10 Lakh. Open to all students and alumni with a valid business plan."
  },
  {
    title: "Annual Sports Meet – Sprint 2026",
    category: "Sports",
    date: daysFromToday(15),
    time: "8:00 AM – 6:00 PM",
    location: "University Sports Complex",
    seats: 800,
    fee: "₹100",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=700&q=70",
    desc: "Participate in 20+ sports disciplines including Athletics, Basketball, Swimming, Chess, and more. Win medals and trophies representing your department."
  },
  {
    title: "Career Fair – Recruit LPU",
    category: "Career",
    date: daysFromToday(25),
    time: "9:00 AM – 5:00 PM",
    location: "Multipurpose Hall, Block 34",
    seats: 2000,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=700&q=70",
    desc: "Meet 200+ top companies including Infosys, TCS, Wipro, Amazon, and Google. Bring your updated resume and get placed on the spot. On-site HR sessions and mock interviews."
  },
  {
    title: "Research Symposium – InnoVate",
    category: "Research",
    date: daysFromToday(10),
    time: "10:00 AM – 4:00 PM",
    location: "Research Block, Floor 3",
    seats: 100,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=700&q=70",
    desc: "Present your research paper and poster project to a distinguished panel. Top papers get published in university journal and 3 international journals."
  },
  {
    title: "Web Development Bootcamp",
    category: "Workshop",
    date: daysFromToday(2),
    time: "9:00 AM – 5:00 PM",
    location: "Computer Lab 2, CSE Block",
    seats: 60,
    fee: "₹200",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=700&q=70",
    desc: "2-day intensive bootcamp on React, Node.js, and MongoDB. Build a full-stack project from scratch. Get a completion certificate and course kit worth ₹1,500."
  },
  {
    title: "Mental Health & Wellness Summit",
    category: "Workshop",
    date: daysFromToday(18),
    time: "2:00 PM – 5:00 PM",
    location: "Student Activity Center",
    seats: 250,
    fee: "Free",
    reg: "Open",
    img: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=700&q=70",
    desc: "Join licensed counselors and mindfulness coaches for sessions on stress management, anxiety awareness, and building resilience. Safe space for all participants."
  }
];

try {
  // Delete old events first (so running this twice doesn't duplicate them)
  await Event.deleteMany({});
  console.log("🗑  Cleared old events");

  const inserted = await Event.insertMany(events);
  console.log(`✅ Seeded ${inserted.length} events successfully!`);
} catch (err) {
  console.error("❌ Seed failed:", err.message);
}

process.exit(0);
