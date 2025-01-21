import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AiHelperService } from './ai-helper.service';
import { CreateAiHelperDto } from './dto/create-ai-helper.dto';
import { UpdateAiHelperDto } from './dto/update-ai-helper.dto';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('AI Helper')
@ApiHeader({
  name: 'authorization',
  description: 'Auth token',
})
@Controller()
export class AiHelperController {
  constructor(private readonly aiHelperService: AiHelperService) {}

  @Patch()
  create(@Body() createAiHelperDto: CreateAiHelperDto[]) {
    return this.aiHelperService.create(createAiHelperDto);
  }
}
