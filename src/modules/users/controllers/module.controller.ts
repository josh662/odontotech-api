import { Controller, Get, Post, Patch, Delete, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { ModuleService } from '../services';
import {
  createSchema,
  findSchema,
  listSchema,
  origin,
  removeSchema,
  updateSchema,
} from '../dto';
import { EAction, IResponse } from 'src/interfaces';
import { Auth, Permission } from 'src/decorators';
import { BaseModuleController } from 'src/shared/services';

@Auth()
@Controller({ path: origin })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
  }

  @Post()
  @Permission(`${origin}:${EAction.CREATE}`, true)
  async create(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.create(
      this.validate(req, res, createSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Get()
  @Permission(`${origin}:${EAction.LIST}`, true)
  async list(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.list(
      this.validate(req, res, listSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Get(':id')
  @Permission(`${origin}:${EAction.READ}`, true)
  async findOne(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.findOne(
      this.validate(req, res, findSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Patch(':id')
  @Permission(`${origin}:${EAction.UPDATE}`, true)
  async update(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.update(
      this.validate(req, res, updateSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Delete(':id')
  @Permission(`${origin}:${EAction.DELETE}`, true)
  async remove(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.remove(
      this.validate(req, res, removeSchema),
    );
    return res.status(response.statusCode).json(response);
  }
}
