import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';

import { IProps, IAuthConfig, EAuthType } from 'src/interfaces';
import { PrismaService } from 'src/prisma';
import { EOriginRoutes } from 'src/routes';
import { CacheService, ErrorService, AuthService } from 'src/shared/services';
import { TEnv } from 'src/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthService,
    private readonly configService: ConfigService<TEnv>,
    private readonly errorService: ErrorService,
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}
  private origin = EOriginRoutes.AUTH_GUARD;
  private logger = new Logger(this.origin);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const authConfig: IAuthConfig =
        this.reflector.get('authConfig', context.getHandler()) ||
        this.reflector.get('authConfig', context.getClass());
      const authorization = request.headers['authorization'] as string;

      if (authConfig?.skip) {
        return true;
      }

      if (!authorization) {
        return false;
      }

      // Verificação por chave de sistema
      if (authConfig?.onlySystemKey) {
        if (authorization !== this.configService.get<string>('SYSTEM_KEY')) {
          return false;
        }

        const props: IProps = {
          auth: {
            type: EAuthType.SYSTEM,
          },
        };
        request['props'] = props;
        return true;
      }

      let props: IProps | undefined = undefined;

      if (authorization.toLocaleLowerCase().includes('bearer')) {
        const auth = await this.authService.authenticate(authorization);
        if (!auth) {
          return false;
        }

        props = {
          auth: {
            entityId: auth.sub,
            type: EAuthType.USER,
          },
        };
      }

      // Se não foi possível autenticar o acesso é negado
      if (!props) {
        return false;
      }

      request['props'] = props;
      return true;
    } catch (err) {
      this.errorService.process(err, this.origin, false);
      return false;
    }
  }
}
