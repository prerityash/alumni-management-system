/**
 * apiFetch — shared API helper for AlumniPortal Pro
 *
 * Authentication strategy:
 *   The JWT is stored in an HTTP-only cookie set by the server on login.
 *   JS cannot read it — this protects against XSS attacks.
 *   The browser sends the cookie automatically on every request.
 *   credentials: "include" tells fetch() to include cookies.
 *
 * Usage:
 *   apiFetch("/api/posts")
 *   apiFetch("/api/posts/create", { method: "POST", headers: {...}, body: ... })
 */
function apiFetch(url, options = {}) {
  return fetch(url, { ...options, credentials: "include" });
}
