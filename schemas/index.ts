import { UserRole } from '@prisma/client';
import * as z from 'zod';

export const SettingsSchema = z
  .object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.optional(z.enum([UserRole.ADMIN, UserRole.USER])),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    { message: 'New Password is required!', path: ['newPassword'] }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    { message: 'Password is required!', path: ['password'] }
  );
export type TSettingsSchema = z.infer<typeof SettingsSchema>;

export const NewPasswordSchema = z.object({
  password: z.string().min(6, {
    message: 'Password must be more than 6 characters',
  }),
});
export type TNewPasswordSchema = z.infer<typeof NewPasswordSchema>;

export const ResetSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
});
export type TResetSchema = z.infer<typeof ResetSchema>;

export const LoginSchema = z.object({
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
  code: z.optional(
    z.string().length(6, {
      message: 'Invalid 2FA code',
    })
  ),
});
export type TLoginSchema = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(1, {
    message: 'Username is required',
  }),
  email: z.string().email({
    message: 'Email is required',
  }),
  password: z.string().min(6, {
    message: 'Password must be more than 6 characters',
  }),
});
export type TRegisterSchema = z.infer<typeof RegisterSchema>;
