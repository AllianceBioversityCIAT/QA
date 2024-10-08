import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RolesGuard } from '../../shared/guards/role.guard';
import {
  GetDetailedEvaluationDto,
  GetListEvaluationsDto,
} from './dto/evaluation.dto';
import { ResponseUtils } from '../../utils/response.utils';

@ApiTags('Evaluations')
@ApiHeader({
  name: 'authorization',
  description: 'Auth token',
})
@Controller()
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp])
  @Get()
  @ApiOperation({ summary: 'Get all evaluations for dashboard' })
  @ApiResponse({ status: 200, description: 'Evaluations loaded successfully.' })
  async getAllEvaluationsDash(@Query('crp_id') crpId: string, @Res() res: any) {
    try {
      const result = await this.evaluationsService.getAllEvaluationsDash(
        crpId,
        res.locals.jwtPayload.userId,
      );
      return res
        .status(HttpStatus.OK)
        .json({ data: result, status: HttpStatus.OK });
    } catch (error) {
      return res.status(HttpStatus.NOT_FOUND).json(
        ResponseUtils.format({
          description: 'All evaluations could not be accessed.',
          status: HttpStatus.NOT_FOUND,
        }),
      );
    }
  }
}
