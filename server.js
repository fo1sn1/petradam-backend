import express from "express";
import cors from "cors";

const app = express();

// povolí komunikaci z GitHub Pages
app.use(cors());

// umožní číst JSON z requestu
app.use(express.json());

/*
  LOGIN API
  očekává: { password: "admin" }
*/
app.post("/api/login", (req, res) => {
  const { password } = req.body;

  // jednoduché ověření
  if (password === "admin") {
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

// server běží na Renderu
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
