import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma';
import {
  EventService,
  CacheService,
  SearchService,
  BaseHelperService,
} from 'src/shared/services';

import { EFieldType, EPaginationMode, IProps, TList } from 'src/interfaces';
import {
  IDefault,
  origin,
  TCreateRequest,
  TFindRequest,
  TListRequest,
  TRemoveRequest,
  TUpdateRequest,
} from '../dto';
import { createRecordId, hashPassword } from 'src/utils';

@Injectable()
export class HelperService extends BaseHelperService implements OnModuleInit {
  constructor(
    prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly cacheService: CacheService,
    searchService: SearchService,
  ) {
    super(prisma, searchService);
  }
  private origin = `${origin}:helper`;
  private logger = new Logger(this.origin);
  private repository = this.prisma.user;

  async onModuleInit() {
    try {
      this.logger.verbose('Verifying any admin user on system...');
      // const a = await this.prismaDatasync.v_external_jogadores.findFirst({
      //   where: {
      //     codigo: 119840,
      //   },
      // });
      // console.log(a);
      const anyUser = await this.repository.findFirst({
        where: {
          UserRole: {
            some: {
              role: {
                selfManaged: true,
              },
            },
          },
        },
      });

      if (!anyUser) {
        this.logger.verbose('No admin users found');
        this.logger.verbose('Creating default admin user...');

        const newRoleId = createRecordId();

        await this.repository.create({
          data: {
            id: createRecordId(),
            name: 'Admin',
            email: 'admin@gmail.com',
            password: await hashPassword('myAdmin@123'),
            UserRole: {
              create: {
                role: {
                  create: {
                    id: newRoleId,
                    name: 'ADMIN',
                    description: 'Role padrão gerida pelo sistema',
                    selfManaged: true,
                  },
                },
              },
            },
          },
        });

        this.logger.verbose('Default user created!');
        return;
      }

      this.logger.verbose('Administrative user found!');
    } catch (err) {
      this.logger.fatal(`Failed to verify boot data: ${err}`);
      process.kill(process.pid, 'SIGTERM');
    }
  }

  async create(
    props: IProps,
    data: TCreateRequest,
  ): Promise<Partial<IDefault>> {
    this.logger.log(`Creating a new "${this.origin}"`);

    // Verifica se já existe algum usuário com o email já cadastrado
    const verify = await this.repository.findFirst({
      where: {
        email: data.email,
      },
      select: {
        email: true,
      },
    });

    if (verify) {
      throw new HttpException(
        {
          message: `ERR_USER_EXISTS_WITH_THIS_EMAIL`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cria o usuário
    const record = await this.repository.create({
      data: {
        id: createRecordId(),
        name: data.name,
        email: data.email,
        password: await hashPassword(data.password),
      },
      select: {
        id: true,
      },
    });

    this.eventService.create(this.origin, record);
    this.logger.log(`New "${this.origin}" created (ID: ${record.id})`);

    return record;
  }

  async list(
    props: IProps,
    data: TListRequest,
    restrictPaginationToMode?: EPaginationMode,
  ): Promise<TList<Partial<IDefault>>> {
    this.logger.log(`Listing "${this.origin}"`);

    type R = typeof this.repository;
    type F = R['fields'];
    type P = Exclude<Parameters<R['findMany']>[0], undefined>;
    type W = P['where'];
    type S = P['select'];
    type O = P['orderBy'];

    const listed = await this.listing<R, F, W, S, O>(this.repository, data, {
      logger: this.logger,
      origin: this.origin,
      restrictPaginationToMode,
      searchableFields: {
        id: EFieldType.STRING,
      },
      sortFields: ['id'],
      mergeWhere: {},
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // @ts-expect-error: argument-of-type-is-not-assignable-to-parameter-of-type
    return listed;
  }

  async findOne(
    props: IProps,
    data: TFindRequest,
    renew = false,
  ): Promise<Partial<IDefault>> {
    this.logger.log(`Retrieving a single "${this.origin}"`);

    type R = typeof this.repository;
    type RType = NonNullable<Awaited<ReturnType<R['findUniqueOrThrow']>>>;
    let record: Partial<RType> | null | undefined = undefined;

    if (!renew) {
      record = await this.cacheService.get(this.origin, data.id);
    }

    if (!record) {
      record = await this.repository.findUniqueOrThrow({
        where: { id: data.id },
      });

      if (!renew) {
        await this.cacheService.set(this.origin, record.id!, record);
      }
    }

    this.logger.log(`One "${this.origin}" was retrieved (ID: ${record.id})`);

    return record;
  }

  async update(
    props: IProps,
    id: string,
    data: TUpdateRequest,
  ): Promise<Partial<IDefault>> {
    this.logger.log(`Updating a "${this.origin}"`);

    const verify = await this.repository.findFirst({
      where: {
        email: data.email,
      },
      select: {
        email: true,
      },
    });

    if (verify) {
      throw new HttpException(
        {
          message: `ERR_USER_EXISTS_WITH_THIS_EMAIL`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const record = await this.repository.update({
      where: { id },
      data: {
        ...data,
        password: data.password ? await hashPassword(data.password) : undefined,
      },
    });

    this.eventService.update(this.origin, record);
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One "${this.origin}" was updated (ID: ${record.id})`);

    return record;
  }

  async remove(props: IProps, data: TRemoveRequest): Promise<void> {
    this.logger.log(`Deleting a "${this.origin}"`);
    const record = await this.repository.delete({
      where: { id: data.id },
    });

    this.eventService.remove(this.origin, record);
    await this.cacheService.del(this.origin, record.id);
    this.logger.log(`One "${this.origin}" was deleted (ID: ${record.id})`);
  }
}
