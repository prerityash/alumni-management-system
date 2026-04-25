/**
 * apiFetch — shared API helper for AlumniPortal Pro
 *
 * Why this exists:
 *   Every fetch() call needs credentials: "include" so the browser
 *   sends the JWT cookie automatically. Instead of writing it every time,
 *   this helper adds it for you.
 *
 * Usage:
 *   apiFetch("/api/posts")                           // GET
 *   apiFetch("/api/posts/create", { method: "POST", headers: {...}, body: ... }) // POST
 *
 * It works exactly like fetch() — just without needing credentials every time.
 */
function apiFetch(url, options = {}) {
  return fetch(url, { ...options, credentials: "include" });
}
