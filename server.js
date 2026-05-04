import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* =========================
   AUTH (jednoduchý session)
========================= */

let loggedIn = false;

/* =========================
   DATA STORAGE (RAM)
========================= */

let announcements = [];
let faq = [];
let id = 1;

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
   AUTH MIDDLEWARE
========================= */

function auth(req, res, next) {
  if (!loggedIn) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/* =========================
   ANNOUNCEMENTS
========================= */

app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/api/announcements", auth, (req, res) => {
  const item = {
    id: id++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  announcements.unshift(item);
  res.json(item);
});

app.put("/api/announcements/:id", auth, (req, res) => {
  const index = announcements.findIndex(a => a.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  announcements[index] = {
    ...announcements[index],
    ...req.body,
    id: announcements[index].id
  };

  res.json(announcements[index]);
});

app.delete("/api/announcements/:id", auth, (req, res) => {
  announcements = announcements.filter(a => a.id != req.params.id);
  res.json({ success: true });
});

/* =========================
   FAQ
========================= */

app.get("/api/faq", (req, res) => {
  res.json(faq);
});

app.post("/api/faq", auth, (req, res) => {
  const item = {
    id: id++,
    ...req.body
  };

  faq.push(item);
  res.json(item);
});

app.put("/api/faq/:id", auth, (req, res) => {
  const index = faq.findIndex(f => f.id == req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  faq[index] = {
    ...faq[index],
    ...req.body
  };

  res.json(faq[index]);
});

app.delete("/api/faq/:id", auth, (req, res) => {
  faq = faq.filter(f => f.id != req.params.id);
  res.json({ success: true });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
