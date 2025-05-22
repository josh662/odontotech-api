// import { Injectable, Logger, Inject } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
// // import { InjectRedis } from '@songkeys/nestjs-redis';
// // import Redis from 'ioredis';

// import { EOriginRoutes } from 'src/routes';
// import { Cache } from 'cache-manager';

// @Injectable()
// export class CacheService {
//   constructor(
//     @Inject(CACHE_MANAGER) private redis: Cache,
//     // @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private configService: ConfigService,
//     // @InjectRedis() private readonly redis: Redis,
//   ) {}
//   private readonly logger = new Logger(CacheService.name);

//   async get<T = any>(
//     origin: string,
//     key: string,
//     config?: {
//       ttl?: number;
//     },
//   ): Promise<T | null | undefined> {
//     try {
//       const ttl =
//         config?.ttl ??
//         this.configService.get<number>('CACHE_DEFAULT_TTL', {
//           infer: true,
//         });

//       const payload = ttl
//         ? await this.redis.getex(this.formatKey(origin, key), 'EX', ttl) // Prorroga o prazo de expiração da chave
//         : await this.redis.get(this.formatKey(origin, key));
//       return payload ? JSON.parse(payload) : undefined;
//     } catch (err) {
//       this.logger.error('Error getting data from cache', err);
//       return undefined;
//     }
//   }

//   async getByPattern<T = any>(
//     origin: string,
//     pattern: string,
//   ): Promise<T[] | undefined> {
//     try {
//       let cursor = '0';
//       let keys: string[] = [];

//       // Use um loop para garantir que todas as chaves sejam escaneadas
//       do {
//         const result = await this.redis.scan(
//           cursor,
//           'MATCH',
//           this.formatKey(origin, pattern),
//         );
//         cursor = result[0]; // Atualiza o cursor
//         keys = keys.concat(result[1]); // Concatena as chaves encontradas
//       } while (cursor !== '0'); // Continua até que o cursor volte a ser '0'

//       // Se não encontrar chaves, retorna array vazio
//       if (keys.length === 0) {
//         return undefined;
//       }

//       // Use MGET para obter todos os valores das chaves encontradas
//       const values = await this.redis.mget(...keys);
//       return values.map((value) => JSON.parse(value));
//     } catch (err) {
//       this.logger.error('Error getting data from cache', err);
//       return undefined;
//     }
//   }

//   async getFirstByPattern<T = any>(origin: string, pattern: string) {
//     const elements = await this.getByPattern<T>(origin, pattern);
//     if (elements?.length) return elements[0];
//     return undefined;
//   }

//   async acquireLock(key: string, ttl: number = 30): Promise<boolean> {
//     try {
//       const formattedKey = this.formatKey(EOriginRoutes.LOCKS, key);
//       const res = await this.redis.set(formattedKey, 'locked', 'EX', ttl, 'NX');

//       return res === 'OK'; // Retorna true se conseguiu adquirir o lock, false se já existir
//     } catch (err) {
//       this.logger.error('Error acquiring lock', err);
//       return false;
//     }
//   }

//   async set(
//     origin: string,
//     key: string,
//     payload: any,
//     config?: {
//       ttl?: number | false;
//       lock?: boolean;
//     },
//   ): Promise<boolean> {
//     try {
//       const ttl =
//         config?.ttl === false
//           ? undefined // Sem TTL
//           : (config?.ttl ??
//             this.configService.get<number>('CACHE_DEFAULT_TTL', {
//               infer: true,
//             }));

//       if (ttl !== undefined && ttl <= 0) {
//         throw new Error('Invalid TTL value');
//       }

//       const formattedKey = this.formatKey(origin, key);

//       let payloadString: string;
//       try {
//         payloadString = JSON.stringify(payload);
//       } catch (err) {
//         this.logger.error('Failed to serialize payload', err);
//         return false;
//       }

//       let res: string | null;
//       if (config?.lock) {
//         res = ttl
//           ? await this.redis.set(formattedKey, payloadString, 'EX', ttl, 'NX')
//           : await this.redis.set(formattedKey, payloadString, 'NX');
//         return res === null;
//       } else {
//         res = ttl
//           ? await this.redis.set(formattedKey, payloadString, 'EX', ttl)
//           : await this.redis.set(formattedKey, payloadString);
//         return res === 'OK';
//       }
//     } catch (err) {
//       this.logger.error('Error setting data on cache', err);
//       return false;
//     }
//   }

//   async setMultiple(
//     origin: string,
//     keyValuePairs: { key: string; payload: any }[],
//     config?: {
//       ttl?: number | false;
//       lock?: boolean;
//     },
//   ): Promise<boolean> {
//     try {
//       for (const { key, payload } of keyValuePairs) {
//         const success = await this.set(origin, key, payload, config);

//         if (!success) {
//           this.logger.error(`Failed to set key ${key} in setMultiple`);
//           return false; // Retorna falso se qualquer inserção falhar
//         }
//       }

//       return true; // Retorna verdadeiro se todas as inserções forem bem-sucedidas
//     } catch (err) {
//       this.logger.error('Error setting multiple data on cache', err);
//       return false;
//     }
//   }

//   async del(origin: string, key: string) {
//     try {
//       await this.redis.del(this.formatKey(origin, key));
//       return true;
//     } catch (err) {
//       this.logger.error('Error removing data from cache', err);
//       return false;
//     }
//   }

//   async reset() {
//     try {
//       return this.delByPattern('*');
//     } catch (err) {
//       this.logger.error('Error resetting cache', err);
//       return false;
//     }
//   }

//   async delByPattern(origin: string, pattern?: string) {
//     try {
//       const stream = this.redis.scanStream({
//         match: this.formatKey(origin, pattern),
//       });
//       stream.on('data', async (keys: string[]) => {
//         if (keys.length) {
//           const pipeline = this.redis.pipeline();
//           keys.forEach((key) => pipeline.del(key));
//           await pipeline.exec();
//         }
//       });

//       stream.on('end', () => {
//         this.logger.log(
//           `Chaves que correspondem ao padrão ${pattern} foram deletadas.`,
//         );
//       });

//       return true;
//     } catch (err) {
//       this.logger.error('Error removing keys by pattern from cache', err);
//       return false;
//     }
//   }

//   private formatKey(origin: string, key?: string): string {
//     if (key) return `${process.env.SERVER_NAME}:cache:${origin}:${key}`;
//     return `${process.env.SERVER_NAME}:cache:${origin}`;
//   }
// }
