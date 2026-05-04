import express from "express";
import cors from "cors";

const app = express();

/* =========================
   MIDDLEWARE
========================= */

// CORS (pro frontend + GitHub Pages / jiné domény)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

/* =========================
   "FAKE SESSION" (jednoduchá verze)
   ⚠️ na Renderu se resetuje po restartu
========================= */

let loggedIn = false;

/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {
  const { password } = req.body;

  if (password === "admin") {
    loggedIn = true;

    return res.json({
      success: true,
      token: "123"
    });
  }

  return res.status(401).json({
    success: false,
    message: "Wrong password"
  });
});

/* =========================
   CHECK AUTH (TO TI CHYBĚLO)
========================= */

app.get("/api/check-auth", (req, res) => {
  if (loggedIn) {
    return res.json({
      authenticated: true
    });
  }

  return res.json({
    authenticated: false
  });
});

/* =========================
   LOGOUT
========================= */

app.post("/api/logout", (req, res) => {
  loggedIn = false;

  return res.json({
    success: true
  });
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
