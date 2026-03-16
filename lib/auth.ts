// web/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      userSlug?: string;
      verified?: boolean;
      sessionVersion?: number;
      sessionRevoked?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userSlug?: string;
    verified?: boolean;
    name?: string | null;
    sessionVersion?: number;
    sessionRevoked?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 20 * 60,
    updateAge: 5 * 60,
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) return null;

        const identifier = String(credentials.identifier).trim().toLowerCase();
        const password = String(credentials.password);
        const isEmail = identifier.includes("@");

        const user = await prisma.user.findFirst({
          where: isEmail ? { email: identifier } : { userSlug: identifier },
          select: {
            id: true,
            email: true,
            name: true,
            userSlug: true,
            verified: true,
            passwordHash: true,
            image: true,
            sessionVersion: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          userSlug: user.userSlug,
          verified: user.verified,
          sessionVersion: user.sessionVersion,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userSlug = (user as any).userSlug;
        token.verified = (user as any).verified ?? false;
        token.name = user.name ?? null;
        token.sessionVersion = (user as any).sessionVersion ?? 0;
        token.sessionRevoked = false;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            sessionVersion: true,
            userSlug: true,
            verified: true,
            name: true,
          },
        });

        if (!dbUser) {
          token.sessionRevoked = true;
          return token;
        }

        token.userSlug = dbUser.userSlug;
        token.verified = dbUser.verified;
        token.name = dbUser.name ?? null;

        if ((token.sessionVersion ?? 0) !== dbUser.sessionVersion) {
          token.sessionRevoked = true;
        } else {
          token.sessionVersion = dbUser.sessionVersion;
          token.sessionRevoked = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.userSlug = token.userSlug as any;
        session.user.verified = token.verified as any;
        session.user.name = (token.name ?? session.user.name ?? null) as any;
        if (token.sub) session.user.id = token.sub;
        session.user.sessionVersion = (token.sessionVersion ?? 0) as any;
        session.user.sessionRevoked = (token.sessionRevoked ?? false) as any;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch {}
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },
};