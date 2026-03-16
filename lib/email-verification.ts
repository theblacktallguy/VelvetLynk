// lib/email-verification.ts
import crypto from "crypto";

const EMAIL_VERIFICATION_TOKEN_BYTES = 32;
const EMAIL_VERIFICATION_EXPIRES_HOURS = 24;

export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(EMAIL_VERIFICATION_TOKEN_BYTES).toString("hex");
}

export function hashEmailVerificationToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getEmailVerificationExpiry(): Date {
  return new Date(
    Date.now() + EMAIL_VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000
  );
}