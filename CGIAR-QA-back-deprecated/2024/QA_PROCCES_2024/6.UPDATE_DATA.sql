SET
    SQL_SAFE_UPDATES = 0;

SET
    SESSION group_concat_max_len = 2000000;

-- POLICY CHANGE
UPDATE
    qa_policy_change_data qa
    JOIN qa_policy_change_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.policy_type = cc.policy_type,
    qa.usd_amount = cc.usd_amount,
    qa.status = cc.status,
    qa.stage = cc.stage,
    qa.implementing_organizations = cc.implementing_organizations,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.result_related = cc.result_related,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- INNO USE
UPDATE
    qa_innovation_use_data qa
    JOIN qa_innovation_use_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.actors = cc.actors,
    qa.organizations = cc.organizations,
    qa.other_quantitative = cc.other_quantitative
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- CAP DEV
UPDATE
    qa_capdev_data qa
    JOIN qa_capdev_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_code = cc.result_code,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.long_term_short_term = cc.long_term_short_term,
    qa.capdev_delivery_method = cc.capdev_delivery_method,
    qa.trainees_attending_on_behalf_of_an_organization = cc.trainees_attending_on_behalf_of_an_organization,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.number_of_people_trained = cc.number_of_people_trained,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- INNO DEV
UPDATE
    qa_innovation_development_data qa
    JOIN qa_innovation_development_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.short_title = cc.short_title,
    qa.typology = cc.typology,
    qa.number_of_variety = cc.number_of_variety,
    qa.innovation_developers = cc.innovation_developers,
    qa.innovation_collaborators = cc.innovation_collaborators,
    qa.innovation_acknowledgement = cc.innovation_acknowledgement,
    qa.innovation_characterization = cc.innovation_characterization,
    qa.innovation_readiness_level = cc.innovation_readiness_level,
    qa.innovation_readiness_level_justification = cc.innovation_readiness_level_justification,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.questions = cc.questions,
    qa.anticipated = cc.anticipated,
    qa.initiatives_investment = cc.initiatives_investment,
    qa.npp_investment = cc.npp_investment,
    qa.partner_investment = cc.partner_investment,
    qa.pictures = cc.pictures,
    qa.materials = cc.materials,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- OTHER OUTPUT
UPDATE
    qa_other_output_data qa
    JOIN qa_other_output_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- OTHER OUTCOME
UPDATE
    qa_other_outcome_data qa
    JOIN qa_other_outcome_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- IMPACT CONTRIBUTION
UPDATE
    qa_impact_contribution_data qa
    JOIN qa_impact_contribution_view cc ON qa.id = cc.id
SET
    qa.crp_id = cc.crp_id,
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.version = cc.version,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.toc_planned = cc.toc_planned,
    qa.geographic_focus = cc.geographic_focus,
    qa.regions = cc.regions,
    qa.countries = cc.countries,
    qa.contributing_centers = cc.contributing_centers,
    qa.partners = cc.partners,
    qa.contributing_initiatives = cc.contributing_initiatives,
    qa.contributing_non_pooled_project = cc.contributing_non_pooled_project,
    qa.new_or_updated_result = cc.new_or_updated_result,
    qa.linked_results = cc.linked_results,
    qa.previous_portfolio = cc.previous_portfolio,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_level = cc.climate_change_level,
    qa.result_code = cc.result_code,
    qa.submitted = cc.submitted,
    qa.is_replicated = cc.is_replicated,
    qa.action_area = cc.action_area,
    qa.impact_area_targets = cc.impact_area_targets,
    qa.sdg = cc.sdg,
    qa.nutrition_tag_level = cc.nutrition_tag_level,
    qa.environmental_biodiversity_tag_level = cc.environmental_biodiversity_tag_level,
    qa.poverty_tag_level = cc.poverty_tag_level,
    qa.evidence = cc.evidence
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;

-- KNOWLEDGE PRODUCT
UPDATE
    qa_knowledge_product_data d
    JOIN qa_knowledge_product_view v ON d.id = v.id
