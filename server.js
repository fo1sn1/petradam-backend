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
   SIMPLE AUTH (SESSION FAKE)
========================= */

let loggedIn = false;

/* =========================
   MEMORY DATABASE
========================= */

let announcements = [];
let faq = [];
let reviews = [];
let nextId = 1;

let content = {
  hero: {},
  contact: {}
};

/* =========================
   AUTH
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

app.get("/api/check-auth", (req, res) => {
  return res.json({ authenticated: loggedIn });
});

app.post("/api/logout", (req, res) => {
  loggedIn = false;
  res.json({ success: true });
});

/* =========================
   ANNOUNCEMENTS (CRUD)
========================= */

app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

app.post("/api/announcements", (req, res) => {
  const item = {
    id: nextId++,
    ...req.body,
    createdAt: new Date().toISOString()
  };

  announcements.push(item);
  res.json(item);
});

app.put("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = announcements.findIndex(a => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Not found" });
  }

  announcements[index] = {
    ...announcements[index],
    ...req.body
  };

  res.json(announcements[index]);
});

app.delete("/api/announcements/:id", (req, res) => {
  const id = Number(req.params.id);
  announcements = announcements.filter(a => a.id !== id);

  res.json({ success: true });
});

/* =========================
   FAQ
========================= */

app.get("/api/faq", (req, res) => {
  res.json(faq);
});

app.post("/api/faq", (req, res) => {
  const item = {
    id: nextId++,
    ...req.body
  };

  faq.push(item);
  res.json(item);
});

app.put("/api/faq/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = faq.findIndex(f => f.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  faq[index] = { ...faq[index], ...req.body };
  res.json(faq[index]);
});

app.delete("/api/faq/:id", (req, res) => {
  const id = Number(req.params.id);
  faq = faq.filter(f => f.id !== id);

  res.json({ success: true });
});

/* =========================
   REVIEWS
========================= */

app.get("/api/reviews/admin", (req, res) => {
  res.json(reviews);
});

app.post("/api/reviews", (req, res) => {
  const item = {
    id: nextId++,
    ...req.body
  };

  reviews.push(item);
  res.json(item);
});

app.put("/api/reviews/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = reviews.findIndex(r => r.id === id);

  if (index === -1) return res.status(404).json({ error: "Not found" });

  reviews[index] = { ...reviews[index], ...req.body };
  res.json(reviews[index]);
});

app.delete("/api/reviews/:id", (req, res) => {
  const id = Number(req.params.id);
  reviews = reviews.filter(r => r.id !== id);

  res.json({ success: true });
});

/* =========================
   CONTENT
========================= */

app.get("/api/content", (req, res) => {
  res.json(content);
});

app.post("/api/content", (req, res) => {
  content = {
    ...content,
    ...req.body
  };

  res.json(content);
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
