import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { IndicatorsService } from './indicators.service';
import {
  AssignIndicatorDto,
  CreateIndicatorDto,
  UpdateIndicatorDto,
} from './dto/indicator.dto';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RolesHandler } from '../../shared/enum/roles-handler.enum';
import { RolesGuard } from '../../shared/guards/role.guard';

@ApiTags('Indicators')
@ApiHeader({
  name: 'authentication',
  description: 'Bearer token',
})
@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Post()
  @ApiOperation({ summary: 'Create a new indicator' })
  @ApiResponse({ status: 200, description: 'Indicator created successfully.' })
  create(@Body() createIndicatorDto: CreateIndicatorDto) {
    return this.indicatorsService.create(createIndicatorDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Post('/assign')
  @ApiOperation({ summary: 'Assign an indicator to a user' })
  @ApiResponse({ status: 200, description: 'Indicator assigned successfully.' })
  assignIndicatorToUser(@Body() assignIndicatorDto: AssignIndicatorDto) {
    return this.indicatorsService.assignIndicatorToUser(assignIndicatorDto);
  }

  @UseGuards(RolesGuard)
  @Roles([
    RolesHandler.admin,
    RolesHandler.assesor,
    RolesHandler.crp,
    RolesHandler.guest,
  ])
  @Get()
  @ApiOperation({ summary: 'Get all active indicators' })
  @ApiResponse({
    status: 200,
    description: 'Indicators retrieved successfully.',
  })
  @ApiResponse({ status: 404, description: 'Could not access indicators.' })
  findAll() {
    return this.indicatorsService.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Patch(':id')
  @ApiOperation({ summary: 'Edit an indicator by ID' })
  @ApiResponse({ status: 200, description: 'Indicator updated successfully.' })
  @ApiResponse({ status: 404, description: 'Indicator not found.' })
  @ApiResponse({ status: 400, description: 'Validation errors.' })
  @ApiResponse({ status: 409, description: 'Indicator already in use.' })
  update(
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ) {
    return this.indicatorsService.update(+id, updateIndicatorDto);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an indicator by ID' })
  @ApiResponse({ status: 200, description: 'Indicator deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Indicator not found.' })
  @ApiResponse({ status: 500, description: 'Error deleting indicator.' })
  remove(@Param('id') id: string) {
    return this.indicatorsService.remove(+id);
  }

  @UseGuards(RolesGuard)
  @Roles([
    RolesHandler.admin,
    RolesHandler.assesor,
    RolesHandler.crp,
    RolesHandler.guest,
  ])
  @Get('/user/:id')
  @ApiOperation({ summary: 'Get indicators by user' })
  @ApiResponse({
    status: 200,
    description: 'User indicators retrieved successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error retrieving user indicators.',
  })
  getIndicatorsByUser(
    @Param('id') id: string,
    @Query('crp_id') crpId?: string,
  ) {
    return this.indicatorsService.getIndicatorsByUser(+id, crpId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/items/:indicator')
  @ApiOperation({ summary: 'Get item status by indicator' })
  @ApiResponse({
    status: 200,
    description: 'Items by indicator retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Error retrieving item status.' })
  getItemStatusByIndicator(
    @Param('indicator') indicator: string,
    @Query('crp_id') crpId?: string,
  ) {
    return this.indicatorsService.getItemStatusByIndicator(indicator, crpId);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin, RolesHandler.assesor])
  @Get('/items')
  @ApiOperation({ summary: 'Get all item statuses by indicator' })
  @ApiResponse({
    status: 200,
    description: 'All items by indicator retrieved successfully.',
  })
  @ApiResponse({ status: 500, description: 'Error retrieving items.' })
  getAllItemStatusByIndicator() {
    return this.indicatorsService.getAllItemStatuses();
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/:id/crp/:crp_id/items')
  @ApiOperation({
    summary: 'Get all item statuses by indicator and CRP for MIS',
  })
  @ApiResponse({
    status: 200,
    description: 'Items for MIS retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Items for MIS cannot be retrieved.',
  })
  getItemListStatusMIS(
    @Param('id') id: string,
    @Param('crp_id') crpId: string,
    @Query('AR') AR: number,
  ) {
    return this.indicatorsService.getItemListStatusMIS(+id, crpId, AR);
  }

  @UseGuards(RolesGuard)
  @Roles([RolesHandler.admin])
  @Get('/:id/crp/:crp_id/item/:item_id')
  @ApiOperation({ summary: 'Get item status by indicator and CRP for MIS' })
  @ApiResponse({
    status: 200,
    description: 'Item for MIS retrieved successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item for MIS cannot be retrieved.',
  })
  getItemStatusMIS(
    @Param('id') id: string,
    @Param('crp_id') crpId: string,
    @Param('item_id') itemId: string,
    @Query('AR') AR: number,
  ) {
    return this.indicatorsService.getItemStatusMIS(+id, crpId, itemId, AR);
  }

  @UseGuards(RolesGuard)
  @Roles([
    RolesHandler.admin,
    RolesHandler.assesor,
    RolesHandler.crp,
    RolesHandler.guest,
  ])
  @Get('/crp/:crp_id')
  @ApiOperation({ summary: 'Get CRP data by ID' })
  @ApiResponse({ status: 200, description: 'CRP data retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Could not access CRP data.' })
  getCRP(@Param('crp_id') crpId: string) {
    return this.indicatorsService.getCRP(crpId);
  }
}
