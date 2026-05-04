import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────────
// protect  →  verifies the JWT from the HTTP-only cookie
//
// HTTP-only cookies cannot be read by JavaScript — safe from XSS.
// The browser sends them automatically on every request.
//
// How it works:
//   1. Read the "token" cookie from the request
//   2. Verify it using our JWT secret
//   3. If valid → attach { userId, role } to req.user and continue
//   4. If missing or invalid → send 401 Unauthorized
// ─────────────────────────────────────────────────────────────
export const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Not logged in. Please login first." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired. Please login again." });
  }
};

// ─────────────────────────────────────────────────────────────
// allowRoles  →  checks if the logged-in user has the right role
//
// Usage: router.post("/create", protect, allowRoles("alumni"), handler)
// ─────────────────────────────────────────────────────────────
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Only ${roles.join(" or ")} can do this.`
      });
    }
    next();
  };
};
