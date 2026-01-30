import { Controller, Body, Patch, HttpStatus } from '@nestjs/common';
import { AiHelperService } from './ai-helper.service';
import { CreateAiHelperDto, CreateAiHelperIpsrDto } from './dto/create-ai-helper.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('AI Helper')
@Controller()
export class AiHelperController {
  constructor(private readonly aiHelperService: AiHelperService) {}

  @Patch()
  @ApiOperation({
    summary: 'Create or update AI helper data',
    description:
      'Accepts an array of AI helper data for Results or IPSR. The endpoint automatically detects the type based on the structure: Results have innovation fields at the root level, while IPSR has them nested under `core_innovation`. Supports both formats in the same request.',
  })
  @ApiBody({
    description:
      'Array of AI helper data objects. Can contain both Results (with innovation fields at root) and IPSR (with innovation fields under core_innovation) in the same request.',
    type: [CreateAiHelperDto],
    examples: {
      result: {
        summary: 'Result example',
        description: 'Example of a Result data structure',
        value: [
          {
            result_code: 1001,
            phase_year: 2025,
            gender_tag_level: {
              gender_ai_prediction: 0.85,
              gender_ai_tag: '(2) Principal',
              gender_ai_component: 'Gender Equality',
              gender_ai_description: 'The AI identified Gender as a Principal focus',
              gender_ai_matching: 'Match',
              gender_ai_evidence_level: 'Full',
            },
            climate_tag_level: {
              climate_ai_prediction: 0.92,
              climate_ai_tag: '(2) Principal',
              climate_ai_component: 'Adaptation',
              climate_ai_description: 'Climate Change detected',
              climate_ai_matching: 'Mismatch',
              climate_ai_evidence_level: 'Partial',
            },
            nutrition_tag_level: {
              nutrition_ai_prediction: 1,
              nutrition_ai_tag: '(2) Principal',
              nutrition_ai_component: 'Food Security',
              nutrition_ai_description: 'Nutrition is Significant',
              nutrition_ai_matching: 'Match',
              nutrition_ai_evidence_level: 'Full',
            },
            environmental_tag_level: {
              environmental_ai_prediction: 0.78,
              environmental_ai_tag: '(2) Principal',
              environmental_ai_component: 'Environmental Health',
              environmental_ai_description: 'Environment classified as Significant',
              environmental_ai_matching: 'Match',
              environmental_ai_evidence_level: 'Partial',
            },
            poverty_tag_level: {
              poverty_ai_prediction: 0,
              poverty_ai_tag: '(0) Not Targeted',
              poverty_ai_component: null,
              poverty_ai_description: 'Poverty flagged as Not Targeted',
              poverty_ai_matching: 'Mismatch',
              poverty_ai_evidence_level: 'Partial',
            },
            is_this_an_innovation_result_type: {
              is_this_an_innovation_ai_prediction: 0,
              is_this_an_innovation_ai_tag: '0 - False',
              is_this_an_innovation_ai_description: 'Not classified as innovation',
              is_this_an_innovation_ai_matching: 'Mismatch',
              is_this_an_innovation_ai_evidence_level: 'Partial',
            },
            innovation_readiness_level: {
              innovation_readiness_level_ai_prediction: 8,
              innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
              innovation_readiness_level_ai_description: 'Uncontrolled Testing phase',
              innovation_readiness_level_ai_matching: 'Mismatch',
              innovation_readiness_level_ai_evidence_level: 'Full',
            },
            innovation_use_level: {
              innovation_use_level_ai_prediction: 7,
              innovation_use_level_ai_tag: '7 - Prototype Validation',
              innovation_use_level_ai_description: 'Prototype Validation phase',
              innovation_use_level_ai_matching: 'Mismatch',
              innovation_use_level_ai_evidence_level: 'Full',
            },
            innovation_use_number: {
              innovation_use_level_ai_prediction: null,
              innovation_use_level_ai_tag: [
                {
                  user: 'actors',
                  user_type: 'Researchers',
                  user_subtype: null,
                  quantity: 1,
                  women: null,
                  youth_women: null,
                  non_youth_women: null,
                  men: null,
                  youth_men: null,
                  non_youth_men: null,
                },
              ],
              innovation_use_level_ai_description: '1 Researcher using the innovation',
              innovation_use_level_ai_matching: null,
              innovation_use_level_ai_evidence_level: 'Full',
            },
          },
        ],
      },
      ipsr: {
        summary: 'IPSR example',
        description: 'Example of an IPSR data structure with core_innovation and complementary_innovation',
        value: [
          {
            result_code: 1001,
            phase_year: 2025,
            gender_tag_level: {
              gender_ai_prediction: 0.85,
              gender_ai_tag: '(2) Principal',
              gender_ai_component: 'Gender Equality',
              gender_ai_description: 'The AI identified Gender as a Principal focus',
              gender_ai_matching: 'Match',
              gender_ai_evidence_level: 'Partial',
            },
            climate_tag_level: {
              climate_ai_prediction: 0.92,
              climate_ai_tag: '(2) Principal',
              climate_ai_component: 'Adaptation',
              climate_ai_description: 'Climate Change detected',
              climate_ai_matching: 'Mismatch',
              climate_ai_evidence_level: 'Full',
            },
            nutrition_tag_level: {
              nutrition_ai_prediction: 1,
              nutrition_ai_tag: '(1) Significant',
              nutrition_ai_component: 'Food Security',
              nutrition_ai_description: 'Nutrition is Significant',
              nutrition_ai_matching: 'Match',
              nutrition_ai_evidence_level: 'Full',
            },
            environmental_tag_level: {
              environmental_ai_prediction: 0.78,
              environmental_ai_tag: '(2) Principal',
              environmental_ai_component: 'Environmental Health',
              environmental_ai_description: 'Environment classified as Significant',
              environmental_ai_matching: 'Match',
              environmental_ai_evidence_level: 'Full',
            },
            poverty_tag_level: {
              poverty_ai_prediction: 0,
              poverty_ai_tag: '(0) Not Targeted',
              poverty_ai_component: null,
              poverty_ai_description: 'Poverty flagged as Not Targeted',
              poverty_ai_matching: 'Mismatch',
              poverty_ai_evidence_level: 'Partial',
            },
            is_this_an_innovation_result_type: {
              is_this_an_innovation_ai_prediction: null,
              is_this_an_innovation_ai_tag: null,
              is_this_an_innovation_ai_description: null,
              is_this_an_innovation_ai_matching: null,
              is_this_an_innovation_ai_evidence_level: null,
            },
            core_innovation: {
              innovation_readiness_level: {
                innovation_readiness_level_ai_prediction: 8,
                innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
                innovation_readiness_level_ai_description: 'Uncontrolled Testing phase',
                innovation_readiness_level_ai_matching: 'Mismatch',
                innovation_readiness_level_ai_evidence_level: 'Partial',
              },
              innovation_use_level: {
                innovation_use_level_ai_prediction: 7,
                innovation_use_level_ai_tag: '7 - Prototype Validation',
                innovation_use_level_ai_description: 'Prototype Validation phase',
                innovation_use_level_ai_matching: 'Mismatch',
                innovation_use_level_ai_evidence_level: 'Partial',
              },
              innovation_use_number: {
                innovation_use_level_ai_prediction: null,
                innovation_use_level_ai_tag: [
                  {
                    user: 'actors',
                    user_type: 'Researchers',
                    user_subtype: null,
                    quantity: 1,
                    women: null,
                    youth_women: null,
                    non_youth_women: null,
                    men: null,
                    youth_men: null,
                    non_youth_men: null,
                  },
                ],
                innovation_use_level_ai_description: '1 Researcher using the innovation',
                innovation_use_level_ai_matching: null,
                innovation_use_level_ai_evidence_level: 'Full',
              },
            },
            complementary_innovation: [
              {
                complementary_innovation_result_code: 9872,
                innovation_readiness_level: {
                  innovation_readiness_level_ai_prediction: 8,
                  innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
                  innovation_readiness_level_ai_description: 'Uncontrolled Testing phase',
                  innovation_readiness_level_ai_matching: 'Mismatch',
                  innovation_readiness_level_ai_evidence_level: 'Partial',
                },
                innovation_use_level: {
                  innovation_use_level_ai_prediction: 7,
                  innovation_use_level_ai_tag: '7 - Prototype Validation',
                  innovation_use_level_ai_description: 'Prototype Validation phase',
                  innovation_use_level_ai_matching: 'Mismatch',
                  innovation_use_level_ai_evidence_level: 'Partial',
                },
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Records have been inserted or updated successfully',
    schema: {
      example: {
        data: 'Records have been inserted or updated successfully.',
        description: 'AI helper data inserted/updated successfully',
        status: HttpStatus.OK,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Error inserting AI helper data',
    schema: {
      example: {
        data: {},
        description: 'Error inserting AI helper data',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
    schema: {
      example: {
        data: {},
        description: 'Validation failed',
        status: HttpStatus.BAD_REQUEST,
      },
    },
  })
  create(
    @Body() createAiHelperDto: (CreateAiHelperDto | CreateAiHelperIpsrDto)[],
  ) {
    return this.aiHelperService.create(createAiHelperDto);
  }
}
