require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");

const { initDb } = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const { requireActiveUser } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const IS_PROD = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "256kb" }));
app.use(
  session({
    name: "task4.sid",
    secret: process.env.SESSION_SECRET || "task4-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: IS_PROD ? "none" : "lax",
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api", authRoutes);
app.use("/api/users", requireActiveUser, userRoutes);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task4 server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
