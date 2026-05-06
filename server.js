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
  fs.mkdirSync(DATA_DIR);
}

if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
  fs.writeFileSync(ANNOUNCEMENTS_FILE, "[]");
}

if (!fs.existsSync(CONTENT_FILE)) {
  fs.writeFileSync(
    CONTENT_FILE,
    JSON.stringify(
      {
        hero: {},
        contact: {}
      },
      null,
      2
    )
  );
}

/* =========================
   HELPERS
========================= */

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return null;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* =========================
   LOAD DATA
========================= */

let announcements = loadJSON(ANNOUNCEMENTS_FILE) || [];
let content = loadJSON(CONTENT_FILE) || { hero: {}, contact: {} };

let nextAnnouncementId =
  announcements.length > 0
    ? Math.max(...announcements.map(a => a.id)) + 1
    : 1;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

/* =========================
   FAKE SESSION
========================= */

let loggedIn = false;

/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {
  if (req.body.password === "admin") {
    loggedIn = true;
    return res.json({ success: true });
  }

  res.status(401).json({ success: false });
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
  res.json(announcements);
});

app.post("/api/announcements", (req, res) => {
  if (!loggedIn) return res.status(401).json({});

  const newAnnouncement = {
    id: nextAnnouncementId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  announcements.unshift(newAnnouncement);
  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({
    success: true,
    announcement: newAnnouncement
  });
});

/* ✅ EDIT FIX + SAVE */
app.put("/api/announcements/:id", (req, res) => {
  if (!loggedIn) return res.status(401).json({});

  const id = Number(req.params.id);
  const index = announcements.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  announcements[index] = {
    ...announcements[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({
    success: true,
    announcement: announcements[index]
  });
});

app.delete("/api/announcements/:id", (req, res) => {
  if (!loggedIn) return res.status(401).json({});

  const id = Number(req.params.id);

  announcements = announcements.filter(a => a.id !== id);

  saveJSON(ANNOUNCEMENTS_FILE, announcements);

  res.json({ success: true });
});

/* =========================
   CONTENT
========================= */

app.get("/api/content", (req, res) => {
  res.json(content);
});

app.put("/api/content", (req, res) => {
  if (!loggedIn) return res.status(401).json({});

  content = {
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

  res.json({
    success: true,
    content
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});