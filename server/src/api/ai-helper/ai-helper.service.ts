import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateAiHelperDto, CreateAiHelperIpsrDto } from './dto/create-ai-helper.dto';
import { UpdateAiHelperDto } from './dto/update-ai-helper.dto';
import { ResponseUtils } from '../../utils/response.utils';
import { AiHelperRepository } from './ai-helper.repository';
import { AiHelper } from './entities/ai-helper.entity';

@Injectable()
export class AiHelperService {
  private readonly _logger = new Logger(AiHelperService.name);

  constructor(private readonly _aiHelperRepository: AiHelperRepository) {}

  async create(createAiHelperDto: (CreateAiHelperDto | CreateAiHelperIpsrDto)[]) {
    try {
      for (const dto of createAiHelperDto) {
        // Detect if it's IPSR (has core_innovation) or Result (has innovation_readiness_level directly)
        const isIpsr = 'core_innovation' in dto;
        
        // Map innovation fields - from core_innovation if IPSR, or directly if Result
        const innovationReadinessLevel = isIpsr 
          ? (dto as CreateAiHelperIpsrDto).core_innovation?.innovation_readiness_level
          : (dto as CreateAiHelperDto).innovation_readiness_level;
        
        const innovationUseLevel = isIpsr
          ? (dto as CreateAiHelperIpsrDto).core_innovation?.innovation_use_level
          : (dto as CreateAiHelperDto).innovation_use_level;
        
        const innovationUseNumber = isIpsr
          ? (dto as CreateAiHelperIpsrDto).core_innovation?.innovation_use_number
          : (dto as CreateAiHelperDto).innovation_use_number;

        // Map complementary_innovation for IPSR
        const complementaryInnovation = isIpsr
          ? (dto as CreateAiHelperIpsrDto).complementary_innovation
            ? JSON.stringify((dto as CreateAiHelperIpsrDto).complementary_innovation)
            : null
          : null;

        const payload = {
          result_code: dto.result_code,
          phase_year: dto.phase_year,
          // Gender tag level
          gender_ai_prediction: dto.gender_tag_level.gender_ai_prediction,
          gender_ai_tag: dto.gender_tag_level.gender_ai_tag,
          gender_ai_component: dto.gender_tag_level.gender_ai_component || null,
          gender_ai_description: dto.gender_tag_level.gender_ai_description,
          gender_ai_matching: dto.gender_tag_level.gender_ai_matching,
          gender_ai_evidence_level: dto.gender_tag_level.gender_ai_evidence_level || null,
          // Climate tag level
          climate_ai_prediction: dto.climate_tag_level.climate_ai_prediction,
          climate_ai_tag: dto.climate_tag_level.climate_ai_tag,
          climate_ai_component: dto.climate_tag_level.climate_ai_component || null,
          climate_ai_description: dto.climate_tag_level.climate_ai_description,
          climate_ai_matching: dto.climate_tag_level.climate_ai_matching,
          climate_ai_evidence_level: dto.climate_tag_level.climate_ai_evidence_level || null,
          // Nutrition tag level
          nutrition_ai_prediction:
            dto.nutrition_tag_level.nutrition_ai_prediction,
          nutrition_ai_tag: dto.nutrition_tag_level.nutrition_ai_tag,
          nutrition_ai_component: dto.nutrition_tag_level.nutrition_ai_component || null,
          nutrition_ai_description:
            dto.nutrition_tag_level.nutrition_ai_description,
          nutrition_ai_matching: dto.nutrition_tag_level.nutrition_ai_matching,
          nutrition_ai_evidence_level: dto.nutrition_tag_level.nutrition_ai_evidence_level || null,
          // Environmental tag level
          environmental_ai_prediction:
            dto.environmental_tag_level.environmental_ai_prediction,
          environmental_ai_tag:
            dto.environmental_tag_level.environmental_ai_tag,
          environmental_ai_component: dto.environmental_tag_level.environmental_ai_component || null,
          environmental_ai_description:
            dto.environmental_tag_level.environmental_ai_description,
          environmental_ai_matching:
            dto.environmental_tag_level.environmental_ai_matching,
          environmental_ai_evidence_level: dto.environmental_tag_level.environmental_ai_evidence_level || null,
          // Poverty tag level
          poverty_ai_prediction: dto.poverty_tag_level.poverty_ai_prediction,
          poverty_ai_tag: dto.poverty_tag_level.poverty_ai_tag,
          poverty_ai_component: dto.poverty_tag_level.poverty_ai_component || null,
          poverty_ai_description: dto.poverty_tag_level.poverty_ai_description,
          poverty_ai_matching: dto.poverty_tag_level.poverty_ai_matching,
          poverty_ai_evidence_level: dto.poverty_tag_level.poverty_ai_evidence_level || null,
          // Is this an innovation result type
          is_this_an_innovation_ai_prediction:
            dto.is_this_an_innovation_result_type?.is_this_an_innovation_ai_prediction || null,
          is_this_an_innovation_ai_tag:
            dto.is_this_an_innovation_result_type?.is_this_an_innovation_ai_tag || null,
          is_this_an_innovation_ai_description:
            dto.is_this_an_innovation_result_type?.is_this_an_innovation_ai_description || null,
          is_this_an_innovation_ai_matching:
            dto.is_this_an_innovation_result_type?.is_this_an_innovation_ai_matching || null,
          is_this_an_innovation_ai_evidence_level:
            dto.is_this_an_innovation_result_type?.is_this_an_innovation_ai_evidence_level || null,
          // Innovation readiness level (mapped from core_innovation if IPSR)
          innovation_readiness_level_ai_prediction:
            innovationReadinessLevel?.innovation_readiness_level_ai_prediction || null,
          innovation_readiness_level_ai_tag:
            innovationReadinessLevel?.innovation_readiness_level_ai_tag || null,
          innovation_readiness_level_ai_description:
            innovationReadinessLevel?.innovation_readiness_level_ai_description || null,
          innovation_readiness_level_ai_matching:
            innovationReadinessLevel?.innovation_readiness_level_ai_matching || null,
          innovation_readiness_level_ai_evidence_level:
            innovationReadinessLevel?.innovation_readiness_level_ai_evidence_level || null,
          // Innovation use level (mapped from core_innovation if IPSR)
          innovation_use_level_ai_prediction:
            innovationUseLevel?.innovation_use_level_ai_prediction || null,
          innovation_use_level_ai_tag:
            innovationUseLevel?.innovation_use_level_ai_tag || null,
          innovation_use_level_ai_description:
            innovationUseLevel?.innovation_use_level_ai_description || null,
          innovation_use_level_ai_matching:
            innovationUseLevel?.innovation_use_level_ai_matching || null,
          innovation_use_level_ai_evidence_level:
            innovationUseLevel?.innovation_use_level_ai_evidence_level || null,
          // Innovation use number (mapped from core_innovation if IPSR)
          innovation_use_number_ai_tag:
            innovationUseNumber?.innovation_use_level_ai_tag
              ? JSON.stringify(innovationUseNumber.innovation_use_level_ai_tag)
              : null,
          innovation_use_number_ai_description:
            innovationUseNumber?.innovation_use_level_ai_description || null,
          innovation_use_number_ai_matching:
            innovationUseNumber?.innovation_use_level_ai_matching || null,
          innovation_use_number_ai_evidence_level:
            innovationUseNumber?.innovation_use_level_ai_evidence_level || null,
          // Complementary innovation (only for IPSR)
          complementary_innovation: complementaryInnovation,
          // Legacy innovation_readiness_tag_level (for backward compatibility - only for Results)
          innovation_ai_prediction:
            !isIpsr ? (dto as CreateAiHelperDto).innovation_readiness_tag_level?.innovation_ai_prediction || null : null,
          innovation_ai_tag:
            !isIpsr ? (dto as CreateAiHelperDto).innovation_readiness_tag_level?.innovation_ai_tag || null : null,
          innovation_ai_description:
            !isIpsr ? (dto as CreateAiHelperDto).innovation_readiness_tag_level?.innovation_ai_description || null : null,
          innovation_ai_matching:
            !isIpsr ? (dto as CreateAiHelperDto).innovation_readiness_tag_level?.innovation_ai_matching || null : null,
        };

        const result = await this._aiHelperRepository.findOne({
          where: { result_code: dto.result_code, phase_year: dto.phase_year },
        });

        if (result) {
          await this._aiHelperRepository.update(
            { result_code: dto.result_code, phase_year: dto.phase_year },
            payload,
          );
          this._logger.log(
            `Updated record for result_code=${dto.result_code} and phase_year=${dto.phase_year}`,
          );
        } else {
          await this._aiHelperRepository.insert(payload);
          this._logger.log(
            `Inserted new record for result_code=${dto.result_code} and phase_year=${dto.phase_year}`,
          );
        }
      }

      return ResponseUtils.format({
        data: 'Records have been inserted or updated successfully.',
        description: 'AI helper data inserted/updated successfully',
        status: HttpStatus.OK,
      });
    } catch (error) {
      this._logger.error('Error inserting AI helper data:', error);

      return ResponseUtils.format({
        data: {},
        description: 'Error inserting AI helper data',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}
