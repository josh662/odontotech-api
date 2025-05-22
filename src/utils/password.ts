import { hash as bcryptHash, compare as bcryptCompare } from 'bcrypt';

export async function hashPassword(
  password: string,
  rounds = +(process.env.PASSWORD_ROUNDS || 12),
) {
  return await bcryptHash(password, rounds);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcryptCompare(password, hash);
}
