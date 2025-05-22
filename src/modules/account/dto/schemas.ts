import { extendApi } from '@anatine/zod-openapi';
import { password } from 'src/modules/users/dto';
import { z } from 'zod';

export const updateMeSchema = extendApi(
  z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: password.optional(),
    newPassword: password.optional(),
  }),
);
