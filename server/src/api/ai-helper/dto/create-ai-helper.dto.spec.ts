import {
  CreateAiHelperDto,
  GenderTagLevel,
  ClimateTagLevel,
  NutritionTagLevel,
  EnvironmentalTagLevel,
  PovertyTagLevel,
  InnovationReadinessTagLevel,
} from './create-ai-helper.dto';

describe('CreateAiHelperDto', () => {
  it('should be defined', () => {
    expect(CreateAiHelperDto).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof CreateAiHelperDto).toBe('function');
  });

  it('should create an instance with all required properties', () => {
    const genderTag: GenderTagLevel = {
      gender_ai_prediction: 0.85,
      gender_ai_tag: 'high',
      gender_ai_description: 'High gender relevance',
      gender_ai_matching: 'matched',
    };

    const climateTag: ClimateTagLevel = {
      climate_ai_prediction: 0.75,
      climate_ai_tag: 'medium',
      climate_ai_description: 'Medium climate relevance',
      climate_ai_matching: 'matched',
    };

    const nutritionTag: NutritionTagLevel = {
      nutrition_ai_prediction: 0.90,
      nutrition_ai_tag: 'high',
      nutrition_ai_description: 'High nutrition relevance',
      nutrition_ai_matching: 'matched',
    };

    const environmentalTag: EnvironmentalTagLevel = {
      environmental_ai_prediction: 0.65,
      environmental_ai_tag: 'medium',
      environmental_ai_description: 'Medium environmental relevance',
      environmental_ai_matching: 'matched',
    };

    const povertyTag: PovertyTagLevel = {
      poverty_ai_prediction: 0.80,
      poverty_ai_tag: 'high',
      poverty_ai_description: 'High poverty relevance',
      poverty_ai_matching: 'matched',
    };

    const dto = new CreateAiHelperDto();
    dto.result_code = 1;
    dto.phase_year = 2024;
    dto.gender_tag_level = genderTag;
    dto.climate_tag_level = climateTag;
    dto.nutrition_tag_level = nutritionTag;
    dto.environmental_tag_level = environmentalTag;
    dto.poverty_tag_level = povertyTag;

    expect(dto.result_code).toBe(1);
    expect(dto.phase_year).toBe(2024);
    expect(dto.gender_tag_level).toEqual(genderTag);
    expect(dto.climate_tag_level).toEqual(climateTag);
    expect(dto.nutrition_tag_level).toEqual(nutritionTag);
    expect(dto.environmental_tag_level).toEqual(environmentalTag);
    expect(dto.poverty_tag_level).toEqual(povertyTag);
  });

  it('should allow optional innovation_readiness_tag_level', () => {
    const dto = new CreateAiHelperDto();
    dto.result_code = 1;
    dto.phase_year = 2024;
    dto.gender_tag_level = {} as GenderTagLevel;
    dto.climate_tag_level = {} as ClimateTagLevel;
    dto.nutrition_tag_level = {} as NutritionTagLevel;
    dto.environmental_tag_level = {} as EnvironmentalTagLevel;
    dto.poverty_tag_level = {} as PovertyTagLevel;

    expect(dto.innovation_readiness_tag_level).toBeUndefined();

    const innovationTag: InnovationReadinessTagLevel = {
      innovation_ai_prediction: 0.70,
      innovation_ai_tag: 'medium',
      innovation_ai_description: 'Medium innovation readiness',
      innovation_ai_matching: 'matched',
    };

    dto.innovation_readiness_tag_level = innovationTag;
    expect(dto.innovation_readiness_tag_level).toEqual(innovationTag);
  });

  it('should allow null values in InnovationReadinessTagLevel', () => {
    const innovationTag: InnovationReadinessTagLevel = {
      innovation_ai_prediction: null,
      innovation_ai_tag: null,
      innovation_ai_description: null,
      innovation_ai_matching: null,
    };

    expect(innovationTag.innovation_ai_prediction).toBeNull();
    expect(innovationTag.innovation_ai_tag).toBeNull();
    expect(innovationTag.innovation_ai_description).toBeNull();
    expect(innovationTag.innovation_ai_matching).toBeNull();
  });
});

describe('GenderTagLevel', () => {
  it('should be defined', () => {
    expect(GenderTagLevel).toBeDefined();
  });

  it('should have all required properties', () => {
    const tag: GenderTagLevel = {
      gender_ai_prediction: 0.85,
      gender_ai_tag: 'high',
      gender_ai_description: 'High gender relevance',
      gender_ai_matching: 'matched',
    };

    expect(tag.gender_ai_prediction).toBe(0.85);
    expect(tag.gender_ai_tag).toBe('high');
    expect(tag.gender_ai_description).toBe('High gender relevance');
    expect(tag.gender_ai_matching).toBe('matched');
  });
});

