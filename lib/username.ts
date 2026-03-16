import crypto from "crypto";

export type UserRecord = {
  id: string;
  username: string; // also used as userSlug
  email: string;
  passwordHash: string; // sha256 for now (we’ll switch to bcrypt later when DB starts)
  fullName: string;
  verified: boolean;
  createdAt: string;
};

const users: UserRecord[] = [
  {
    id: "u_1",
    username: "ninaluxe",
    email: "nina@example.com",
    passwordHash: sha256("password123"),
    fullName: "Nina Luxe",
    verified: false,
    createdAt: new Date().toISOString(),
  },
];

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeUsername(u: string) {
  return u.trim().toLowerCase();
}

function normalizeEmail(e: string) {
  return e.trim().toLowerCase();
}

export function findUserByEmailOrUsername(identifier: string) {
  const id = identifier.trim().toLowerCase();
  const isEmail = id.includes("@");

  return users.find((u) =>
    isEmail ? u.email === normalizeEmail(id) : u.username === normalizeUsername(id)
  );
}

export function verifyPassword(user: UserRecord, password: string) {
  return user.passwordHash === sha256(password);
}

export function isUsernameValid(username: string) {
  // keep it slug-safe for /profile/[userSlug]
  const u = normalizeUsername(username);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(u) && u.length >= 3 && u.length <= 24;
}

export function registerUser(input: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}) {
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);

  if (!isUsernameValid(username)) {
    throw new Error(
      "Username must be 3–24 chars, lowercase, and may include hyphens (no spaces)."
    );
  }

  if (!email.includes("@") || email.length < 6) {
    throw new Error("Enter a valid email.");
  }

  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (users.some((u) => u.username === username)) {
    throw new Error("Username already taken.");
  }

  if (users.some((u) => u.email === email)) {
    throw new Error("Email already registered.");
  }

  const user: UserRecord = {
    id: `u_${Date.now()}`,
    username,
    email,
    passwordHash: sha256(input.password),
    fullName: input.fullName.trim() || username,
    verified: false,
    createdAt: new Date().toISOString(),
  };

  users.unshift(user);
  return user;
}