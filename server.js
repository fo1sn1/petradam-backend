import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* =========================
   DATABASE
========================= */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
  });

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

const Announcement = mongoose.model(
  "Announcement",
  AnnouncementSchema
);

const Content = mongoose.model(
  "Content",
  ContentSchema
);

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* FIX CACHE */

app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* =========================
   AUTH
========================= */

let loggedIn = false;

app.post("/api/login", (req, res) => {
  if (req.body.password === "admin") {
    loggedIn = true;
    return res.json({ success: true });
  }

  return res.status(401).json({
    success: false
  });
});

app.get("/api/check-auth", (req, res) => {
  res.json({
    authenticated: loggedIn
  });
});

app.post("/api/logout", (req, res) => {
  loggedIn = false;

  res.json({
    success: true
  });
});

/* =========================
   ANNOUNCEMENTS - GET
========================= */

app.get("/api/announcements", async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to load announcements"
    });
  }
});

/* =========================
   ANNOUNCEMENTS - POST
========================= */

app.post("/api/announcements", async (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({
      success: false
    });
  }

  try {
    const newAnnouncement = await Announcement.create({
      title: req.body.title || "",
      text: req.body.text || "",
      color: req.body.color || "bg-blue-100",
      type: req.body.type || "info",
      startAt: req.body.startAt || new Date().toISOString(),
      startPrecision: req.body.startPrecision || "datetime",
      endAt: req.body.endAt || null,
      endPrecision: req.body.endPrecision || "datetime",
      audience: req.body.audience || "all",
      location: req.body.location || "",
      isPinned: req.body.isPinned || false,
      isActive: true,
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      announcement: newAnnouncement
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to create announcement"
    });
  }
});

/* =========================
   ANNOUNCEMENTS - PUT
========================= */

app.put("/api/announcements/:id", async (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({
      success: false
    });
  }

  try {
    const updatedAnnouncement =
      await Announcement.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedAt: new Date().toISOString()
        },
        {
          new: true
        }
      );

    if (!updatedAnnouncement) {
      return res.status(404).json({
        success: false,
        error: "Announcement not found"
      });
    }

    res.json({
      success: true,
      announcement: updatedAnnouncement
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to update announcement"
    });
  }
});

/* =========================
   ANNOUNCEMENTS - DELETE
========================= */

app.delete("/api/announcements/:id", async (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({
      success: false
    });
  }

  try {
    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to delete announcement"
    });
  }
});

/* =========================
   CONTENT - GET
========================= */

app.get("/api/content", async (req, res) => {
  try {
    let content = await Content.findOne();

    if (!content) {
      content = await Content.create({
        hero: {
          badge: "",
          title: "",
          titleAccent: "",
          subtitle: "",
          urgentStripText: "",
          urgentStripAction: "",
          chipPrimary: "",
          chipSecondary: ""
        },
        contact: {
          phone: ""
        }
      });
    }

    res.json(content);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to load content"
    });
  }
});

/* =========================
   CONTENT - PUT
========================= */

app.put("/api/content", async (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({
      success: false
    });
  }

  try {
    let content = await Content.findOne();

    if (!content) {
      content = new Content();
    }

    content.hero = {
      badge: req.body.hero?.badge || "",
      title: req.body.hero?.title || "",
      titleAccent: req.body.hero?.titleAccent || "",
      subtitle: req.body.hero?.subtitle || "",
      urgentStripText: req.body.hero?.urgentStripText || "",
      urgentStripAction: req.body.hero?.urgentStripAction || "",
      chipPrimary: req.body.hero?.chipPrimary || "",
      chipSecondary: req.body.hero?.chipSecondary || ""
    };

    content.contact = {
      phone: req.body.contact?.phone || ""
    };

    await content.save();

    res.json({
      success: true,
      content
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to save content"
    });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
