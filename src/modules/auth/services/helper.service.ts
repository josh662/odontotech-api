import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/prisma';
import { BaseHelperService, EventService, SearchService } from 'src/shared/services';

import { IDefault, origin, TSignUpRequest, TLoginRequest } from '../dto';
import { createRecordId, TEnv, verifyPassword } from 'src/utils';

import { JwtDto } from 'src/interfaces';

import { HelperService as UserHelperService } from 'src/modules/users/services';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    searchService: SearchService,
    private readonly userHelperService: UserHelperService,
    private readonly configService: ConfigService<TEnv>,
    private readonly eventService: EventService,
    private readonly jwtService: JwtService,
  ) {
    super(prisma, searchService)
  }
  private origin = `${origin}:helper`;
  private logger = new Logger(this.origin);
  private repository = this.prisma.user;

  async signUp(data: TSignUpRequest): Promise<Partial<IDefault>> {
    this.logger.log(`Making SignUp`);

    // Cria a conta do usuário
    const payload = await this.userHelperService.create({}, data);

    this.eventService.custom(this.origin, 'signup', payload);

    return payload;
  }

  async login(data: TLoginRequest): Promise<Record<string, any>> {
    this.logger.log(`Making Login...`);
    const user = await this.repository.findFirst({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_CREDENTIALS',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verifica a senha
    const verifyPass = await verifyPassword(data.password, user.password);

    if (!verifyPass) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_CREDENTIALS',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.generateLogin(user.id);
  }

  private async generateLogin(userId: string) {
    // Registra o login
    const loginRegistry = await this.prisma.login.create({
      data: {
        id: createRecordId(),
        userId,
      },
      select: {
        id: true,
      },
    });

    const token = this.generateToken(userId, loginRegistry.id);
    this.eventService.custom(this.origin, 'login', { userId });
    this.logger.log(`Login completed`);

    return { token };
  }

  private generateToken(userId: string, loginId: string): string {
    const payload: JwtDto = {
      iss: process.env.PUBLIC_NAME || '',
      nbf: Math.trunc(new Date().getTime() / 1000),
      sub: userId,
      jti: loginId,
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('SYSTEM_KEY'),
      expiresIn: this.configService.get<string>('JWT_PERIOD'),
    });
  }
}
