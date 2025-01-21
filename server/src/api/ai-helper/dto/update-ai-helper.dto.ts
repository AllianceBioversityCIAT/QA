import { PartialType } from '@nestjs/mapped-types';
import { CreateAiHelperDto } from './create-ai-helper.dto';

export class UpdateAiHelperDto extends PartialType(CreateAiHelperDto) {}
