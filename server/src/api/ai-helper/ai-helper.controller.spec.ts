import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperController } from './ai-helper.controller';
import { AiHelperService } from './ai-helper.service';
import { CreateAiHelperDto, CreateAiHelperIpsrDto } from './dto/create-ai-helper.dto';

describe('AiHelperController', () => {
  let controller: AiHelperController;
  let service: AiHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiHelperController],
      providers: [
        {
          provide: AiHelperService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              data: 'Records have been inserted or updated successfully.',
              status: 200,
              description: 'AI helper data inserted/updated successfully',
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AiHelperController>(AiHelperController);
    service = module.get<AiHelperService>(AiHelperService);
  });

  it('should call create method and return success response for Result', async () => {
    const dto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_component: 'Gender Equality',
          gender_ai_description:
            'The AI identified Gender as a Principal focus with a strong match to the defined criteria.',
          gender_ai_matching: 'Match',
          gender_ai_evidence_level: 'Full',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_component: 'Adaptation',
          climate_ai_description:
            'The AI detected Climate Change as a Principal focus, but flagged a mismatch with the expected alignment.',
          climate_ai_matching: 'Mismatch',
          climate_ai_evidence_level: 'Partial',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 1,
          nutrition_ai_tag: '(1) Significant',
          nutrition_ai_component: 'Food Security',
          nutrition_ai_description:
            'Nutrition is considered Significant, and the AI determined a strong alignment with the criteria.',
          nutrition_ai_matching: 'Match',
          nutrition_ai_evidence_level: 'Full',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.78,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_component: 'Environmental Health',
          environmental_ai_description:
            'The AI classified Environment as Significant with a high level of relevance to the project goals.',
          environmental_ai_matching: 'Match',
          environmental_ai_evidence_level: 'Partial',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_component: null,
          poverty_ai_description:
            'Poverty was flagged as Not Targeted, indicating a mismatch with the current criteria and focus areas.',
          poverty_ai_matching: 'Mismatch',
          poverty_ai_evidence_level: 'Partial',
        },
        is_this_an_innovation_result_type: {
          is_this_an_innovation_ai_prediction: 1,
          is_this_an_innovation_ai_tag: '1 - True',
          is_this_an_innovation_ai_description: 'Is an innovation',
          is_this_an_innovation_ai_matching: 'Match',
          is_this_an_innovation_ai_evidence_level: 'Full',
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
          innovation_use_level_ai_tag: [],
          innovation_use_level_ai_description: 'Innovation use number description',
          innovation_use_level_ai_matching: null,
          innovation_use_level_ai_evidence_level: 'Full',
        },
      },
    ];

    const response = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual({
      data: 'Records have been inserted or updated successfully.',
      status: 200,
      description: 'AI helper data inserted/updated successfully',
    });
  });

  it('should call create method and return success response for IPSR', async () => {
    const dto: CreateAiHelperIpsrDto[] = [
      {
        result_code: 1001,
        phase_year: 2025,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_component: 'Gender Equality',
          gender_ai_description: 'Gender description',
          gender_ai_matching: 'Match',
          gender_ai_evidence_level: 'Partial',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_component: 'Adaptation',
          climate_ai_description: 'Climate description',
          climate_ai_matching: 'Mismatch',
          climate_ai_evidence_level: 'Full',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 1,
          nutrition_ai_tag: '(1) Significant',
          nutrition_ai_component: 'Food Security',
          nutrition_ai_description: 'Nutrition description',
          nutrition_ai_matching: 'Match',
          nutrition_ai_evidence_level: 'Full',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.78,
          environmental_ai_tag: '(2) Principal',
          environmental_ai_component: 'Environmental Health',
          environmental_ai_description: 'Environmental description',
          environmental_ai_matching: 'Match',
          environmental_ai_evidence_level: 'Full',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_component: null,
          poverty_ai_description: 'Poverty description',
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
            innovation_readiness_level_ai_description: 'Core innovation readiness',
            innovation_readiness_level_ai_matching: 'Mismatch',
            innovation_readiness_level_ai_evidence_level: 'Partial',
          },
          innovation_use_level: {
            innovation_use_level_ai_prediction: 7,
            innovation_use_level_ai_tag: '7 - Prototype Validation',
            innovation_use_level_ai_description: 'Core innovation use',
            innovation_use_level_ai_matching: 'Mismatch',
            innovation_use_level_ai_evidence_level: 'Partial',
          },
          innovation_use_number: {
            innovation_use_level_ai_prediction: null,
            innovation_use_level_ai_tag: [],
            innovation_use_level_ai_description: 'Core innovation use number',
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
              innovation_readiness_level_ai_description: 'Complementary innovation readiness',
              innovation_readiness_level_ai_matching: 'Mismatch',
              innovation_readiness_level_ai_evidence_level: 'Partial',
            },
            innovation_use_level: {
              innovation_use_level_ai_prediction: 7,
              innovation_use_level_ai_tag: '7 - Prototype Validation',
              innovation_use_level_ai_description: 'Complementary innovation use',
              innovation_use_level_ai_matching: 'Mismatch',
              innovation_use_level_ai_evidence_level: 'Partial',
            },
          },
        ],
      },
    ];

    const response = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(response).toEqual({
      data: 'Records have been inserted or updated successfully.',
      status: 200,
      description: 'AI helper data inserted/updated successfully',
    });
  });
});
