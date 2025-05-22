import { createZodDto } from '@anatine/zod-nestjs';
import { updateMeSchema } from './schemas';

export class UpdateMeDto extends createZodDto(updateMeSchema) {}
