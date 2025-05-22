import { Module } from '@nestjs/common';
import { PrismaService } from './schema.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
