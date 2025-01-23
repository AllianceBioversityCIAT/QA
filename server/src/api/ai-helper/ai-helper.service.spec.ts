import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperService } from './ai-helper.service';
import { AiHelperRepository } from './ai-helper.repository';
import { CreateAiHelperDto } from './dto/create-ai-helper.dto';

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
            findOne: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiHelperService>(AiHelperService);
    repository = module.get<AiHelperRepository>(AiHelperRepository);
  });

  it('should insert a new record when no existing record is found', async () => {
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

    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    jest.spyOn(repository, 'insert').mockResolvedValue({} as any);

    const result = await service.create(mockDto);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { result_code: 3844, phase_year: 2024 },
    });
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        result_code: 3844,
        phase_year: 2024,
        gender_ai_prediction: 0.85,
        gender_ai_tag: '(2) Principal',
        gender_ai_description: 'Gender description',
        gender_ai_matching: 'Match',
      }),
    );
    expect(result).toEqual({
      data: 'Records have been inserted or updated successfully.',
      description: 'AI helper data inserted/updated successfully',
      status: 200,
    });
  });

  it('should update an existing record when a match is found', async () => {
    const mockDto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.9,
          gender_ai_tag: '(1) Significant',
          gender_ai_description: 'Updated Gender description',
          gender_ai_matching: 'Match',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.95,
          climate_ai_tag: '(1) Significant',
          climate_ai_description: 'Updated Climate description',
          climate_ai_matching: 'Mismatch',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 0.7,
          nutrition_ai_tag: '(2) Principal',
          nutrition_ai_description: 'Updated Nutrition description',
          nutrition_ai_matching: 'Mismatch',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.6,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_description: 'Updated Environmental description',
          environmental_ai_matching: 'Match',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0.3,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_description: 'Updated Poverty description',
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

    jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);
    jest.spyOn(repository, 'update').mockResolvedValue({} as any);

    const result = await service.create(mockDto);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { result_code: 3844, phase_year: 2024 },
    });
    expect(repository.update).toHaveBeenCalledWith(
      { result_code: 3844, phase_year: 2024 },
      expect.objectContaining({
        gender_ai_prediction: 0.9,
        gender_ai_tag: '(1) Significant',
        gender_ai_description: 'Updated Gender description',
        gender_ai_matching: 'Match',
      }),
    );
    expect(result).toEqual({
      data: 'Records have been inserted or updated successfully.',
      description: 'AI helper data inserted/updated successfully',
      status: 200,
    });
  });
});
