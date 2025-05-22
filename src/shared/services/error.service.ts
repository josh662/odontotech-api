import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';

// PRISMA
import { Prisma } from 'src/../prisma/generated/schema';

import { IResponse } from 'src/interfaces';
import { PrismaService } from 'src/prisma/schema.service';

@Injectable()
export class ErrorService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly logger = new Logger(ErrorService.name);

  process(err: any, origin: any, throwError = true): IResponse {
    this.logger.error(`ERROR ORIGIN: ${origin}`);
    this.logger.error(err);
    if (!throwError) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
    if (err instanceof HttpException) {
      return {
        statusCode: err.getStatus(),
        message: 'DB_ERROR',
      };
      // throw new HttpException(err.getResponse(), err.getStatus());
    } else if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      throwError
    ) {
      this.logger.error(`ERROR INSTANCE TYPE: DBException`);
      this.prisma.DBErrorMessage(err);
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'INTERNAL_ERROR',
    };
    // throw new HttpException(
    //   process.env.NODE_ENV === 'production' ? 'ERR_INTERNAL' : err.message,
    //   HttpStatus.INTERNAL_SERVER_ERROR,
    // );
  }
}
