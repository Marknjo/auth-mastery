'use server';

import { signIn } from '@/auth';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { getUserByEmail } from '@/data/user';
import { db } from '@/lib/db';
import { sendTwoFactorTokenEmail, sendVerificationEmail } from '@/lib/mail';
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from '@/lib/tokens';
import { DEFAULT_LOGIN_REDIRECT } from '@/middleware.routes';
import { LoginSchema, TLoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';

export const login = async (
  values: TLoginSchema,
  callbackUrl: string | null
) => {
  console.table(values);
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid field values!' };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser?.email || !existingUser?.password) {
    return { error: 'Invalid credentials!' };
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );

    const response = await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );

    if (response.error) {
      return { error: response.error };
    }

    return {
      success:
        "Oops! Your account is not verified! But we've sent you an email to confirm your account.",
    };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) {
        return { error: 'Invalid code!' };
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Invalid code!' };
      }

      const hasExpired =
        new Date(twoFactorToken.expires).getTime() < Date.now();

      if (hasExpired) {
        return { error: 'Code expired!' };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingTokenConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      );

      if (existingTokenConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingTokenConfirmation.id },
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
          expires: new Date(Date.now() + 3600 * 1000),
        },
      });

      return {
        success: "We've sent your 2FA code to your email",
      };
    } else {
      const twoFactor = await generateTwoFactorToken(existingUser.email);

      if (!twoFactor) {
        return { error: '2FA token Generation failed! Please try again' };
      }

      await sendTwoFactorTokenEmail(twoFactor.email, twoFactor.token);

      return { twoFactor };
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
    return { success: 'Login details sent' };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' };

        case 'AuthorizedCallbackError':
          return { error: 'Please verify your account!' };

        default:
          return { error: 'Something happened during login! Please try again' };
      }
    }

    throw error;
  }
};
