import { UserRole } from '@prisma/client';
import { type DefaultSession } from 'next-auth';

export type ExtendUser = {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
} & DefaultSession['user'];

declare module 'next-auth' {
  interface Session {
    user: ExtendUser;
  }
}
