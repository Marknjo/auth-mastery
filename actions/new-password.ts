'use server';

import { getPasswordResetTokenByToken } from '@/data/password-reset-token';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { NewPasswordSchema, TNewPasswordSchema } from '@/schemas';
import { getUserByEmail } from '@/data/user';

export const newPassword = async (
  values: TNewPasswordSchema,
  token?: string | null
) => {
  if (!token) {
    return { error: 'Missing token' };
  }

  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Please provide your new password!' };
  }

  const { password } = validatedFields.data;

  try {
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      return { error: 'Token not found!' };
    }

    const hasExpired = new Date(existingToken.expires).getTime() < Date.now();

    if (hasExpired) {
      await db.passwordResetToken.delete({
        where: {
          id: existingToken.id,
        },
      });

      return { error: 'Invalid token!' };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
      return { error: 'Invalid user credentials!' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.user.update({
      where: {
        email: existingToken.email,
      },
      data: {
        password: hashedPassword,
      },
    });

    await db.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });

    return {
      success: 'Your password was updated',
    };
  } catch (error) {
    return { error: `Failed to reset your password. Please try again later` };
  }
};
