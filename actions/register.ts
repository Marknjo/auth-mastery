'use server';

import bcrypt from 'bcryptjs';
import { RegisterSchema, TRegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';

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

  return { success: 'Your account has been created!' };
};
