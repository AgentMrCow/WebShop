// @/app/zod.tsx
import { z } from "zod";
import DOMPurify from 'isomorphic-dompurify';

const sanitizeInput = (input: string): string => DOMPurify.sanitize(input);

// For login
export const loginFormSchema = z.object({
    email: z.string().email("Invalid email format").min(5, "Invalid email format").transform(sanitizeInput),
    password: z.string().min(1, "Password is required").max(16, "Password must be at most 16 characters"),
});

export type loginFormValues = z.infer<typeof loginFormSchema>;

// For change password
export const changePWSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required").max(16, "Password must be at most 16 characters"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be at most 16 characters")
        .regex(/[a-z]/, "Password must include lowercase letters")
        .regex(/[A-Z]/, "Password must include uppercase letters")
        .regex(/[0-9]/, "Password must include a number"),
        confirmPassword: z.string().max(16, "Password must be at most 16 characters"),
    }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type changePWValues = z.infer<typeof changePWSchema>;

// For register
export const registerSchema = z.object({
    email: z.string().email("Invalid email format").min(5).transform(sanitizeInput),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(16, "Password must be at most 16 characters")
        .regex(/[a-z]/, "Password must include lowercase letters")
        .regex(/[A-Z]/, "Password must include uppercase letters")
        .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string().max(16, "Password must be at most 16 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export type reigsterValues = z.infer<typeof registerSchema>;