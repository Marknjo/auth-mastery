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
  callbacks: {
    async signIn({ user }) {
      console.log({ user, flag: '⛳⛳⛳⛳' });

      console.log('\n-------------------------------------\n\n');

      console.log('\n🚩🚩 signIn');
      const adapterUser: AdapterUser = user as AdapterUser;

      if (!adapterUser?.emailVerified) {
        return false;
      }

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
