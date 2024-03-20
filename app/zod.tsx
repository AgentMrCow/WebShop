// @/app/zod.tsx
import { z } from "zod";

// @/app/(component)/login.tsx
export const loginFormSchema = z.object({
    email: z.string().email().min(5, "Invalid email format"),
    password: z.string().min(1, "Password is requred"),
});

export type loginFormValues = z.infer<typeof loginFormSchema>;

export const changePWSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Password must include lowercase letters")
        .regex(/[A-Z]/, "Password must include uppercase letters")
        .regex(/[0-9]/, "Password must include a number"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});


export type changePWValues = z.infer<typeof changePWSchema>;