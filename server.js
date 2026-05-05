import express from "express";
import cors from "cors";

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* =========================
   FAKE SESSION
========================= */

let loggedIn = false;

/* =========================
   DATA STORAGE (IN MEMORY)
========================= */

let announcements = [
  {
    id: 1,
    title: "Test oznámení",
    text: "Toto je ukázkové oznámení",
    color: "bg-blue-100",
    type: "info",
    startAt: new Date().toISOString(),
    startPrecision: "datetime",
    endAt: null,
    endPrecision: "datetime",
    audience: "all",
    location: "",
    isPinned: false,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

let nextAnnouncementId = 2;

/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {
  const { password } = req.body;

  if (password === "admin") {
    loggedIn = true;
    return res.json({ success: true, token: "123" });
  }

  return res.status(401).json({
    success: false,
    message: "Wrong password"
  });
});

/* =========================
   CHECK AUTH
========================= */

app.get("/api/check-auth", (req, res) => {
  res.json({ authenticated: loggedIn });
});

/* =========================
   LOGOUT
========================= */

app.post("/api/logout", (req, res) => {
  loggedIn = false;
  res.json({ success: true });
});

/* =========================
   ANNOUNCEMENTS - GET
========================= */

app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

/* =========================
   ANNOUNCEMENTS - POST
========================= */

app.post("/api/announcements", (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const body = req.body;

  const newAnnouncement = {
    id: nextAnnouncementId++,
    title: body.title || "",
    text: body.text || "",
    color: body.color || "bg-blue-100",
    type: body.type || "info",
    startAt: body.startAt || new Date().toISOString(),
    startPrecision: body.startPrecision || "datetime",
    endAt: body.endAt || null,
    endPrecision: body.endPrecision || "datetime",
    audience: body.audience || "all",
    location: body.location || "",
    isPinned: body.isPinned || false,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  announcements.unshift(newAnnouncement);

  res.json({
    success: true,
    announcement: newAnnouncement
  });
});

/* =========================
   ANNOUNCEMENTS - DELETE (🔥 FIX)
========================= */

app.delete("/api/announcements/:id", (req, res) => {
  if (!loggedIn) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const id = Number(req.params.id);

  const index = announcements.findIndex(a => Number(a.id) === id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Announcement not found"
    });
  }

  const deleted = announcements.splice(index, 1)[0];

  res.json({
    success: true,
    deleted
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
