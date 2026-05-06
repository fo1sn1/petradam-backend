import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();

/* =========================
   CONFIG
========================= */

const DATA_DIR = "./data";
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, "announcements.json");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

/* =========================
   INIT FILES
========================= */

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
  fs.writeFileSync(ANNOUNCEMENTS_FILE, "[]");
}

if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(
    CONTENT_FILE,
    JSON.stringify(
      {
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
      },
      null,
      2
    )
  );
}

/* =========================
   HELPERS (SAFE LOAD/SAVE)
========================= */

function loadJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* 🚀 FIX CACHE (důležité proti “F5 cuknutí”) */
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

app.get("/api/announcements", (req, res) => {
  const data = loadJSON(ANNOUNCEMENTS_FILE, []);
  res.json(data);
});

app.post("/api/announcements", (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  const announcements = loadJSON(ANNOUNCEMENTS_FILE, []);

  const newAnnouncement = {
    id: Date.now(),
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
  };

  announcements.unshift(newAnnouncement);
  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({ success: true, announcement: newAnnouncement });
});

app.put("/api/announcements/:id", (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  const announcements = loadJSON(ANNOUNCEMENTS_FILE, []);

  const id = Number(req.params.id);
  const index = announcements.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false });
  }

  announcements[index] = {
    ...announcements[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({ success: true, announcement: announcements[index] });
});

app.delete("/api/announcements/:id", (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  let announcements = loadJSON(ANNOUNCEMENTS_FILE, []);

  const id = Number(req.params.id);
  announcements = announcements.filter(a => a.id !== id);

  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({ success: true });
});

/* =========================
   CONTENT
========================= */

app.get("/api/content", (req, res) => {
  const data = loadJSON(CONTENT_FILE, {});
  res.json(data);
});

app.put("/api/content", (req, res) => {
  if (!loggedIn) return res.status(401).json({ success: false });

  const content = {
    hero: {
      badge: req.body.hero?.badge || "",
      title: req.body.hero?.title || "",
      titleAccent: req.body.hero?.titleAccent || "",
      subtitle: req.body.hero?.subtitle || "",
      urgentStripText: req.body.hero?.urgentStripText || "",
      urgentStripAction: req.body.hero?.urgentStripAction || "",
      chipPrimary: req.body.hero?.chipPrimary || "",
      chipSecondary: req.body.hero?.chipSecondary || ""
    },
    contact: {
      phone: req.body.contact?.phone || ""
    }
  };

  saveJSON(CONTENT_FILE, content);

  res.json({ success: true, content });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});