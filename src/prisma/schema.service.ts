import {
  INestApplication,
  Injectable,
  OnModuleInit,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Prisma, PrismaClient } from 'src/../prisma/generated/schema';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private prismaDynamicUrls: Map<string, string> = new Map();
  private readonly logger = new Logger('Prisma');
  constructor() {
    super({
      log: [{ emit: 'event', level: 'query' }],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async () => {
      await app.close();
    });
  }

  DBErrorMessage(err: Prisma.PrismaClientKnownRequestError) {
    this.logger.error(`${err.code}) ${err}`);
    switch (err.code) {
      case 'P2025':
        throw new HttpException('ERR_DB_NOT_FOUND', HttpStatus.NOT_FOUND);
      case 'P2002':
      case 'P2003':
        throw new HttpException('ERR_DB_PK_CONFLICT', HttpStatus.BAD_REQUEST);
      default:
        throw new HttpException(
          'ERR_DB_UNKNOWN',
          HttpStatus.UNPROCESSABLE_ENTITY,
          {
            cause: err.code,
          },
        );
    }
  }
}
