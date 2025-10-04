import crypto from "crypto";

const ignoredMethods = ["GET", "HEAD", "OPTIONS"];

export const csrf = {
  // Generate a CSRF token
  generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  },

  // Validate CSRF token
  validateToken(cookieToken: string, headerToken: string): boolean {
    return cookieToken === headerToken && !!cookieToken;
  },

  // Middleware to check CSRF token
  async checkCsrf(request: Request): Promise<boolean> {
    if (ignoredMethods.includes(request.method)) return true;

    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return false;

    const csrfMatch = cookieHeader.match(/csrf-token=([^;]+)/);
    const cookieToken = csrfMatch?.[1];

    const headerToken = request.headers.get("x-csrf-token");

    return this.validateToken(cookieToken || "", headerToken || "");
  },
};
