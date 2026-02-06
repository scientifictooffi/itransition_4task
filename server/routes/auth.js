const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const { getDb } = require("../db");
const { getUniqIdValue } = require("../utils/uniqId");
const { sendVerificationEmail } = require("../mailer");
const { requireActiveUser } = require("../middleware/auth");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

function normalizeEmail(value) {
  // important: normalize email consistently for uniqueness.
  // note: this is a simple lowercase transform for storage.
  // nota bene: avoid custom parsing beyond this.
  return value.trim().toLowerCase();
}

async function hashPassword(password) {
  // important: use a proven hash library for passwords.
  // note: bcryptjs handles salt internally.
  // nota bene: do not store plaintext passwords.
  return bcrypt.hash(password, 10);
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { name, email, password } = parsed.data;
  const db = getDb();
  const now = new Date().toISOString();

  const userId = getUniqIdValue();
  const verifyToken = getUniqIdValue();
  const passwordHash = await hashPassword(password);

  try {
    await db.run(
      `
        INSERT INTO users (id, name, email, password_hash, status, verify_token, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'unverified', ?, ?, ?)
      `,
      userId,
      name.trim(),
      normalizeEmail(email),
      passwordHash,
      verifyToken,
      now,
      now
    );
  } catch (error) {
    if (String(error).includes("SQLITE_CONSTRAINT")) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Registration failed" });
  }

  const verifyLink = `${process.env.PUBLIC_API_URL || "http://localhost:4000"}/api/verify?token=${verifyToken}`;
  setImmediate(() => {
    sendVerificationEmail(email, verifyLink).catch(() => {});
  });

  return res.status(201).json({
    message: "Registered successfully. Verification email sent.",
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;
  const db = getDb();
  const user = await db.get("SELECT * FROM users WHERE email = ?", normalizeEmail(email));

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (user.status === "blocked") {
    return res.status(403).json({ message: "Account is blocked" });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  await db.run("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?", new Date().toISOString(), new Date().toISOString(), user.id);
  req.session.userId = user.id;

  return res.status(200).json({ message: "Login successful" });
});

router.post("/logout", requireActiveUser, (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ message: "Logged out" });
  });
});

router.get("/verify", async (req, res) => {
  const token = req.query.token;
  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }

  const db = getDb();
  const user = await db.get("SELECT * FROM users WHERE verify_token = ?", token);
  if (!user) {
    return res.status(404).json({ message: "Invalid token" });
  }

  if (user.status !== "blocked") {
    await db.run(
      "UPDATE users SET status = 'active', verify_token = NULL, updated_at = ? WHERE id = ?",
      new Date().toISOString(),
      user.id
    );
  }

  return res.status(200).json({ message: "Email verified" });
});

router.get("/me", requireActiveUser, async (req, res) => {
  const db = getDb();
  const user = await db.get(
    "SELECT id, name, email, status, last_login_at, created_at FROM users WHERE id = ?",
    req.user.id
  );

  return res.status(200).json({ user });
});

module.exports = router;
