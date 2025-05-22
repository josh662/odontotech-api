import { createZodDto } from '@anatine/zod-nestjs';
import { loginSchema, signUpSchema } from './schemas';

export class SignUpDto extends createZodDto(signUpSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
