import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import { HelperService } from './helper.service';
import { IResponse, ITxn } from 'src/interfaces';
import { origin, TUpdateMeRequest, TUpdateMeResponse } from '../dto';

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

  async findMe(txn: ITxn): Promise<IResponse> {
    try {
      const { props } = this.extract<any>(txn);
      const payload = await this.helperService.findMe(props);

      delete payload['password'];

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async updateMe(txn: ITxn): Promise<TUpdateMeResponse> {
    try {
      const { props, content } = this.extract<TUpdateMeRequest>(txn);
      const payload = await this.helperService.updateMe(props, content);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
