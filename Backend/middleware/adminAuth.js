const crypto = require("crypto");

// Simple in-memory session store.
// NOTE: this resets on server restart / redeploy and does not scale across
// multiple instances. Fine for a single small admin panel; swap for
// JWT + a persisted User model if this needs to be production-grade.
const activeTokens = new Set();

function issueToken() {
  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.add(token);
  return token;
}

function revokeToken(token) {
  activeTokens.delete(token);
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  next();
}

module.exports = { issueToken, revokeToken, requireAdmin };
