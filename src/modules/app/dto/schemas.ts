import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

// Métodos de filtro permitidos
const methods = [
  'eql',
  'not',
  'ctn',
  'edw',
  'stw',
  'gt0',
  'gte',
  'lt0',
  'lte',
] as const;

// Schema base
export const baseListSchema = extendApi(
  z.object({
    cursorKey: z.enum(['id']).optional(),
    cursor: z.string().optional(),
    page: z.coerce.number().min(0).optional(),
    take: z.coerce
      .number()
      .min(0)
      .max(+(process.env.FETCH_LIMIT || 50))
      .optional(),
    orderBy: z.string().optional(),
    desc: z.any().optional(),
    search: z.string().optional(),
  }),
);

export function createListSchema<T extends Record<string, z.ZodTypeAny>>(
  validKeys: T,
) {
  const dynamicFilters = Object.fromEntries(
    Object.entries(validKeys).flatMap(([key, schema]) =>
      methods.map((method) => [`${method}|${key}`, schema]),
    ),
  ) as {
    [K in `${(typeof methods)[number]}|${Extract<keyof T, string>}`]: T[Extract<
      K,
      string
    > extends `${string}|${infer Key}`
      ? Key
      : never];
  };

  return baseListSchema.extend(dynamicFilters);
}
