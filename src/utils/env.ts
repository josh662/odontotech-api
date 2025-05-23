import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production']),
  SERVER_PORT: z.coerce.number(),
  SERVER_NAME: z.string().trim(),
  PUBLIC_NAME: z.string().trim(),
  SYSTEM_KEY: z.string().min(8).trim(),

  FETCH_LIMIT: z.coerce.number(),

  DEFAULT_SERVICE_VERSION: z.coerce.number().optional(),

  // Security
  CORS_ENABLED: z.coerce.boolean(),
  CORS_ORIGIN: z.string(),
  CORS_METHODS: z.string().trim(),
  CORS_CREDENTIALS: z.coerce.boolean(),

  JWT_PERIOD: z.string().trim(),

  // Database
  DATABASE_URL: z.string().url().optional(),

  REDIS_URL: z.string().url().trim().optional(),
  REDIS_HOST: z.string().trim().optional(),
  REDIS_PORT: z.coerce.number().optional(),
  REDIS_USER: z.string().trim().optional(),
  REDIS_PASS: z.string().trim().optional(),

  CACHE_DEFAULT_TTL: z.coerce.number(),
});

export class EnvDto extends createZodDto(envSchema) {}
export type TEnv = EnvDto;
