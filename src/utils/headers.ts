import { HttpException, HttpStatus } from '@nestjs/common';

export function getOrigin(
  record: Record<string, any | any[]>,
  throwErr = true,
) {
  const origin = record['origin'];
  if (!origin && throwErr) {
    throw new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'ERR_MISSING_ORIGIN_HEADER',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  return origin;
}
