import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from 'src/../prisma/generated/schema';
import { PrismaService } from 'src/prisma/schema.service';

import { JwtDto } from 'src/interfaces';
import { TEnv } from 'src/utils';

import { CacheService } from './cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<TEnv>,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}
  private origin = `authentication:service`;
  private readonly logger = new Logger(this.origin);

  async authenticate(
    authorization: string | undefined,
  ): Promise<JwtDto | false> {
    try {
      if (!authorization) {
        return false;
      }

      const splitted = authorization.split(' ');
      const token = splitted.length > 1 ? splitted[1] : splitted[0];

      const decoded: JwtDto = this.jwtService.verify(token, {
        secret: this.configService.get<string>('SYSTEM_KEY'),
      });

      let user = await this.cacheService.get<Partial<User>>(
        this.origin,
        `user:${decoded.sub}`,
      );

      /**
       * Se o usuário não for encontrado ele é buscado no banco de dados
       * e então os dados são cacheados (Mesmo se forem nulos)
       */
      if (!user) {
        user = await this.prisma.user.findUnique({
          where: { id: decoded.sub },
        });

        await this.cacheService.set(this.origin, `user:${decoded.sub}`, user);
      }

      if (user) return decoded;
      return false;
    } catch (err) {
      this.logger.error(`Error authenticating user: ${err}`);
      return false;
    }
  }
}
