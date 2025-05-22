import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { BaseModuleService, ErrorService } from 'src/shared/services';
import {
  origin,
  TCreateRequest,
  TCreateResponse,
  TFindRequest,
  TFindResponse,
  TListRequest,
  TListResponse,
  TRemoveRequest,
  TRemoveResponse,
  TUpdateRequest,
  TUpdateResponse,
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

  async create(txn: ITxn): Promise<TCreateResponse> {
    try {
      const { props, content } = this.extract<TCreateRequest>(txn);
      const payload = await this.helperService.create(props, content);

      return {
        statusCode: HttpStatus.CREATED,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async list(txn: ITxn): Promise<TListResponse> {
    try {
      const { props, content } = this.extract<TListRequest>(txn);
      const payload = await this.helperService.list(props, content);

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async findOne(txn: ITxn): Promise<TFindResponse> {
    try {
      const { props, content } = this.extract<TFindRequest>(txn);
      const payload = await this.helperService.findOne(props, content);

      delete payload['password'];

      return {
        statusCode: HttpStatus.OK,
        payload,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async update(txn: ITxn): Promise<TUpdateResponse> {
    try {
      const { props, content } = this.extract<TUpdateRequest>(txn);
      await this.helperService.update(props, content.id, content);

      return {
        statusCode: HttpStatus.OK,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }

  async remove(txn: ITxn): Promise<TRemoveResponse> {
    try {
      const { props, content } = this.extract<TRemoveRequest>(txn);
      await this.helperService.remove(props, content);

      return {
        statusCode: HttpStatus.NO_CONTENT,
      };
    } catch (err) {
      return this.errorService.process(err, this.origin);
    }
  }
}
