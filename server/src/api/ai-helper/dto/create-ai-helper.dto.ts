export class GenderTagLevel {
  gender_ai_prediction: number;
  gender_ai_tag: string;
  gender_ai_description: string;
  gender_ai_matching: string;
}

export class ClimateTagLevel {
  climate_ai_prediction: number;
  climate_ai_tag: string;
  climate_ai_description: string;
  climate_ai_matching: string;
}

export class NutritionTagLevel {
  nutrition_ai_prediction: number;
  nutrition_ai_tag: string;
  nutrition_ai_description: string;
  nutrition_ai_matching: string;
}

export class EnvironmentalTagLevel {
  environmental_ai_prediction: number;
  environmental_ai_tag: string;
  environmental_ai_description: string;
  environmental_ai_matching: string;
}

export class PovertyTagLevel {
  poverty_ai_prediction: number;
  poverty_ai_tag: string;
  poverty_ai_description: string;
  poverty_ai_matching: string;
}

export class InnovationReadinessTagLevel {
  innovation_ai_prediction: number | null;
  innovation_ai_tag: string | null;
  innovation_ai_description: string | null;
  innovation_ai_matching: string | null;
}

export class CreateAiHelperDto {
  result_code: number;
  phase_year: number;
  gender_tag_level: GenderTagLevel;
  climate_tag_level: ClimateTagLevel;
  nutrition_tag_level: NutritionTagLevel;
  environmental_tag_level: EnvironmentalTagLevel;
  poverty_tag_level: PovertyTagLevel;
  innovation_readiness_tag_level?: InnovationReadinessTagLevel;
}
