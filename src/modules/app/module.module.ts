import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';

import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

import controllers from './controllers';
import { services } from './services';

// Utils
import { envSchema } from 'src/utils';

// Modules
import { SharedModule } from 'src/shared/shared.module';
import { UsersModule } from 'src/modules/users/module.module';
import { AuthModule } from 'src/modules/auth/module.module';
import { AccountModule } from 'src/modules/account/module.module';
import { PermissionsModule } from 'src/modules/permissions/module.module';

@Module({
  imports: [
    GracefulShutdownModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env', '.env.production'],
      expandVariables: true,
      validate: (env) => envSchema.parse(env),
    }),
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv(`${process.env.REDIS_URL}`)],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.SYSTEM_KEY,
      signOptions: { expiresIn: process.env.JWT_PERIOD },
    }),
    ScheduleModule.forRoot(),
    SharedModule,
    PermissionsModule,
    UsersModule,
    AuthModule,
    AccountModule,
  ],
  controllers,
  providers: services,
})
export class AppModule {}
