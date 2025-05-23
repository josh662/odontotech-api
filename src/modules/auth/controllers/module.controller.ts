import { Controller, Post, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';

import { ModuleService } from '../services';
import { loginSchema, signUpSchema, origin } from '../dto';
import { IResponse } from 'src/interfaces';
import { BaseModuleController } from 'src/shared/services';

@Controller({ path: origin })
export class ModuleController extends BaseModuleController {
  constructor(private readonly moduleService: ModuleService) {
    super();
  }

  @Post('register')
  async signUp(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.signUp(
      this.validate(req, res, signUpSchema),
    );
    return res.status(response.statusCode).json(response);
  }

  @Post('login')
  async login(@Req() req: Request, @Res() res: Response): Promise<IResponse> {
    const response: IResponse = await this.moduleService.login(
      this.validate(req, res, loginSchema),
    );
    return res.status(response.statusCode).json(response);
  }
}
