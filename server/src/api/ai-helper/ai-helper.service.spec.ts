import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperService } from './ai-helper.service';
import { AiHelperRepository } from './ai-helper.repository';
import { CreateAiHelperDto, CreateAiHelperIpsrDto } from './dto/create-ai-helper.dto';

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

  it('should insert a new record when no existing record is found (Result)', async () => {
    const mockDto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_component: 'Gender Equality',
          gender_ai_description: 'Gender description',
          gender_ai_matching: 'Match',
          gender_ai_evidence_level: 'Full',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_component: 'Adaptation',
          climate_ai_description: 'Climate description',
          climate_ai_matching: 'Mismatch',
          climate_ai_evidence_level: 'Partial',
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
          environmental_ai_tag: '(1) Significant',
          environmental_ai_component: 'Environmental Health',
          environmental_ai_description: 'Environmental description',
          environmental_ai_matching: 'Match',
          environmental_ai_evidence_level: 'Partial',
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
          is_this_an_innovation_ai_prediction: 1,
          is_this_an_innovation_ai_tag: '1 - True',
          is_this_an_innovation_ai_description: 'Is an innovation',
          is_this_an_innovation_ai_matching: 'Match',
          is_this_an_innovation_ai_evidence_level: 'Full',
        },
        innovation_readiness_level: {
          innovation_readiness_level_ai_prediction: 8,
          innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
          innovation_readiness_level_ai_description: 'Innovation readiness description',
          innovation_readiness_level_ai_matching: 'Mismatch',
          innovation_readiness_level_ai_evidence_level: 'Full',
        },
        innovation_use_level: {
          innovation_use_level_ai_prediction: 7,
          innovation_use_level_ai_tag: '7 - Prototype Validation',
          innovation_use_level_ai_description: 'Innovation use description',
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
        gender_ai_component: 'Gender Equality',
        gender_ai_description: 'Gender description',
        gender_ai_matching: 'Match',
        gender_ai_evidence_level: 'Full',
        is_this_an_innovation_ai_prediction: 1,
        innovation_readiness_level_ai_prediction: 8,
        innovation_use_level_ai_prediction: 7,
        complementary_innovation: null,
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
          gender_ai_component: null,
          gender_ai_description: 'Updated Gender description',
          gender_ai_matching: 'Match',
          gender_ai_evidence_level: 'Partial',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.95,
          climate_ai_tag: '(1) Significant',
          climate_ai_component: null,
          climate_ai_description: 'Updated Climate description',
          climate_ai_matching: 'Mismatch',
          climate_ai_evidence_level: 'Full',
        },
        nutrition_tag_level: {
          nutrition_ai_prediction: 0.7,
          nutrition_ai_tag: '(2) Principal',
          nutrition_ai_component: 'Food Security',
          nutrition_ai_description: 'Updated Nutrition description',
          nutrition_ai_matching: 'Mismatch',
          nutrition_ai_evidence_level: 'Partial',
        },
        environmental_tag_level: {
          environmental_ai_prediction: 0.6,
          environmental_ai_tag: '(1) Significant',
          environmental_ai_component: null,
          environmental_ai_description: 'Updated Environmental description',
          environmental_ai_matching: 'Match',
          environmental_ai_evidence_level: 'Full',
        },
        poverty_tag_level: {
          poverty_ai_prediction: 0.3,
          poverty_ai_tag: '(0) Not Targeted',
          poverty_ai_component: null,
          poverty_ai_description: 'Updated Poverty description',
          poverty_ai_matching: 'Mismatch',
          poverty_ai_evidence_level: 'Partial',
        },
        is_this_an_innovation_result_type: {
          is_this_an_innovation_ai_prediction: 0,
          is_this_an_innovation_ai_tag: '0 - False',
          is_this_an_innovation_ai_description: 'Not an innovation',
          is_this_an_innovation_ai_matching: 'Mismatch',
          is_this_an_innovation_ai_evidence_level: 'Partial',
        },
        innovation_readiness_level: {
          innovation_readiness_level_ai_prediction: null,
          innovation_readiness_level_ai_tag: null,
          innovation_readiness_level_ai_description: null,
          innovation_readiness_level_ai_matching: null,
          innovation_readiness_level_ai_evidence_level: null,
        },
        innovation_use_level: {
          innovation_use_level_ai_prediction: null,
          innovation_use_level_ai_tag: null,
          innovation_use_level_ai_description: null,
          innovation_use_level_ai_matching: null,
          innovation_use_level_ai_evidence_level: null,
        },
        innovation_use_number: {
          innovation_use_level_ai_prediction: null,
          innovation_use_level_ai_tag: [],
          innovation_use_level_ai_description: null,
          innovation_use_level_ai_matching: null,
          innovation_use_level_ai_evidence_level: null,
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
        gender_ai_component: null,
        gender_ai_description: 'Updated Gender description',
        gender_ai_matching: 'Match',
        gender_ai_evidence_level: 'Partial',
      }),
    );
    expect(result).toEqual({
      data: 'Records have been inserted or updated successfully.',
      description: 'AI helper data inserted/updated successfully',
      status: 200,
    });
  });

  it('should insert a new IPSR record when no existing record is found', async () => {
    const mockDto: CreateAiHelperIpsrDto[] = [
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

    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    jest.spyOn(repository, 'insert').mockResolvedValue({} as any);

    const result = await service.create(mockDto);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { result_code: 1001, phase_year: 2025 },
    });
    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        result_code: 1001,
        phase_year: 2025,
        innovation_readiness_level_ai_prediction: 8,
        innovation_use_level_ai_prediction: 7,
        complementary_innovation: expect.stringContaining('9872'),
      }),
    );
    expect(result).toEqual({
      data: 'Records have been inserted or updated successfully.',
      description: 'AI helper data inserted/updated successfully',
      status: 200,
    });
  });

  it('should handle error when inserting fails', async () => {
    const mockDto: CreateAiHelperDto[] = [
      {
        result_code: 3844,
        phase_year: 2024,
        gender_tag_level: {
          gender_ai_prediction: 0.85,
          gender_ai_tag: '(2) Principal',
          gender_ai_component: 'Gender Equality',
          gender_ai_description: 'Gender description',
          gender_ai_matching: 'Match',
          gender_ai_evidence_level: 'Full',
        },
        climate_tag_level: {
          climate_ai_prediction: 0.92,
          climate_ai_tag: '(2) Principal',
          climate_ai_component: 'Adaptation',
          climate_ai_description: 'Climate description',
          climate_ai_matching: 'Mismatch',
          climate_ai_evidence_level: 'Partial',
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
          environmental_ai_tag: '(1) Significant',
          environmental_ai_component: 'Environmental Health',
          environmental_ai_description: 'Environmental description',
          environmental_ai_matching: 'Match',
          environmental_ai_evidence_level: 'Partial',
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
          is_this_an_innovation_ai_prediction: 1,
          is_this_an_innovation_ai_tag: '1 - True',
          is_this_an_innovation_ai_description: 'Is an innovation',
          is_this_an_innovation_ai_matching: 'Match',
          is_this_an_innovation_ai_evidence_level: 'Full',
        },
        innovation_readiness_level: {
          innovation_readiness_level_ai_prediction: 8,
          innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
          innovation_readiness_level_ai_description: 'Innovation readiness',
          innovation_readiness_level_ai_matching: 'Mismatch',
          innovation_readiness_level_ai_evidence_level: 'Full',
        },
        innovation_use_level: {
          innovation_use_level_ai_prediction: 7,
          innovation_use_level_ai_tag: '7 - Prototype Validation',
          innovation_use_level_ai_description: 'Innovation use',
          innovation_use_level_ai_matching: 'Mismatch',
          innovation_use_level_ai_evidence_level: 'Full',
        },
        innovation_use_number: {
          innovation_use_level_ai_prediction: null,
          innovation_use_level_ai_tag: [],
          innovation_use_level_ai_description: 'Innovation use number',
          innovation_use_level_ai_matching: null,
          innovation_use_level_ai_evidence_level: 'Full',
        },
      },
    ];

    jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Database error'));

    const result = await service.create(mockDto);

    expect(result).toEqual({
      data: {},
      description: 'Error inserting AI helper data',
      status: 500,
    });
  });
});
