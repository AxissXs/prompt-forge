import { z } from "zod";

export const emailSchema = z.string({ error: () => "Email is required" })
  .email("Invalid email address")
  .max(255, "Email too long");

export const usernameSchema = z.string({ error: () => "Username is required" })
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username too long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const passwordSchema = z.string({ error: () => "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: () => "Password is required" }).min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
