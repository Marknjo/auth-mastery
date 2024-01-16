import { PrismaAdapter } from '@auth/prisma-adapter';
import type { AdapterUser } from '@auth/core/adapters';
import NextAuth from 'next-auth';
import authConfig from '@/auth.config';
import { db } from '@/lib/db';
import { getUserById } from '@/data/user';
import { UserRole } from '@prisma/client';
import { getTwoFactorConfirmationByUserId } from './data/two-factor-confirmation';
import { getAccountByUserId } from './data/account';

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

      // @ts-expect-error - isTwoFactorEnabled is available
      if (adapterUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          adapterUser.id
        );

        if (!twoFactorConfirmation) return false;

        const hasExpired =
          new Date(twoFactorConfirmation.expires).getTime() < Date.now();

        if (hasExpired) return false;

        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
      }

      if (session?.user && token?.role) {
        session.user.role = token.role as UserRole;
      }

      if (session?.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      session.user = {
        ...session.user,
        ...token,
      };

      return session;
    },
    async jwt({ token }) {
      if (!token?.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      return {
        ...token,
        ...existingUser,
        isOAuth: !!(await getAccountByUserId(existingUser.id)),
      };
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
});
