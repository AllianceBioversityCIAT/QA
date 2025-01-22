import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperService } from './ai-helper.service';
import { AiHelperRepository } from './ai-helper.repository';
import { CreateAiHelperDto } from './dto/create-ai-helper.dto';
import { HttpStatus } from '@nestjs/common';

describe('AiHelperService', () => {
  let service: AiHelperService;
  let repository: AiHelperRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiHelperService,
        {
          provide: AiHelperRepository,
          useValue: {
            upsert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiHelperService>(AiHelperService);
    repository = module.get<AiHelperRepository>(AiHelperRepository);
  });

  it('should create records and call upsert for each DTO', async () => {
    const mockDto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_description: 'Gender description',
          gender_ai_matching: 'Match',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_description: 'Climate description',
          climate_ai_matching: 'Mismatch',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 1,
          nutrition_ai_tag: '(1) Significant',
          nutrition_ai_description: 'Nutrition description',
          nutrition_ai_matching: 'Match',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.78,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_description: 'Environmental description',
          environmental_ai_matching: 'Match',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_description: 'Poverty description',
          poverty_ai_matching: 'Mismatch',
        },
        innovation_readiness_tag_level: {
          innovation_ai_prediction: 8,
          innovation_ai_tag: '8 - Uncontrolled Testing',
          innovation_ai_description: 'Innovation description',
          innovation_ai_matching: 'Mismatch',
        },
      },
    ];

    jest.spyOn(repository, 'upsert').mockResolvedValue({} as any);

    const result = await service.create(mockDto);

    expect(repository.upsert).toHaveBeenCalledTimes(1);
    expect(repository.upsert).toHaveBeenCalledWith(
      {
        result_code: 3844,
        phase_year: 2024,
        gender_ai_prediction: 0.85,
        gender_ai_tag: '(2) Principal',
        gender_ai_description: 'Gender description',
        gender_ai_matching: 'Match',
        climate_ai_prediction: 0.92,
        climate_ai_tag: '(2) Principal',
        climate_ai_description: 'Climate description',
        climate_ai_matching: 'Mismatch',
        nutrition_ai_prediction: 1,
        nutrition_ai_tag: '(1) Significant',
        nutrition_ai_description: 'Nutrition description',
        nutrition_ai_matching: 'Match',
        environmental_ai_prediction: 0.78,
        environmental_ai_tag: '(1) Significant',
        environmental_ai_description: 'Environmental description',
        environmental_ai_matching: 'Match',
        poverty_ai_prediction: 0,
        poverty_ai_tag: '(0) Not Targeted',
        poverty_ai_description: 'Poverty description',
        poverty_ai_matching: 'Mismatch',
        innovation_ai_prediction: 8,
        innovation_ai_tag: '8 - Uncontrolled Testing',
        innovation_ai_description: 'Innovation description',
        innovation_ai_matching: 'Mismatch',
      },
      { conflictPaths: ['result_code', 'phase_year'] },
    );

    expect(result).toEqual({
      data: 'Records have been inserted or updated successfully.',
      description: 'AI helper data inserted/updated successfully',
      status: HttpStatus.OK,
    });
  });

  it('should handle errors and return a formatted error response', async () => {
    const mockDto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_description: 'Gender description',
          gender_ai_matching: 'Match',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_description: 'Climate description',
          climate_ai_matching: 'Mismatch',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 1,
          nutrition_ai_tag: '(1) Significant',
          nutrition_ai_description: 'Nutrition description',
          nutrition_ai_matching: 'Match',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.78,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_description: 'Environmental description',
          environmental_ai_matching: 'Match',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_description: 'Poverty description',
          poverty_ai_matching: 'Mismatch',
        },
        innovation_readiness_tag_level: {
          innovation_ai_prediction: 8,
          innovation_ai_tag: '8 - Uncontrolled Testing',
          innovation_ai_description: 'Innovation description',
          innovation_ai_matching: 'Mismatch',
        },
      },
    ];

    jest
      .spyOn(repository, 'upsert')
      .mockRejectedValue(new Error('Database error'));

    const result = await service.create(mockDto);

    expect(repository.upsert).toHaveBeenCalled();
    expect(result).toEqual({
      data: {},
      description: 'Error inserting AI helper data',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  });
});
