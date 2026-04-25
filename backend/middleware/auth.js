import jwt from "jsonwebtoken";

// ─────────────────────────────────────────────────────────
// protect  →  checks if the request has a valid JWT cookie
//
// How it works:
//   1. Read the "token" cookie from the request
//   2. Verify the token using our secret key
//   3. If valid → attach { userId, role } to req.user and continue
//   4. If missing or invalid → send 401 Unauthorized
// ─────────────────────────────────────────────────────────
export const protect = (req, res, next) => {
  // Get token from the HTTP-only cookie named "token"
  const token = req.cookies?.token;

  // No cookie? Reject immediately
  if (!token) {
    return res.status(401).json({ error: "Not logged in. Please login first." });
  }

  try {
    // Verify the token — this also checks if it's expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to req so route handlers can use it
    // decoded contains: { userId, role, iat, exp }
    req.user = { userId: decoded.userId, role: decoded.role };

    // Move to the next middleware / route handler
    next();
  } catch (err) {
    // Token is invalid or expired
    return res.status(401).json({ error: "Session expired. Please login again." });
  }
};

// ─────────────────────────────────────────────────────────
// allowRoles  →  checks if the logged-in user has the right role
//
// Usage: router.post("/create", protect, allowRoles("alumni"), handler)
//
// How it works:
//   1. protect must run FIRST (it sets req.user)
//   2. allowRoles checks req.user.role against the allowed list
//   3. If allowed → continue; if not → send 403 Forbidden
// ─────────────────────────────────────────────────────────
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware above
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Only ${roles.join(" or ")} can do this.`
      });
    }
    next();
  };
};
