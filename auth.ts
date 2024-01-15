import { PrismaAdapter } from '@auth/prisma-adapter';
import type { AdapterUser } from '@auth/core/adapters';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { db } from '@/lib/db';
import { getUserById } from '@/data/user';
import { UserRole } from '@prisma/client';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(Date.now()) },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      const adapterUser: AdapterUser = user as AdapterUser;

      // prevent signIn without email verification
      if (!adapterUser?.emailVerified) {
        return false;
      }

      // TODO: add 2fa check

      return true;
    },
    async session({ session, token }) {
      console.log('\n🚩🚩 session');
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }

      if (session?.user && token?.role) {
        session.user.role = token.role as UserRole;
      }

      return session;
    },
    async jwt({ token }) {
      console.log('\n🚩🚩 jwt');
      if (!token?.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      token.role = existingUser.role;

      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
