import {
  CreateAiHelperDto,
  CreateAiHelperIpsrDto,
  GenderTagLevel,
  ClimateTagLevel,
  NutritionTagLevel,
  EnvironmentalTagLevel,
  PovertyTagLevel,
  InnovationReadinessTagLevel,
  IsThisAnInnovationResultType,
  InnovationReadinessLevel,
  InnovationUseLevel,
  InnovationUseNumber,
  CoreInnovation,
  ComplementaryInnovation,
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
      gender_ai_component: 'Gender Equality',
      gender_ai_description: 'High gender relevance',
      gender_ai_matching: 'matched',
      gender_ai_evidence_level: 'Full',
    };

    const climateTag: ClimateTagLevel = {
      climate_ai_prediction: 0.75,
      climate_ai_tag: 'medium',
      climate_ai_component: 'Adaptation',
      climate_ai_description: 'Medium climate relevance',
      climate_ai_matching: 'matched',
      climate_ai_evidence_level: 'Partial',
    };

    const nutritionTag: NutritionTagLevel = {
      nutrition_ai_prediction: 0.90,
      nutrition_ai_tag: 'high',
      nutrition_ai_component: 'Food Security',
      nutrition_ai_description: 'High nutrition relevance',
      nutrition_ai_matching: 'matched',
      nutrition_ai_evidence_level: 'Full',
    };

    const environmentalTag: EnvironmentalTagLevel = {
      environmental_ai_prediction: 0.65,
      environmental_ai_tag: 'medium',
      environmental_ai_component: 'Environmental Health',
      environmental_ai_description: 'Medium environmental relevance',
      environmental_ai_matching: 'matched',
      environmental_ai_evidence_level: 'Partial',
    };

    const povertyTag: PovertyTagLevel = {
      poverty_ai_prediction: 0.80,
      poverty_ai_tag: 'high',
      poverty_ai_component: null,
      poverty_ai_description: 'High poverty relevance',
      poverty_ai_matching: 'matched',
      poverty_ai_evidence_level: 'Full',
    };

    const isThisAnInnovation: IsThisAnInnovationResultType = {
      is_this_an_innovation_ai_prediction: 1,
      is_this_an_innovation_ai_tag: '1 - True',
      is_this_an_innovation_ai_description: 'Is an innovation',
      is_this_an_innovation_ai_matching: 'Match',
      is_this_an_innovation_ai_evidence_level: 'Full',
    };

    const innovationReadinessLevel: InnovationReadinessLevel = {
      innovation_readiness_level_ai_prediction: 8,
      innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
      innovation_readiness_level_ai_description: 'Uncontrolled Testing phase',
      innovation_readiness_level_ai_matching: 'Mismatch',
      innovation_readiness_level_ai_evidence_level: 'Full',
    };

    const innovationUseLevel: InnovationUseLevel = {
      innovation_use_level_ai_prediction: 7,
      innovation_use_level_ai_tag: '7 - Prototype Validation',
      innovation_use_level_ai_description: 'Prototype Validation phase',
      innovation_use_level_ai_matching: 'Mismatch',
      innovation_use_level_ai_evidence_level: 'Full',
    };

    const innovationUseNumber: InnovationUseNumber = {
      innovation_use_level_ai_prediction: null,
      innovation_use_level_ai_tag: [],
      innovation_use_level_ai_description: 'Description',
      innovation_use_level_ai_matching: null,
      innovation_use_level_ai_evidence_level: 'Full',
    };

    const dto = new CreateAiHelperDto();
    dto.result_code = 1;
    dto.phase_year = 2024;
    dto.gender_tag_level = genderTag;
    dto.climate_tag_level = climateTag;
    dto.nutrition_tag_level = nutritionTag;
    dto.environmental_tag_level = environmentalTag;
    dto.poverty_tag_level = povertyTag;
    dto.is_this_an_innovation_result_type = isThisAnInnovation;
    dto.innovation_readiness_level = innovationReadinessLevel;
    dto.innovation_use_level = innovationUseLevel;
    dto.innovation_use_number = innovationUseNumber;

    expect(dto.result_code).toBe(1);
    expect(dto.phase_year).toBe(2024);
    expect(dto.gender_tag_level).toEqual(genderTag);
    expect(dto.climate_tag_level).toEqual(climateTag);
    expect(dto.nutrition_tag_level).toEqual(nutritionTag);
    expect(dto.environmental_tag_level).toEqual(environmentalTag);
    expect(dto.poverty_tag_level).toEqual(povertyTag);
    expect(dto.is_this_an_innovation_result_type).toEqual(isThisAnInnovation);
    expect(dto.innovation_readiness_level).toEqual(innovationReadinessLevel);
    expect(dto.innovation_use_level).toEqual(innovationUseLevel);
    expect(dto.innovation_use_number).toEqual(innovationUseNumber);
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

  it('should have all required properties including component and evidence_level', () => {
    const tag: GenderTagLevel = {
      gender_ai_prediction: 0.85,
      gender_ai_tag: 'high',
      gender_ai_component: 'Gender Equality',
      gender_ai_description: 'High gender relevance',
      gender_ai_matching: 'matched',
      gender_ai_evidence_level: 'Full',
    };

    expect(tag.gender_ai_prediction).toBe(0.85);
    expect(tag.gender_ai_tag).toBe('high');
    expect(tag.gender_ai_component).toBe('Gender Equality');
    expect(tag.gender_ai_description).toBe('High gender relevance');
    expect(tag.gender_ai_matching).toBe('matched');
    expect(tag.gender_ai_evidence_level).toBe('Full');
  });

  it('should allow null component when tag is not Principal', () => {
    const tag: GenderTagLevel = {
      gender_ai_prediction: 0.5,
      gender_ai_tag: '(1) Significant',
      gender_ai_component: null,
      gender_ai_description: 'Significant gender relevance',
      gender_ai_matching: 'matched',
      gender_ai_evidence_level: 'Partial',
    };

    expect(tag.gender_ai_component).toBeNull();
  });
});

