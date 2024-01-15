import * as z from 'zod';

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
