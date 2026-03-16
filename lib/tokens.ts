// lib/tokens.ts
import crypto from "crypto";

const PASSWORD_RESET_TOKEN_BYTES = 32;
const PASSWORD_RESET_TOKEN_EXPIRES_MINUTES = 30;

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetTokenExpiry(): Date {
  return new Date(
    Date.now() + PASSWORD_RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000
  );
}