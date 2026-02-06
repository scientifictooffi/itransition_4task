const express = require("express");
const { z } = require("zod");

const { getDb } = require("../db");

const router = express.Router();

const idsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Select at least one user"),
});

function buildInClause(ids) {
  // important: placeholders keep SQL safe without custom escaping.
  // note: we rely on database parameter binding here.
  // nota bene: this helper keeps query assembly consistent.
  return {
    clause: ids.map(() => "?").join(", "),
    values: ids,
  };
}

router.get("/", async (req, res) => {
  const db = getDb();
  const users = await db.all(`
    SELECT id, name, email, status, last_login_at, created_at
    FROM users
    ORDER BY (last_login_at IS NULL) ASC, last_login_at DESC
  `);

  return res.status(200).json({ users });
});

router.post("/block", async (req, res) => {
  const parsed = idsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { clause, values } = buildInClause(parsed.data.ids);
  const db = getDb();
  await db.run(
    `UPDATE users SET status = 'blocked', updated_at = ? WHERE id IN (${clause})`,
    new Date().toISOString(),
    ...values
  );

  return res.status(200).json({ message: "Users blocked" });
});

router.post("/unblock", async (req, res) => {
  const parsed = idsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { clause, values } = buildInClause(parsed.data.ids);
  const db = getDb();
  await db.run(
    `UPDATE users SET status = 'active', updated_at = ? WHERE id IN (${clause})`,
    new Date().toISOString(),
    ...values
  );

  return res.status(200).json({ message: "Users unblocked" });
});

router.post("/delete", async (req, res) => {
  const parsed = idsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { clause, values } = buildInClause(parsed.data.ids);
  const db = getDb();
  await db.run(`DELETE FROM users WHERE id IN (${clause})`, ...values);

  return res.status(200).json({ message: "Users deleted" });
});

router.post("/delete-unverified", async (req, res) => {
  const parsed = idsSchema.partial().safeParse(req.body || {});
  const db = getDb();

  if (parsed.success && parsed.data.ids && parsed.data.ids.length > 0) {
    const { clause, values } = buildInClause(parsed.data.ids);
    await db.run(
      `DELETE FROM users WHERE status = 'unverified' AND id IN (${clause})`,
      ...values
    );
  } else {
    await db.run("DELETE FROM users WHERE status = 'unverified'");
  }

  return res.status(200).json({ message: "Unverified users deleted" });
});

module.exports = router;
