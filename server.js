import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/* =========================
   DATABASE
========================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* =========================
   SCHEMAS
========================= */

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  text: String,
  color: String,
  type: String,
  startAt: String,
  startPrecision: String,
  endAt: String,
  endPrecision: String,
  audience: String,
  location: String,
  isPinned: Boolean,
  isActive: Boolean,
  createdAt: String,
  updatedAt: String
});

const ContentSchema = new mongoose.Schema({
  hero: {
    badge: String,
    title: String,
    titleAccent: String,
    subtitle: String,
    urgentStripText: String,
    urgentStripAction: String,
    chipPrimary: String,
    chipSecondary: String
  },
  contact: {
    phone: String
  }
});

const Announcement = mongoose.model("Announcement", AnnouncementSchema);
const Content = mongoose.model("Content", ContentSchema);

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* =========================
   AUTH (simple)
========================= */

let loggedIn = false;

app.post("/api/login", (req, res) => {
  if (req.body.password === "admin") {
    loggedIn = true;
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false });
});

app.get("/api/check-auth", (req, res) => {
  res.json({ authenticated: loggedIn });
});

app.post("/api/logout", (req, res) => {
  loggedIn = false;
  res.json({ success: true });
});

/* =========================
   ANNOUNCEMENTS
========================= */

app.get("/api/announcements", async (req, res) => {
  try {
    const data = await Announcement.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/api/announcements", async (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  try {
    const created = await Announcement.create({
      ...req.body,
      isActive: true,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, announcement: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/api/announcements/:id", async (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  try {
    const updated = await Announcement.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date().toISOString() },
      { new: true }
    );

    res.json({ success: true, announcement: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.delete("/api/announcements/:id", async (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   CONTENT
========================= */

app.get("/api/content", async (req, res) => {
  try {
    let content = await Content.findOne();

    if (!content) {
      content = await Content.create({
        hero: {},
        contact: {}
      });
    }

    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.put("/api/content", async (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  try {
    let content = await Content.findOne();

    if (!content) content = new Content();

    content.hero = req.body.hero || {};
    content.contact = req.body.contact || {};

    await content.save();

    res.json({ success: true, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   START SERVER (RENDER FIX)
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port " + PORT);
});