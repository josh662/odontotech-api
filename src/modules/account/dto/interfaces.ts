import { User } from 'src/../prisma/generated/schema';
import { IResponse } from 'src/interfaces';
import { EOriginRoutes } from 'src/routes';

import { UpdateMeDto } from './classes';

export const origin = EOriginRoutes.ACCOUNT;

// Default
export type IDefault = User;

// Update
export type TUpdateMeRequest = UpdateMeDto;
export type TUpdateMeResponse = IResponse<Partial<IDefault>>;
