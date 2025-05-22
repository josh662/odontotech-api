import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma';
import { verifyPassword } from 'src/utils';

import { IDefault, origin, TUpdateMeRequest } from '../dto';
import { IProps } from 'src/interfaces';

import { HelperService as UserHelperService } from 'src/modules/users/services';
import { BaseHelperService, SearchService } from 'src/shared/services';

@Injectable()
export class HelperService extends BaseHelperService {
  constructor(
    prisma: PrismaService,
    searchService: SearchService,
    private readonly userService: UserHelperService,
  ) {
    super(prisma, searchService);
  }
  private origin = `${origin}:helper`;
  private logger = new Logger(this.origin);
  private repository = this.prisma.user;

  async findMe(props: IProps): Promise<Partial<IDefault>> {
    this.logger.log(`Getting me...`);
    const userId = props.auth?.entityId;
    if (!userId) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_CREDENTIALS',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const user = await this.userService.findOne(props, {
      id: userId,
    });

    this.logger.log(`User account data retrieved`);

    return user;
  }

  async updateMe(
    props: IProps,
    data: TUpdateMeRequest,
  ): Promise<Partial<IDefault>> {
    this.logger.log(`Getting me...`);
    const userId = props.auth?.entityId;
    if (!userId) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_CREDENTIALS',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (
      (data.password && !data.newPassword) ||
      (!data.password && data.newPassword)
    ) {
      throw new HttpException(
        'Para alterar a senha, a senha atual (password) e a nova (newPassword) devem ser fornecidas',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Processo de verificação para alteração de senha
    if (data.password) {
      const verification = await this.repository.findUniqueOrThrow({
        where: {
          id: userId,
        },
        select: {
          password: true,
        },
      });

      const verifyPass = await verifyPassword(
        data.password,
        verification.password,
      );

      if (!verifyPass) {
        throw new HttpException(
          {
            message: 'ERR_INVALID_PASSWORD',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      data['password'] = data.newPassword;
      delete data['newPassword'];
    }

    const user = await this.userService.update(props, userId, {
      ...data,
      id: userId,
    });

    return user;
  }
}
