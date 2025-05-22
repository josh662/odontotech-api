import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

import { password } from 'src/modules/users/dto';

export const signUpSchema = extendApi(
  z.object({
    name: z.string().trim(),
    email: z.string().email().trim(),
    password,
  }),
);

export const loginSchema = extendApi(
  z.object({
    ipAddress: z.string().trim().optional(),
    email: z.string().email().trim(),
    password,
  }),
);
