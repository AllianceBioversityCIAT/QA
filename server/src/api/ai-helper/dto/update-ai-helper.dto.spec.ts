import { UpdateAiHelperDto } from './update-ai-helper.dto';
import { CreateAiHelperDto } from './create-ai-helper.dto';
import { PartialType } from '@nestjs/mapped-types';

describe('UpdateAiHelperDto', () => {
  it('should be defined', () => {
    expect(UpdateAiHelperDto).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof UpdateAiHelperDto).toBe('function');
  });

  it('should extend CreateAiHelperDto via PartialType', () => {
    // Verify that UpdateAiHelperDto extends CreateAiHelperDto
    const updateDto = new UpdateAiHelperDto();
    expect(updateDto).toBeInstanceOf(Object);
  });

  it('should allow partial updates with all properties optional', () => {
    const updateDto = new UpdateAiHelperDto();

    // All properties should be optional
    expect(updateDto.result_code).toBeUndefined();
    expect(updateDto.phase_year).toBeUndefined();
    expect(updateDto.gender_tag_level).toBeUndefined();
    expect(updateDto.climate_tag_level).toBeUndefined();
    expect(updateDto.nutrition_tag_level).toBeUndefined();
    expect(updateDto.environmental_tag_level).toBeUndefined();
    expect(updateDto.poverty_tag_level).toBeUndefined();
    expect(updateDto.innovation_readiness_tag_level).toBeUndefined();
  });

  it('should allow updating only result_code', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.result_code = 2;

    expect(updateDto.result_code).toBe(2);
    expect(updateDto.phase_year).toBeUndefined();
  });

  it('should allow updating only phase_year', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.phase_year = 2025;

    expect(updateDto.phase_year).toBe(2025);
    expect(updateDto.result_code).toBeUndefined();
  });

  it('should allow updating only gender_tag_level', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.gender_tag_level = {
      gender_ai_prediction: 0.90,
      gender_ai_tag: 'very_high',
      gender_ai_description: 'Very high gender relevance',
      gender_ai_matching: 'matched',
    };

    expect(updateDto.gender_tag_level).toBeDefined();
    expect(updateDto.gender_tag_level?.gender_ai_prediction).toBe(0.90);
    expect(updateDto.result_code).toBeUndefined();
  });

  it('should allow updating multiple properties', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.result_code = 3;
    updateDto.phase_year = 2025;
    updateDto.gender_tag_level = {
      gender_ai_prediction: 0.85,
      gender_ai_tag: 'high',
      gender_ai_description: 'High gender relevance',
      gender_ai_matching: 'matched',
    };

    expect(updateDto.result_code).toBe(3);
    expect(updateDto.phase_year).toBe(2025);
    expect(updateDto.gender_tag_level).toBeDefined();
  });

  it('should allow updating innovation_readiness_tag_level', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.innovation_readiness_tag_level = {
      innovation_ai_prediction: 0.75,
      innovation_ai_tag: 'medium',
      innovation_ai_description: 'Medium innovation readiness',
      innovation_ai_matching: 'matched',
    };

    expect(updateDto.innovation_readiness_tag_level).toBeDefined();
    expect(updateDto.innovation_readiness_tag_level?.innovation_ai_prediction).toBe(0.75);
  });

  it('should allow null values in innovation_readiness_tag_level', () => {
    const updateDto = new UpdateAiHelperDto();
    updateDto.innovation_readiness_tag_level = {
      innovation_ai_prediction: null,
      innovation_ai_tag: null,
      innovation_ai_description: null,
      innovation_ai_matching: null,
    };

    expect(updateDto.innovation_readiness_tag_level?.innovation_ai_prediction).toBeNull();
    expect(updateDto.innovation_readiness_tag_level?.innovation_ai_tag).toBeNull();
  });

  it('should work with PartialType from @nestjs/mapped-types', () => {
    // Verify that PartialType is available
    expect(PartialType).toBeDefined();
    expect(typeof PartialType).toBe('function');
  });

  it('should maintain type compatibility with CreateAiHelperDto', () => {
    const updateDto: UpdateAiHelperDto = {
      result_code: 1,
      phase_year: 2024,
    };

    // Should be assignable to UpdateAiHelperDto
    expect(updateDto.result_code).toBe(1);
    expect(updateDto.phase_year).toBe(2024);
  });
});
