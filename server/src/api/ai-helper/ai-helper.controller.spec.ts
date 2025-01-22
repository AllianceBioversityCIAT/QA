import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperController } from './ai-helper.controller';
import { AiHelperService } from './ai-helper.service';

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

  it('should call create method and return success response', async () => {
    const dto = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_description:
            'The AI identified Gender as a Principal focus with a strong match to the defined criteria.',
          gender_ai_matching: 'Match',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_description:
            'The AI detected Climate Change as a Principal focus, but flagged a mismatch with the expected alignment.',
          climate_ai_matching: 'Mismatch',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 1,
          nutrition_ai_tag: '(1) Significant',
          nutrition_ai_description:
            'Nutrition is considered Significant, and the AI determined a strong alignment with the criteria.',
          nutrition_ai_matching: 'Match',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.78,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_description:
            'The AI classified Environment as Significant with a high level of relevance to the project goals.',
          environmental_ai_matching: 'Match',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_description:
            'Poverty was flagged as Not Targeted, indicating a mismatch with the current criteria and focus areas.',
          poverty_ai_matching: 'Mismatch',
        },
        innovation_readiness_tag_level: {
          innovation_ai_prediction: null,
          innovation_ai_tag: null,
          innovation_ai_description: null,
          innovation_ai_matching: null,
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
});
