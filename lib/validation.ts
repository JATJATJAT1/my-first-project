// Zod schemas for every API route body.
// Import and use: const parsed = LoginSchema.safeParse(await req.json())

import { z } from 'zod';

export const LoginSchema = z.object({
  email:    z.string().email('Invalid email address.').max(320),
  password: z.string().min(6, 'Password must be at least 6 characters.').max(128),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address.').max(320),
});

export const AdminSeedSchema = z.object({
  token: z.string().min(1, 'Token is required.').max(256),
});

export const ConnectIntegrationSchema = z.object({
  partnerId:   z.string().min(1).max(64).regex(/^[a-z0-9-]+$/, 'Invalid partner ID.'),
  credentials: z.record(z.string(), z.string().max(4096)).optional().default({}),
});

export const DisconnectIntegrationSchema = z.object({
  partnerId: z.string().min(1).max(64).regex(/^[a-z0-9-]+$/, 'Invalid partner ID.'),
});

// Convenience helper — returns { data } or throws a 400-ready error string.
export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.errors.map(e => e.message).join(' ');
    throw Object.assign(new Error(msg), { status: 400 });
  }
  return result.data;
}
