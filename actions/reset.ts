'use server';

import { getUserByEmail } from '@/data/user';
import { sendPasswordResetEmail } from '@/lib/mail';
import { generatePasswordResetToken } from '@/lib/tokens';
import { ResetSchema, TResetSchema } from '@/schemas';

export const reset = async (values: TResetSchema) => {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Please provide a valid email!' };
  }

  const { email } = validatedFields.data;

  try {
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return { error: 'Email not found!' };
    }

    const passwordResetToken = await generatePasswordResetToken(email);

    const response = await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    console.log({ response });

    return {
      success: response?.success,
    };
  } catch (error) {
    return { error: `Failed to reset your password. Please try again later` };
  }
};