describe('ClimateTagLevel', () => {
  it('should be defined', () => {
    expect(ClimateTagLevel).toBeDefined();
  });

  it('should have all required properties including component and evidence_level', () => {
    const tag: ClimateTagLevel = {
      climate_ai_prediction: 0.75,
      climate_ai_tag: 'medium',
      climate_ai_component: 'Adaptation',
      climate_ai_description: 'Medium climate relevance',
      climate_ai_matching: 'matched',
      climate_ai_evidence_level: 'Partial',
    };

    expect(tag.climate_ai_prediction).toBe(0.75);
    expect(tag.climate_ai_tag).toBe('medium');
    expect(tag.climate_ai_component).toBe('Adaptation');
    expect(tag.climate_ai_description).toBe('Medium climate relevance');
    expect(tag.climate_ai_matching).toBe('matched');
    expect(tag.climate_ai_evidence_level).toBe('Partial');
  });
});

describe('NutritionTagLevel', () => {
  it('should be defined', () => {
    expect(NutritionTagLevel).toBeDefined();
  });

  it('should have all required properties including component and evidence_level', () => {
    const tag: NutritionTagLevel = {
      nutrition_ai_prediction: 0.90,
      nutrition_ai_tag: 'high',
      nutrition_ai_component: 'Food Security',
      nutrition_ai_description: 'High nutrition relevance',
      nutrition_ai_matching: 'matched',
      nutrition_ai_evidence_level: 'Full',
    };

    expect(tag.nutrition_ai_prediction).toBe(0.90);
    expect(tag.nutrition_ai_tag).toBe('high');
    expect(tag.nutrition_ai_component).toBe('Food Security');
    expect(tag.nutrition_ai_description).toBe('High nutrition relevance');
    expect(tag.nutrition_ai_matching).toBe('matched');
    expect(tag.nutrition_ai_evidence_level).toBe('Full');
  });
});

describe('EnvironmentalTagLevel', () => {
  it('should be defined', () => {
    expect(EnvironmentalTagLevel).toBeDefined();
  });

  it('should have all required properties including component and evidence_level', () => {
    const tag: EnvironmentalTagLevel = {
      environmental_ai_prediction: 0.65,
      environmental_ai_tag: 'medium',
      environmental_ai_component: 'Environmental Health',
      environmental_ai_description: 'Medium environmental relevance',
      environmental_ai_matching: 'matched',
      environmental_ai_evidence_level: 'Partial',
    };

    expect(tag.environmental_ai_prediction).toBe(0.65);
    expect(tag.environmental_ai_tag).toBe('medium');
    expect(tag.environmental_ai_component).toBe('Environmental Health');
    expect(tag.environmental_ai_description).toBe(
      'Medium environmental relevance',
    );
    expect(tag.environmental_ai_matching).toBe('matched');
    expect(tag.environmental_ai_evidence_level).toBe('Partial');
  });
});

