'use server';

import { signIn } from '@/auth';
import { getUserByEmail } from '@/data/user';
import { sendVerificationEmail } from '@/lib/mail';
import { generateVerificationToken } from '@/lib/tokens';
import { DEFAULT_LOGIN_REDIRECT } from '@/middleware.routes';
import { LoginSchema, TLoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';

export const login = async (values: TLoginSchema) => {
  console.table(values);
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid field values!' };
  }

  const { email, password } = validatedFields.data;

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
      return response;
    }

    return {
      success:
        "Oops! Your account is not verified! But we've sent you an email to confirm your account.",
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
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
