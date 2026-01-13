import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().optional(),
  ADMIN_TOKEN: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);