describe('PovertyTagLevel', () => {
  it('should be defined', () => {
    expect(PovertyTagLevel).toBeDefined();
  });

  it('should have all required properties including component and evidence_level', () => {
    const tag: PovertyTagLevel = {
      poverty_ai_prediction: 0.80,
      poverty_ai_tag: 'high',
      poverty_ai_component: null,
      poverty_ai_description: 'High poverty relevance',
      poverty_ai_matching: 'matched',
      poverty_ai_evidence_level: 'Full',
    };

    expect(tag.poverty_ai_prediction).toBe(0.80);
    expect(tag.poverty_ai_tag).toBe('high');
    expect(tag.poverty_ai_component).toBeNull();
    expect(tag.poverty_ai_description).toBe('High poverty relevance');
    expect(tag.poverty_ai_matching).toBe('matched');
    expect(tag.poverty_ai_evidence_level).toBe('Full');
  });
});

describe('CreateAiHelperIpsrDto', () => {
  it('should be defined', () => {
    expect(CreateAiHelperIpsrDto).toBeDefined();
  });

  it('should create an instance with core_innovation and complementary_innovation', () => {
    const coreInnovation: CoreInnovation = {
      innovation_readiness_level: {
        innovation_readiness_level_ai_prediction: 8,
        innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
        innovation_readiness_level_ai_description: 'Uncontrolled Testing',
        innovation_readiness_level_ai_matching: 'Mismatch',
        innovation_readiness_level_ai_evidence_level: 'Partial',
      },
      innovation_use_level: {
        innovation_use_level_ai_prediction: 7,
        innovation_use_level_ai_tag: '7 - Prototype Validation',
        innovation_use_level_ai_description: 'Prototype Validation',
        innovation_use_level_ai_matching: 'Mismatch',
        innovation_use_level_ai_evidence_level: 'Partial',
      },
      innovation_use_number: {
        innovation_use_level_ai_prediction: null,
        innovation_use_level_ai_tag: [],
        innovation_use_level_ai_description: 'Description',
        innovation_use_level_ai_matching: null,
        innovation_use_level_ai_evidence_level: 'Full',
      },
    };

    const complementaryInnovation: ComplementaryInnovation[] = [
      {
        complementary_innovation_result_code: 9872,
        innovation_readiness_level: {
          innovation_readiness_level_ai_prediction: 8,
          innovation_readiness_level_ai_tag: '8 - Uncontrolled Testing',
          innovation_readiness_level_ai_description: 'Uncontrolled Testing',
          innovation_readiness_level_ai_matching: 'Mismatch',
          innovation_readiness_level_ai_evidence_level: 'Partial',
        },
        innovation_use_level: {
          innovation_use_level_ai_prediction: 7,
          innovation_use_level_ai_tag: '7 - Prototype Validation',
          innovation_use_level_ai_description: 'Prototype Validation',
          innovation_use_level_ai_matching: 'Mismatch',
          innovation_use_level_ai_evidence_level: 'Partial',
        },
      },
    ];

    const dto = new CreateAiHelperIpsrDto();
    dto.result_code = 1001;
    dto.phase_year = 2025;
    dto.gender_tag_level = {} as GenderTagLevel;
    dto.climate_tag_level = {} as ClimateTagLevel;
    dto.nutrition_tag_level = {} as NutritionTagLevel;
    dto.environmental_tag_level = {} as EnvironmentalTagLevel;
    dto.poverty_tag_level = {} as PovertyTagLevel;
    dto.is_this_an_innovation_result_type = {} as IsThisAnInnovationResultType;
    dto.core_innovation = coreInnovation;
    dto.complementary_innovation = complementaryInnovation;

    expect(dto.result_code).toBe(1001);
    expect(dto.phase_year).toBe(2025);
    expect(dto.core_innovation).toEqual(coreInnovation);
    expect(dto.complementary_innovation).toEqual(complementaryInnovation);
  });

  it('should allow optional complementary_innovation', () => {
    const dto = new CreateAiHelperIpsrDto();
    dto.result_code = 1001;
    dto.phase_year = 2025;
    dto.gender_tag_level = {} as GenderTagLevel;
    dto.climate_tag_level = {} as ClimateTagLevel;
    dto.nutrition_tag_level = {} as NutritionTagLevel;
    dto.environmental_tag_level = {} as EnvironmentalTagLevel;
    dto.poverty_tag_level = {} as PovertyTagLevel;
    dto.is_this_an_innovation_result_type = {} as IsThisAnInnovationResultType;
    dto.core_innovation = {} as CoreInnovation;

    expect(dto.complementary_innovation).toBeUndefined();
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
