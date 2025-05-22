export function convertToNumber(value: any) {
  try {
    return +value;
  } catch (err) {
    return false;
  }
}

export function convertBigIntToNumber<T extends Record<string, any>>(
  obj: T,
): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === 'bigint' ? Number(value) : value,
    ),
  );
}
