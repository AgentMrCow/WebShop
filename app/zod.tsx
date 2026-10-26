import { z } from 'zod';

const email = z.string().trim().email('Enter a valid email address.').max(254).transform(value => value.toLowerCase());
const newPassword = z.string()
  .min(12, 'Use at least 12 characters.')
  .max(72, 'Use no more than 72 characters.')
  .regex(/[a-z]/, 'Include a lowercase letter.')
  .regex(/[A-Z]/, 'Include an uppercase letter.')
  .regex(/[0-9]/, 'Include a number.')
  .refine(value => new TextEncoder().encode(value).length <= 72, 'The password must fit within 72 UTF-8 bytes.');

export const loginFormSchema = z.object({ email, password: z.string().min(1, 'Enter your password.').max(72) });
export type loginFormValues = z.infer<typeof loginFormSchema>;

export const changePWSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.').max(72),
  newPassword,
  confirmPassword: z.string().max(72),
}).refine(data => data.newPassword === data.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });
export type changePWValues = z.infer<typeof changePWSchema>;

export const registerSchema = z.object({ email, newPassword, confirmPassword: z.string().max(72) })
  .refine(data => data.newPassword === data.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });
export type reigsterValues = z.infer<typeof registerSchema>;
