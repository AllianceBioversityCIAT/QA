export class GenderTagLevel {
  gender_ai_prediction: number;
  gender_ai_tag: string;
  gender_ai_component: string | null;
  gender_ai_description: string;
  gender_ai_matching: string;
  gender_ai_evidence_level: string;
}

export class ClimateTagLevel {
  climate_ai_prediction: number;
  climate_ai_tag: string;
  climate_ai_component: string | null;
  climate_ai_description: string;
  climate_ai_matching: string;
  climate_ai_evidence_level: string;
}

export class NutritionTagLevel {
  nutrition_ai_prediction: number;
  nutrition_ai_tag: string;
  nutrition_ai_component: string | null;
  nutrition_ai_description: string;
  nutrition_ai_matching: string;
  nutrition_ai_evidence_level: string;
}

export class EnvironmentalTagLevel {
  environmental_ai_prediction: number;
  environmental_ai_tag: string;
  environmental_ai_component: string | null;
  environmental_ai_description: string;
  environmental_ai_matching: string;
  environmental_ai_evidence_level: string;
}

export class PovertyTagLevel {
  poverty_ai_prediction: number;
  poverty_ai_tag: string;
  poverty_ai_component: string | null;
  poverty_ai_description: string;
  poverty_ai_matching: string;
  poverty_ai_evidence_level: string;
}

export class IsThisAnInnovationResultType {
  is_this_an_innovation_ai_prediction: number | null;
  is_this_an_innovation_ai_tag: string | null;
  is_this_an_innovation_ai_description: string | null;
  is_this_an_innovation_ai_matching: string | null;
  is_this_an_innovation_ai_evidence_level: string | null;
}

export class InnovationReadinessLevel {
  innovation_readiness_level_ai_prediction: number | null;
  innovation_readiness_level_ai_tag: string | null;
  innovation_readiness_level_ai_description: string | null;
  innovation_readiness_level_ai_matching: string | null;
  innovation_readiness_level_ai_evidence_level: string | null;
}

export class InnovationUseLevel {
  innovation_use_level_ai_prediction: number | null;
  innovation_use_level_ai_tag: string | null;
  innovation_use_level_ai_description: string | null;
  innovation_use_level_ai_matching: string | null;
  innovation_use_level_ai_evidence_level: string | null;
}

export interface InnovationUseNumberUser {
  user: string;
  user_type: string;
  user_subtype: string | null;
  quantity: number;
  women: number | null;
  youth_women: number | null;
  non_youth_women: number | null;
  men: number | null;
  youth_men: number | null;
  non_youth_men: number | null;
}

export class InnovationUseNumber {
  innovation_use_level_ai_prediction: number | null;
  innovation_use_level_ai_tag: InnovationUseNumberUser[];
  innovation_use_level_ai_description: string | null;
  innovation_use_level_ai_matching: string | null;
  innovation_use_level_ai_evidence_level: string | null;
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
  is_this_an_innovation_result_type: IsThisAnInnovationResultType;
  innovation_readiness_level: InnovationReadinessLevel;
  innovation_use_level: InnovationUseLevel;
  innovation_use_number: InnovationUseNumber;
  innovation_readiness_tag_level?: InnovationReadinessTagLevel;
}

// DTOs for IPSR
export class CoreInnovation {
  innovation_readiness_level: InnovationReadinessLevel;
  innovation_use_level: InnovationUseLevel;
  innovation_use_number: InnovationUseNumber;
}

export class ComplementaryInnovation {
  complementary_innovation_result_code: number;
  innovation_readiness_level: InnovationReadinessLevel;
  innovation_use_level: InnovationUseLevel;
}

export class CreateAiHelperIpsrDto {
  result_code: number; // Note: In JSON it's called "ipsr_code" but it's the same as result_code
  phase_year: number;
  gender_tag_level: GenderTagLevel;
  climate_tag_level: ClimateTagLevel;
  nutrition_tag_level: NutritionTagLevel;
  environmental_tag_level: EnvironmentalTagLevel;
  poverty_tag_level: PovertyTagLevel;
  is_this_an_innovation_result_type: IsThisAnInnovationResultType;
  core_innovation: CoreInnovation;
  complementary_innovation?: ComplementaryInnovation[];
}
