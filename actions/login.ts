'use server';

import { signIn } from '@/auth';
import { DEFAUTL_LOGIN_REDIRECT } from '@/middleware.routes';
import { LoginSchema, TLoginSchema } from '@/schemas';
import { AuthError } from 'next-auth';

export const login = async (values: TLoginSchema) => {
  console.table(values);
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid field values!' };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAUTL_LOGIN_REDIRECT,
    });
    return { success: 'Login details sent' };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' };

        case 'AuthorizedCallbackError':
          return { error: 'Please varify your account!' };

        default:
          return { error: 'Something happened during login! Please try again' };
      }
    }

    throw error;
  }
};
