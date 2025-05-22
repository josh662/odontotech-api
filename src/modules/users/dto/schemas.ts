import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { baseListSchema } from 'src/modules/app/dto';

export const password = z.string().min(8);

export const createSchema = extendApi(
  z.object({
    name: z.string().trim(),
    email: z.string().email().trim(),
    password,
  }),
);

export const listSchema = baseListSchema.extend({});

export const findSchema = extendApi(
  z.object({
    id: z.string().trim(),
  }),
);

export const updateSchema = extendApi(
  z.object({
    id: z.string().trim(),
    name: z.string().trim().optional(),
    email: z.string().email().trim().optional(),
    password: password.optional(),
  }),
);

export const removeSchema = extendApi(
  z.object({
    id: z.string().trim(),
  }),
);