SET
    d.crp_id = v.crp_id,
    d.phase_name = v.phase_name,
    d.phase_year = v.phase_year,
    d.included_AR = v.included_AR,
    d.is_active = v.is_active,
    d.result_level = v.result_level,
    d.result_type = v.result_type,
    d.version = v.version,
    d.title = v.title,
    d.description = v.description,
    d.toc_planned = v.toc_planned,
    d.regions = v.regions,
    d.countries = v.countries,
    d.contributing_centers = v.contributing_centers,
    d.partners = v.partners,
    d.contributing_initiatives = v.contributing_initiatives,
    d.contributing_non_pooled_project = v.contributing_non_pooled_project,
    d.new_or_updated_result = v.new_or_updated_result,
    d.linked_results = v.linked_results,
    d.previous_portfolio = v.previous_portfolio,
    d.gender_tag_level = v.gender_tag_level,
    d.climate_change_level = v.climate_change_level,
    d.evidence = v.evidence,
    d.is_melia = v.is_melia,
    d.melia_previous_submitted = v.melia_previous_submitted,
    d.handle = v.handle,
    d.issue_date = v.issue_date,
    d.authors = v.authors,
    d.knowledge_product_type = v.knowledge_product_type,
    d.peer_reviewed = v.peer_reviewed,
    d.wos_isi = v.wos_isi,
    d.accesibility = v.accesibility,
    d.license = v.license,
    d.keywords = v.keywords,
    d.altmetrics = v.altmetrics,
    d.findable = v.findable,
    d.accesible = v.accesible,
    d.interoperable = v.interoperable,
    d.reusable = v.reusable,
    d.result_code = v.result_code,
    d.geographic_focus = v.geographic_focus,
    d.submitted = v.submitted,
    d.is_replicated = v.is_replicated,
    d.action_area = v.action_area,
    d.impact_area_targets = v.impact_area_targets,
    d.sdg = v.sdg,
    d.nutrition_tag_level = v.nutrition_tag_level,
    d.environmental_biodiversity_tag_level = v.environmental_biodiversity_tag_level,
    d.poverty_tag_level = v.poverty_tag_level,
    d.online_date = v.online_date
WHERE
    v.phase_year = 2024
    AND v.in_qa = 1;

-- IPSR
UPDATE
    qa_innovation_use_ipsr_data qa
    JOIN qa_innovation_use_ipsr_view cc ON qa.id = cc.id
SET
    qa.phase_name = cc.phase_name,
    qa.phase_year = cc.phase_year,
    qa.included_AR = cc.included_AR,
    qa.is_active = cc.is_active,
    qa.crp_id = cc.crp_id,
    qa.result_code = cc.result_code,
    qa.result_level = cc.result_level,
    qa.result_type = cc.result_type,
    qa.lead_initiative = cc.lead_initiative,
    qa.core_innovation = cc.core_innovation,
    qa.geo_scope = cc.geo_scope,
    qa.geo_focus = cc.geo_focus,
    qa.reported_year = cc.reported_year,
    qa.title = cc.title,
    qa.description = cc.description,
    qa.gender_tag_level = cc.gender_tag_level,
    qa.climate_change_tag_level = cc.climate_change_tag_level,
    qa.is_krs = cc.is_krs,
    qa.lead_initiative_toc = cc.lead_initiative_toc,
    qa.contributing_initiative = cc.contributing_initiative,
    qa.contributing_npp = cc.contributing_npp,
    qa.partners = cc.partners,
    qa.contributing_centers = cc.contributing_centers,
    qa.eoi_outcomes = cc.eoi_outcomes,
    qa.aa_outcomes = cc.aa_outcomes,
    qa.ia_outcomes = cc.ia_outcomes,
    qa.sdgs = cc.sdgs,
    qa.actors = cc.actors,
    qa.organizations = cc.organizations,
    qa.other_quantity = cc.other_quantity,
    qa.specify_scaling_partners = cc.specify_scaling_partners,
    qa.existing_complementary_innovation = cc.existing_complementary_innovation,
    qa.new_complementary_innovation = cc.new_complementary_innovation,
    qa.workshop_list_of_participants = cc.workshop_list_of_participants,
    qa.what_was_assessed_during_the_workshop = cc.what_was_assessed_during_the_workshop,
    qa.core_innovation_evidence_based_assessment = cc.core_innovation_evidence_based_assessment,
    qa.complementary_innovation_evidence_based_assessment = cc.complementary_innovation_evidence_based_assessment,
    qa.core_innovation_actors = cc.core_innovation_actors,
    qa.core_innovation_organizations = cc.core_innovation_organizations,
    qa.core_innovation_measures = cc.core_innovation_measures,
    qa.linked_result = cc.linked_result,
    qa.results_from_previous_portfolio = cc.results_from_previous_portfolio
WHERE
    qa.phase_year = 2024
    AND cc.in_qa = 1;