describe('ClimateTagLevel', () => {
  it('should be defined', () => {
    expect(ClimateTagLevel).toBeDefined();
  });

  it('should have all required properties', () => {
    const tag: ClimateTagLevel = {
      climate_ai_prediction: 0.75,
      climate_ai_tag: 'medium',
      climate_ai_description: 'Medium climate relevance',
      climate_ai_matching: 'matched',
    };

    expect(tag.climate_ai_prediction).toBe(0.75);
    expect(tag.climate_ai_tag).toBe('medium');
    expect(tag.climate_ai_description).toBe('Medium climate relevance');
    expect(tag.climate_ai_matching).toBe('matched');
  });
});

describe('NutritionTagLevel', () => {
  it('should be defined', () => {
    expect(NutritionTagLevel).toBeDefined();
  });

  it('should have all required properties', () => {
    const tag: NutritionTagLevel = {
      nutrition_ai_prediction: 0.90,
      nutrition_ai_tag: 'high',
      nutrition_ai_description: 'High nutrition relevance',
      nutrition_ai_matching: 'matched',
    };

    expect(tag.nutrition_ai_prediction).toBe(0.90);
    expect(tag.nutrition_ai_tag).toBe('high');
    expect(tag.nutrition_ai_description).toBe('High nutrition relevance');
    expect(tag.nutrition_ai_matching).toBe('matched');
  });
});

describe('EnvironmentalTagLevel', () => {
  it('should be defined', () => {
    expect(EnvironmentalTagLevel).toBeDefined();
  });

  it('should have all required properties', () => {
    const tag: EnvironmentalTagLevel = {
      environmental_ai_prediction: 0.65,
      environmental_ai_tag: 'medium',
      environmental_ai_description: 'Medium environmental relevance',
      environmental_ai_matching: 'matched',
    };

    expect(tag.environmental_ai_prediction).toBe(0.65);
    expect(tag.environmental_ai_tag).toBe('medium');
    expect(tag.environmental_ai_description).toBe(
      'Medium environmental relevance',
    );
    expect(tag.environmental_ai_matching).toBe('matched');
  });
});

describe('PovertyTagLevel', () => {
  it('should be defined', () => {
    expect(PovertyTagLevel).toBeDefined();
  });

  it('should have all required properties', () => {
    const tag: PovertyTagLevel = {
      poverty_ai_prediction: 0.80,
      poverty_ai_tag: 'high',
      poverty_ai_description: 'High poverty relevance',
      poverty_ai_matching: 'matched',
    };

    expect(tag.poverty_ai_prediction).toBe(0.80);
    expect(tag.poverty_ai_tag).toBe('high');
    expect(tag.poverty_ai_description).toBe('High poverty relevance');
    expect(tag.poverty_ai_matching).toBe('matched');
  });
});

describe('InnovationReadinessTagLevel', () => {
  it('should be defined', () => {
    expect(InnovationReadinessTagLevel).toBeDefined();
  });

  it('should have all properties that can be null', () => {
    const tag: InnovationReadinessTagLevel = {
      innovation_ai_prediction: 0.70,
      innovation_ai_tag: 'medium',
      innovation_ai_description: 'Medium innovation readiness',
      innovation_ai_matching: 'matched',
    };

    expect(tag.innovation_ai_prediction).toBe(0.70);
    expect(tag.innovation_ai_tag).toBe('medium');
    expect(tag.innovation_ai_description).toBe('Medium innovation readiness');
    expect(tag.innovation_ai_matching).toBe('matched');
  });

  it('should allow null values for all properties', () => {
    const tag: InnovationReadinessTagLevel = {
      innovation_ai_prediction: null,
      innovation_ai_tag: null,
      innovation_ai_description: null,
      innovation_ai_matching: null,
    };

    expect(tag.innovation_ai_prediction).toBeNull();
    expect(tag.innovation_ai_tag).toBeNull();
    expect(tag.innovation_ai_description).toBeNull();
    expect(tag.innovation_ai_matching).toBeNull();
  });

  it('should allow mixed null and non-null values', () => {
    const tag: InnovationReadinessTagLevel = {
      innovation_ai_prediction: 0.70,
      innovation_ai_tag: null,
      innovation_ai_description: 'Some description',
      innovation_ai_matching: null,
    };

    expect(tag.innovation_ai_prediction).toBe(0.70);
    expect(tag.innovation_ai_tag).toBeNull();
    expect(tag.innovation_ai_description).toBe('Some description');
    expect(tag.innovation_ai_matching).toBeNull();
  });
});
