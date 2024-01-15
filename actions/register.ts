'use server';

import bcrypt from 'bcryptjs';
import { RegisterSchema, TRegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export const register = async (values: TRegisterSchema) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid field values!' };
  }

  const { name, email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already in use!' };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.create({ data: { name, email, password: hashedPassword } });

  // TODO: send verification token email
  const verificationToken = await generateVerificationToken(email);
  const response = await sendVerificationEmail(
    verificationToken.email,
    verificationToken.token
  );

  console.log({ verificationToken });

  return response;
};
