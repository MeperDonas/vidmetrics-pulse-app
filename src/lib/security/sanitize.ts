/**
 * HTML escaping — prevents XSS when interpolating user data into HTML strings.
 * Covers OWASP XSS prevention cheat sheet top 5 characters.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * CSV formula injection prevention.
 * Prefixes formula-triggering characters with tab so Excel
 * doesn't interpret them as formulas.
 */
export function sanitizeCsvField(field: string): string {
  if (/^[=+\-@|]/.test(field) || /^[\t\r\n]/.test(field)) {
    return "\t" + field;
  }
  return field;
}
