import NextAuth, { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userSlug?: string;
      verified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    userSlug?: string;
    verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userSlug?: string;
    verified?: boolean;
    name?: string | null;
  }
}