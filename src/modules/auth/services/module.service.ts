import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  TSignUpRequest,
  TSignUpResponse,
  TLoginRequest,
  TLoginResponse,
  origin,
} from '../dto';
import { HelperService } from './helper.service';
import { ITxn } from 'src/interfaces';

@Injectable()
export class ModuleService extends BaseModuleService {
  constructor(
    private readonly errorService: ErrorService,
    private readonly helperService: HelperService,
  ) {
    super();
  }
  private origin = `${origin}:module`;
  private logger = new Logger(this.origin);

  async signUp(txn: ITxn): Promise<TSignUpResponse> {
    try {
      const { content } = this.extract<TSignUpRequest>(txn);
      const payload = await this.helperService.signUp(content);

      return {
        statusCode: HttpStatus.CREATED,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async login(txn: ITxn): Promise<TLoginResponse> {
    try {
      const { content } = this.extract<TLoginRequest>(txn);
      const payload = await this.helperService.login(content);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
