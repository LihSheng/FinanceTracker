/**
 * Helper utilities for authentication
 */

/**
 * Generate a secure random secret for NextAuth
 * Run this in Node.js to generate a secret:
 * node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
export function generateAuthSecret(): string {
  if (typeof window !== "undefined") {
    throw new Error("This function should only be run on the server");
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("crypto").randomBytes(32).toString("base64");
}
