import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../shared/guards/role.guard';
import { UserToken } from '../../shared/decorators/user.decorator';
import { TokenDto } from '../../shared/global-dto/token.dto';
import {
  CreateCommentDto,
  CreateReplyDto,
  CreateTagDto,
  GetDetailedEvaluationDto,
  GetListEvaluationsDto,
  PatchHighlightCommentDto,
  PatchRequireChangesDto,
  UpdateCommentDto,
  UpdateDetailedEvaluationDto,
  UpdateRequireSecondEvaluationDto,
} from './dto/evaluation.dto';

@ApiTags('Evaluations')
@ApiHeader({
  name: 'authorization',
  description: 'Basic token',
})
@Controller()
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp])
  @Get('/')
  @ApiOperation({ summary: 'Get all evaluations dashboard' })
  @ApiResponse({
    status: 200,
    description: 'All evaluations retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Error retrieving evaluations.' })
  async getAllEvaluationsDash(
    @UserToken() user: TokenDto,
    @Query('crp_id') crpId?: string | undefined,
  ) {
    return this.evaluationsService.getAllEvaluationsDash(crpId, user);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp])
  @Get('/status/crp')
  @ApiOperation({ summary: 'Get all evaluations by CRP' })
  @ApiResponse({
    status: 200,
    description: 'All evaluations by CRP retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Error retrieving evaluations by CRP.',
  })
  async getAllEvaluationsDashByCRP(
    @UserToken() user: TokenDto,
    @Query('crp_id') crpId?: string,
  ) {
    return this.evaluationsService.getAllEvaluationsDashByCRP(crpId, user);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/:id')
  @ApiOperation({ summary: 'Get evaluations by user ID' })
  @ApiResponse({
    status: 200,
    description: 'User evaluations retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving evaluations.',
  })
  async getEvaluationsDash(
    @UserToken() user: TokenDto,
    @Param('id') id: number,
  ) {
    return this.evaluationsService.getEvaluationsDash(id);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Post('/:id/list')
  @ApiOperation({ summary: 'Get list of evaluations by user and view name' })
  @ApiResponse({
    status: 200,
    description: 'Evaluations list retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Error retrieving evaluations list.',
  })
  async getListEvaluationsDash(
    @UserToken() user: TokenDto,
    @Param('id') id: number,
    @Body() getListEvaluationsDto: GetListEvaluationsDto,
    @Query('crp_id') crpId?: string | undefined,
  ) {
    const { view_name: viewName, view_primary_field: viewPrimaryField } =
      getListEvaluationsDto;

    return this.evaluationsService.getListEvaluationsDash(
      id,
      viewName,
      viewPrimaryField,
      crpId,
      user,
    );
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Post('/:id/detail')
  @ApiOperation({ summary: 'Get detailed evaluation by user ID' })
  @ApiResponse({
    status: 200,
    description: 'User evaluation detail retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Error retrieving user evaluation detail.',
  })
  async getDetailedEvaluationDash(
    @UserToken() user: TokenDto,
    @Param('id') id: number,
    @Body() getDetailedEvaluationDashDto: GetDetailedEvaluationDto,
  ) {
    const { type, indicatorId } = getDetailedEvaluationDashDto;
    return this.evaluationsService.getDetailedEvaluationDash(
      id,
      type,
      indicatorId,
      user,
    );
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Patch('/:id/detail')
  @ApiOperation({ summary: 'Update detailed evaluation' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Error updating evaluation.',
  })
  async updateDetailedEvaluation(
    @UserToken() user: TokenDto,
    @Param('id') id: number,
    @Body() updateDetailedEvaluationDto: UpdateDetailedEvaluationDto,
  ) {
    const { status, general_comments: generalComments } =
      updateDetailedEvaluationDto;
    return this.evaluationsService.updateDetailedEvaluation(
      id,
      user.userId,
      status,
      generalComments,
    );
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/crp')
  @ApiOperation({ summary: 'Get all CRPs' })
  @ApiResponse({
    status: 200,
    description: 'All CRPs retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not retrieve CRPs.',
  })
  async getCRPS() {
    return this.evaluationsService.getCRPS();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/crp/indicators')
  @ApiOperation({ summary: 'Get indicators by CRP' })
  @ApiResponse({
    status: 200,
    description: 'Indicators settings retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not retrieve indicators settings.',
  })
  async getIndicatorsByCrp() {
    return this.evaluationsService.getIndicatorsByCrp();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Patch('/highlight-comment')
  @ApiOperation({ summary: 'Patch highlight comment' })
  @ApiResponse({
    status: 201,
    description: 'Comment highlight status updated successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Could not update highlight status.',
  })
  async patchHighlightComment(
    @UserToken() user: TokenDto,
    @Body() patchHighlightCommentDto: PatchHighlightCommentDto,
  ) {
    const { highlight_comment: highlightComment, id: commentId } =
      patchHighlightCommentDto;
    return this.evaluationsService.patchHighlightComment(
      commentId,
      highlightComment,
      user,
    );
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Patch('/require-changes')
  @ApiOperation({ summary: 'Patch require changes on comment' })
  @ApiResponse({
    status: 202,
    description: 'Require changes marked successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error occurred while marking require changes.',
  })
  async patchRequireChanges(
    @Body() patchRequireChanges: PatchRequireChangesDto,
  ) {
    const { id, require_changes: requireChanges } = patchRequireChanges;
    return this.evaluationsService.patchRequireChanges(id, requireChanges);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/detail/comment/tag/:commentId/:tagTypeId/:userId')
  @ApiOperation({ summary: 'Get tag ID by comment, tag type, and user' })
  @ApiResponse({
    status: 200,
    description: 'Tag ID found successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag ID could not be found.',
  })
  async getTagId(
    @Param('commentId') commentId: number,
    @Param('tagTypeId') tagTypeId: number,
    @Param('userId') userId: number,
  ) {
    return this.evaluationsService.getTagId(commentId, tagTypeId, userId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Post('/detail/comment/tag')
  @ApiOperation({ summary: 'Create or remove tag on a comment' })
  @ApiResponse({
    status: 200,
    description: 'Tag created or removed successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tag could not be created or removed.',
  })
  async createTag(@Body() createTagDto: CreateTagDto) {
    const { userId, tagTypeId, commentId } = createTagDto;
    return this.evaluationsService.createTag(userId, tagTypeId, commentId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Delete('/detail/comment/tag/:id')
  @ApiOperation({ summary: 'Delete a tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Tag not found.',
  })
  async deleteTag(@Param('id') id: number) {
    return this.evaluationsService.deleteTag(id);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Post('/detail/comment')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment could not be created.',
  })
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.evaluationsService.createComment(createCommentDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Post('/detail/comment/reply')
  @ApiOperation({ summary: 'Create a reply to a comment' })
  @ApiResponse({
    status: 200,
    description: 'Reply created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Reply could not be created.',
  })
  async createCommentReply(@Body() createReplyDto: CreateReplyDto) {
    return this.evaluationsService.createCommentReply(createReplyDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Patch('/detail/comment')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Comment could not be updated.',
  })
  async updateComment(@Body() updateCommentDto: UpdateCommentDto) {
    return this.evaluationsService.updateComment(updateCommentDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp])
  @Patch('/detail/comment/reply')
  @ApiOperation({ summary: 'Update a comment reply' })
  @ApiResponse({
    status: 200,
    description: 'Reply updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Reply could not be updated.',
  })
  async updateCommentReply(@Body() updateReplyDto: any) {
    return this.evaluationsService.updateCommentReply(updateReplyDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/:evaluationId/detail/comment/:metaId')
  @ApiOperation({ summary: 'Get comments with replies and tags' })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Comments could not be retrieved.',
  })
  async getComments(
    @Param('evaluationId') evaluationId: number,
    @Param('metaId') metaId: number,
  ) {
    return this.evaluationsService.getComments(evaluationId, metaId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/:evaluationId/detail/comment/:commentId/replies')
  @ApiOperation({ summary: 'Get all replies for a specific comment' })
  @ApiResponse({
    status: 200,
    description: 'All replies retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Replies could not be retrieved.',
  })
  async getCommentsReplies(@Param('commentId') commentId: number) {
    return this.evaluationsService.getCommentsReplies(commentId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.crp, RolesHandler.assesor])
  @Get('/indicator/:indicatorName')
  @ApiOperation({ summary: 'Get evaluation criteria by indicator name' })
  @ApiResponse({
    status: 200,
    description: 'Criteria retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Criteria could not be retrieved.',
  })
  async getCriteriaByIndicator(@Param('indicatorName') indicatorName: string) {
    return this.evaluationsService.getCriteriaByIndicator(indicatorName);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/:evaluationId/assessors')
  @ApiOperation({ summary: 'Get assessors by evaluation ID' })
  @ApiResponse({
    status: 200,
    description: 'Assessors retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not retrieve assessors.',
  })
  async getAssessorsByEvaluations(@Param('evaluationId') evaluationId: number) {
    return this.evaluationsService.getAssessorsByEvaluations(evaluationId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Patch('/:id/detail/second_assessment')
  @ApiOperation({ summary: 'Update require_second_assessment field' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Could not update the evaluation.',
  })
  async updateRequireSecondEvaluation(
    @Param('id') evaluationId: number,
    @Body() updateRequireSecondEvaluationDto: UpdateRequireSecondEvaluationDto,
  ) {
    const { require_second_assessment: requireSecondAssessment } =
      updateRequireSecondEvaluationDto;
    return this.evaluationsService.updateRequireSecondEvaluation(
      evaluationId,
      requireSecondAssessment,
    );
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/highlight-status')
  @ApiOperation({ summary: 'Get status of highlighted comments' })
  @ApiResponse({
    status: 200,
    description: 'Highlighted comments status retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Could not retrieve the highlighted status.',
  })
  async pendingHighlights() {
    return this.evaluationsService.pendingHighlights();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp])
  @Get('/status/:result_id')
  @ApiOperation({ summary: 'Get evaluation status by result ID' })
  @ApiResponse({
    status: 200,
    description: 'Evaluation status retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error retrieving the evaluation status.',
  })
  async getEvaluationStatus(@Param('result_id') resultId: string) {
    return this.evaluationsService.getEvaluationStatus(resultId);
  }
}
