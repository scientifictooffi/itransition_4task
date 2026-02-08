const { getDb } = require("../db");

async function requireActiveUser(req, res, next) {
  const userId = req.session?.userId;
  const wantsJson = req.originalUrl.startsWith("/api");
  if (!userId) {
    if (wantsJson) {
      return res.status(401).json({ redirect: "/login" });
    }
    return res.redirect("/login");
  }

  const db = getDb();
  const user = await db.get("SELECT * FROM users WHERE id = $1", userId);

  if (!user || user.status === "blocked") {
    req.session.destroy(() => {});
    if (wantsJson) {
      return res.status(403).json({ redirect: "/login" });
    }
    return res.redirect("/login");
  }

  req.user = user;
  return next();
}

module.exports = { requireActiveUser };
