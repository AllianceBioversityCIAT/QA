import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { CreateAiHelperDto } from "./dto/create-ai-helper.dto";
import { UpdateAiHelperDto } from "./dto/update-ai-helper.dto";
import { ResponseUtils } from "../../utils/response.utils";
import { AiHelperRepository } from "./ai-helper.repository";
import { AiHelper } from "./entities/ai-helper.entity";

@Injectable()
export class AiHelperService {
  private readonly _logger = new Logger(AiHelperService.name);

  constructor(private readonly _aiHelperRepository: AiHelperRepository) {}

  async create(createAiHelperDto: CreateAiHelperDto[]) {
    try {
      for (const dto of createAiHelperDto) {
        const {
          gender_tag_level,
          climate_tag_level,
          nutrition_tag_level,
          environmental_tag_level,
          poverty_tag_level,
          innovation_readiness_tag_level,
        } = dto;

        await this._aiHelperRepository.upsert(
          {
            result_code: dto.result_code,
            phase_year: dto.phase_year,
            gender_ai_prediction: gender_tag_level.gender_ai_prediction,
            gender_ai_tag: gender_tag_level.gender_ai_tag,
            gender_ai_description: gender_tag_level.gender_ai_description,
            gender_ai_matching: gender_tag_level.gender_ai_matching,
            climate_ai_prediction: climate_tag_level.climate_ai_prediction,
            climate_ai_tag: climate_tag_level.climate_ai_tag,
            climate_ai_description: climate_tag_level.climate_ai_description,
            climate_ai_matching: climate_tag_level.climate_ai_matching,
            nutrition_ai_prediction:
              nutrition_tag_level.nutrition_ai_prediction,
            nutrition_ai_tag: nutrition_tag_level.nutrition_ai_tag,
            nutrition_ai_description:
              nutrition_tag_level.nutrition_ai_description,
            nutrition_ai_matching: nutrition_tag_level.nutrition_ai_matching,
            environmental_ai_prediction:
              environmental_tag_level.environmental_ai_prediction,
            environmental_ai_tag: environmental_tag_level.environmental_ai_tag,
            environmental_ai_description:
              environmental_tag_level.environmental_ai_description,
            environmental_ai_matching:
              environmental_tag_level.environmental_ai_matching,
            poverty_ai_prediction: poverty_tag_level.poverty_ai_prediction,
            poverty_ai_tag: poverty_tag_level.poverty_ai_tag,
            poverty_ai_description: poverty_tag_level.poverty_ai_description,
            poverty_ai_matching: poverty_tag_level.poverty_ai_matching,
            innovation_ai_prediction:
              innovation_readiness_tag_level?.innovation_ai_prediction || null,
            innovation_ai_tag:
              innovation_readiness_tag_level?.innovation_ai_tag || null,
            innovation_ai_description:
              innovation_readiness_tag_level?.innovation_ai_description || null,
            innovation_ai_matching:
              innovation_readiness_tag_level?.innovation_ai_matching || null,
          },
          {
            conflictPaths: ["result_code", "phase_year"], // Define las columnas que determinan el conflicto
          }
        );
      }

      return ResponseUtils.format({
        data: "Records have been inserted or updated successfully.",
        description: "AI helper data inserted/updated successfully",
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error("Error inserting AI helper data: ", error.message);

      return ResponseUtils.format({
        data: {},
        description: "Error inserting AI helper data",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
