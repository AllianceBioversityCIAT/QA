import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CommentsService } from './comments.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { RolesGuard } from '../../shared/guards/role.guard';
import {
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { PatchPpuDto, UpdateCycleDto } from './dto/comment.dto';

@ApiTags('Comments')
@ApiHeader({
  name: 'authorization',
  description: 'Auth token',
})
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/')
  @ApiOperation({ summary: 'Get comments statistics' })
  @ApiResponse({
    status: 200,
    description: 'Comments statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not access comments statistics',
  })
  @ApiQuery({
    name: 'crp_id',
    required: false,
    description: 'Optional CRP ID to filter comments statistics',
  })
  async getCommentsCount(@Query('crp_id') crpId: string, @Req() req: any) {
    const userId = req.user.userId;
    return this.commentsService.commentsCount(crpId, userId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/meta')
  @ApiOperation({ summary: 'Create meta for comments' })
  @ApiResponse({
    status: 200,
    description: 'Comments meta created successfully.',
  })
  @ApiResponse({ status: 404, description: 'Failed to create comments meta.' })
  async createcommentsMeta() {
    return this.commentsService.createCommentsMeta();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/excel/:evaluationId')
  @ApiParam({
    name: 'evaluationId',
    required: true,
    description: 'ID of the evaluation to retrieve comments for',
  })
  @ApiOperation({
    summary: 'Retrieve comments based on evaluation ID or CRP ID',
  })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Comments not found' })
  async getCommentsExcel(
    @Param('evaluationId') evaluationId: string,
    @Query()
    query: {
      userId: string;
      name: string;
      crp_id: string;
      indicatorName: string;
    },
    @Res() res: Response,
  ) {
    const comments = await this.commentsService.getCommentsExcel(
      evaluationId,
      query,
    );
    res.status(200).send(comments);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/tags')
  @ApiOperation({ summary: 'Retrieve all tags by indicator' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Tags not found' })
  async getAllIndicatorTags(
    @Query('crp_id') crp_id: string,
    @Res() res: Response,
  ) {
    const tags = await this.commentsService.getAllIndicatorTags(crp_id);
    res.status(200).send({ data: tags, message: 'All tags by indicator' });
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/tags/feed')
  @ApiOperation({ summary: 'Retrieve all feed tags' })
  @ApiResponse({ status: 200, description: 'Feed tags retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Feed tags not found' })
  async getFeedTags(
    @Query('indicator_view_name') indicator_view_name: string,
    @Query('tagTypeId') tagTypeId: string,
    @Res() res: Response,
  ) {
    const tags = await this.commentsService.getFeedTags(
      indicator_view_name,
      tagTypeId,
    );
    res
      .status(200)
      .send({ data: tags, message: 'All new tags ordered by date (desc)' });
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Post('/approved/:evaluationId')
  @ApiOperation({ summary: 'Toggle approved comments without comment' })
  @ApiResponse({ status: 200, description: 'Comments toggled successfully' })
  @ApiResponse({ status: 404, description: 'Comments not set as approved' })
  async toggleApprovedNoComments(
    @Param('evaluationId') evaluationId: number,
    @Body('meta_array') meta_array: number[],
    @Body('userId') userId: number,
    @Body('noComment') noComment: boolean,
    @Res() res: Response,
  ) {
    const result = await this.commentsService.toggleApprovedNoComments(
      evaluationId,
      meta_array,
      userId,
      noComment,
    );
    res.status(HttpStatus.OK).send(result);
  }

  @ApiOperation({ summary: 'Get raw comments data as Excel for a given CRP' })
  @ApiParam({
    name: 'crp_id',
    required: true,
    description: 'ID of the CRP to retrieve comments for',
  })
  @ApiResponse({
    status: 200,
    description: 'Raw comments data retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Comments raw data error',
  })
  @Get('/excel-raw/:crp_id')
  async getRawCommentsExcel(
    @Param('crp_id') crp_id: string,
    @Res() res: Response,
  ) {
    try {
      const rawData = await this.commentsService.getRawCommentsExcel(crp_id);
      return res.status(200).send(rawData);
    } catch (error) {
      return res
        .status(404)
        .json({ message: 'Comments raw data error', data: error });
    }
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp])
  @Get('/raw/:crp_id')
  @ApiOperation({ summary: 'Get raw comments data' })
  @ApiParam({
    name: 'crp_id',
    required: false,
    description: 'CRP ID (optional)',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments raw data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Comments raw data error' })
  async getRawCommentsData(
    @Param('crp_id') crp_id: string,
    @Res() res: Response,
  ) {
    try {
      const data = await this.commentsService.getRawCommentsData(
        crp_id !== 'undefined' ? crp_id : undefined,
      );
      res.status(200).json({ message: 'Comments raw data', data });
    } catch (error) {
      res
        .status(404)
        .json({ message: 'Comments raw data error', data: error.message });
    }
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/cycles')
  @ApiOperation({ summary: 'Retrieve all cycles' })
  @ApiResponse({
    status: 200,
    description: 'Cycles data retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Could not retrieve cycles' })
  async getCycles(@Res() res: Response) {
    try {
      const result = await this.commentsService.getCycles();
      res.status(HttpStatus.OK).send(result);
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'An error occurred',
        data: error.data || {},
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Patch('/cycles/update')
  @ApiOperation({ summary: 'Update a cycle' })
  @ApiResponse({ status: 200, description: 'Cycle updated successfully' })
  @ApiResponse({ status: 404, description: 'Cycle not found' })
  async updateCycle(
    @Body() updateCycleDto: UpdateCycleDto,
    @Res() res: Response,
  ) {
    const { id, start_date, end_date } = updateCycleDto;
    try {
      const result = await this.commentsService.updateCycle(
        id,
        start_date,
        end_date,
      );
      res.status(HttpStatus.OK).send(result);
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'An error occurred',
        data: error.data || {},
      });
    }
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Patch('/ppu')
  @ApiOperation({ summary: 'Patch PPU changes' })
  @ApiResponse({ status: 202, description: 'PPU changes updated' })
  @ApiResponse({
    status: 400,
    description: 'Error occurred while marking PPU changes',
  })
  async patchPpuChanges(
    @Body() patchPpuChangesDto: PatchPpuDto,
    @Res() res: Response,
  ) {
    const { ppu, commentReplyId } = patchPpuChangesDto;
    try {
      const result = await this.commentsService.patchPpuChanges(
        ppu,
        commentReplyId,
      );
      res.status(HttpStatus.ACCEPTED).send(result);
    } catch (error) {
      res.status(error.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'An error occurred',
        data: error.data || {},
      });
    }
  }

  @Get('batches')
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @ApiOperation({
    summary: 'Retrieve all batches ordered by name',
    description:
      'Allows users with roles admin, assessor, and CRP to retrieve the batches ordered by name.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batches retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Could not retrieve batches data' })
  async getBatches() {
    return this.commentsService.getBatches();
  }

  @Get('default-list')
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @ApiOperation({
    summary: 'Retrieve a list of quick comments',
    description:
      'Allows users with the roles admin and assessor to retrieve a list of quick comments.',
  })
  async getQuickComments() {
    return this.commentsService.getQuickComments();
  }
}
