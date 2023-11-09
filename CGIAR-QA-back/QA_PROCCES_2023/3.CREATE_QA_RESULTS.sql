-- VIEW TO FETCH THE MATERILIZED VIEW
-- POLICY CHANGE
CREATE
OR REPLACE VIEW qa_policy_change AS
SELECT
    qa_policy_change_data.id AS id,
    qa_policy_change_data.crp_id AS crp_id,
    qa_policy_change_data.phase_name AS phase_name,
    qa_policy_change_data.phase_year AS phase_year,
    qa_policy_change_data.included_AR AS included_AR,
    qa_policy_change_data.is_active AS is_active,
    qa_policy_change_data.submitted AS submitted,
    qa_policy_change_data.is_replicated AS is_replicated,
    qa_policy_change_data.result_code AS result_code,
    qa_policy_change_data.result_level AS result_level,
    qa_policy_change_data.result_type AS result_type,
    qa_policy_change_data.new_or_updated_result AS new_or_updated_result,
    qa_policy_change_data.title AS title,
    qa_policy_change_data.description AS description,
    qa_policy_change_data.gender_tag_level AS gender_tag_level,
    qa_policy_change_data.climate_change_level AS climate_change_level,
    qa_policy_change_data.nutrition_tag_level AS nutrition_tag_level,
    qa_policy_change_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_policy_change_data.poverty_tag_level AS poverty_tag_level,
    qa_policy_change_data.evidence AS evidence,
    qa_policy_change_data.actors AS actors,
    qa_policy_change_data.contributing_initiatives AS contributing_initiatives,
    qa_policy_change_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_policy_change_data.contributing_centers AS contributing_centers,
    qa_policy_change_data.toc_planned AS toc_planned,
    qa_policy_change_data.action_area AS action_area,
    qa_policy_change_data.impact_area_targets AS impact_area_targets,
    qa_policy_change_data.sdg AS sdg,
    qa_policy_change_data.partners AS partners,
    qa_policy_change_data.geographic_focus AS geographic_focus,
    qa_policy_change_data.regions AS regions,
    qa_policy_change_data.countries AS countries,
    qa_policy_change_data.linked_results AS linked_results,
    qa_policy_change_data.previous_portfolio AS previous_portfolio,
    qa_policy_change_data.policy_type AS policy_type,
    qa_policy_change_data.usd_amount AS usd_amount,
    qa_policy_change_data.status AS status,
    qa_policy_change_data.result_related AS result_related,
    qa_policy_change_data.stage AS stage,
    qa_policy_change_data.implementing_organizations AS implementing_organizations
FROM
    qadbtest.qa_policy_change_data
WHERE
    qa_policy_change_data.phase_year = 2023;

-- INNOVATION USE
CREATE
OR REPLACE VIEW qa_innovation_use AS
SELECT
    qa_innovation_use_data.crp_id AS crp_id,
    qa_innovation_use_data.phase_name AS phase_name,
    qa_innovation_use_data.phase_year AS phase_year,
    qa_innovation_use_data.included_AR AS included_AR,
    qa_innovation_use_data.is_active AS is_active,
    qa_innovation_use_data.id AS id,
    qa_innovation_use_data.result_code AS result_code,
    qa_innovation_use_data.result_level AS result_level,
    qa_innovation_use_data.result_type AS result_type,
    qa_innovation_use_data.title AS title,
    qa_innovation_use_data.description AS description,
    qa_innovation_use_data.toc_planned AS toc_planned,
    qa_innovation_use_data.geographic_focus AS geographic_focus,
    qa_innovation_use_data.regions AS regions,
    qa_innovation_use_data.countries AS countries,
    qa_innovation_use_data.actors AS actors,
    qa_innovation_use_data.contributing_centers AS contributing_centers,
    qa_innovation_use_data.partners AS partners,
    qa_innovation_use_data.contributing_initiatives AS contributing_initiatives,
    qa_innovation_use_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_innovation_use_data.new_or_updated_result AS new_or_updated_result,
    qa_innovation_use_data.linked_results AS linked_results,
    qa_innovation_use_data.previous_portfolio AS previous_portfolio,
    qa_innovation_use_data.gender_tag_level AS gender_tag_level,
    qa_innovation_use_data.climate_change_level AS climate_change_level,
    qa_innovation_use_data.evidence AS evidence,
    qa_innovation_use_data.climate_related_evidence AS climate_related_evidence,
    qa_innovation_use_data.gender_related_evidence AS gender_related_evidence,
    qa_innovation_use_data.supplementary_related_evidence AS supplementary_related_evidence,
    qa_innovation_use_data.male_using AS male_using,
    qa_innovation_use_data.female_using AS female_using,
    qa_innovation_use_data.other_quantitative_measure AS other_quantitative_measure
FROM
    qadbtest.qa_innovation_use_data
WHERE
    qa_innovation_use_data.phase_year = 2023;

-- OTHER OUTCOME
CREATE
OR REPLACE VIEW qa_other_outcome AS
SELECT
    qa_other_outcome_data.crp_id AS crp_id,
    qa_other_outcome_data.phase_name AS phase_name,
    qa_other_outcome_data.phase_year AS phase_year,
    qa_other_outcome_data.included_AR AS included_AR,
    qa_other_outcome_data.is_active AS is_active,
    qa_other_outcome_data.id AS id,
    qa_other_outcome_data.result_level AS result_level,
    qa_other_outcome_data.result_type AS result_type,
    qa_other_outcome_data.title AS title,
    qa_other_outcome_data.description AS description,
    qa_other_outcome_data.toc_planned AS toc_planned,
    qa_other_outcome_data.geographic_focus AS geographic_focus,
    qa_other_outcome_data.regions AS regions,
    qa_other_outcome_data.countries AS countries,
    qa_other_outcome_data.actors AS actors,
    qa_other_outcome_data.contributing_centers AS contributing_centers,
    qa_other_outcome_data.partners AS partners,
    qa_other_outcome_data.contributing_initiatives AS contributing_initiatives,
    qa_other_outcome_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_other_outcome_data.new_or_updated_result AS new_or_updated_result,
    qa_other_outcome_data.linked_results AS linked_results,
    qa_other_outcome_data.previous_portfolio AS previous_portfolio,
    qa_other_outcome_data.gender_tag_level AS gender_tag_level,
    qa_other_outcome_data.climate_change_level AS climate_change_level,
    qa_other_outcome_data.result_code AS result_code,
    qa_other_outcome_data.submitted AS submitted,
    qa_other_outcome_data.is_replicated AS is_replicated,
    qa_other_outcome_data.action_area AS action_area,
    qa_other_outcome_data.impact_area_targets AS impact_area_targets,
    qa_other_outcome_data.evidence AS evidence,
    qa_other_outcome_data.sdg AS sdg,
    qa_other_outcome_data.nutrition_tag_level AS nutrition_tag_level,
    qa_other_outcome_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_other_outcome_data.poverty_tag_level AS poverty_tag_level
FROM
    qadbtest.qa_other_outcome_data
WHERE
    qa_other_outcome_data.phase_year = 2023;

-- CAP SHARING
CREATE
OR REPLACE VIEW qa_capdev AS
SELECT
    qa_capdev_data.crp_id AS crp_id,
    qa_capdev_data.phase_name AS phase_name,
    qa_capdev_data.phase_year AS phase_year,
    qa_capdev_data.included_AR AS included_AR,
    qa_capdev_data.is_active AS is_active,
    qa_capdev_data.id AS id,
    qa_capdev_data.result_code AS result_code,
    qa_capdev_data.result_level AS result_level,
    qa_capdev_data.result_type AS result_type,
    qa_capdev_data.title AS title,
    qa_capdev_data.description AS description,
    qa_capdev_data.toc_planned AS toc_planned,
    qa_capdev_data.geographic_focus AS geographic_focus,
    qa_capdev_data.regions AS regions,
    qa_capdev_data.countries AS countries,
    qa_capdev_data.actors AS actors,
    qa_capdev_data.contributing_centers AS contributing_centers,
    qa_capdev_data.partners AS partners,
    qa_capdev_data.contributing_initiatives AS contributing_initiatives,
    qa_capdev_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_capdev_data.new_or_updated_result AS new_or_updated_result,
    qa_capdev_data.linked_results AS linked_results,
    qa_capdev_data.previous_portfolio AS previous_portfolio,
    qa_capdev_data.gender_tag_level AS gender_tag_level,
    qa_capdev_data.climate_change_level AS climate_change_level,
    qa_capdev_data.nutrition_tag_level AS nutrition_tag_level,
    qa_capdev_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_capdev_data.poverty_tag_level AS poverty_tag_level,
    qa_capdev_data.evidence AS evidence,
    qa_capdev_data.climate_related_evidence AS climate_related_evidence,
    qa_capdev_data.gender_related_evidence AS gender_related_evidence,
    qa_capdev_data.supplementary_related_evidence AS supplementary_related_evidence,
    qa_capdev_data.male_using AS male_using,
    qa_capdev_data.female_using AS female_using,
    qa_capdev_data.long_term_short_term AS long_term_short_term,
    qa_capdev_data.phd_master AS phd_master,
    qa_capdev_data.capdev_delivery_method AS capdev_delivery_method,
    qa_capdev_data.trainees_attending_on_behalf_of_an_organization AS trainees_attending_on_behalf_of_an_organization,
    qa_capdev_data.submitted AS submitted,
    qa_capdev_data.is_replicated AS is_replicated,
    qa_capdev_data.action_area AS action_area,
    qa_capdev_data.impact_area_targets AS impact_area_targets,
    qa_capdev_data.sdg AS sdg,
    qa_capdev_data.number_of_people_trained AS number_of_people_trained
FROM
    qadbtest.qa_capdev_data
WHERE
    qa_capdev_data.phase_year = 2023;

-- CAP SHARING
CREATE
OR REPLACE VIEW qa_innovation_development AS
SELECT
    qa_innovation_development_data.crp_id AS crp_id,
    qa_innovation_development_data.phase_name AS phase_name,
    qa_innovation_development_data.phase_year AS phase_year,
    qa_innovation_development_data.included_AR AS included_AR,
    qa_innovation_development_data.is_active AS is_active,
    qa_innovation_development_data.id AS id,
    qa_innovation_development_data.result_level AS result_level,
    qa_innovation_development_data.result_type AS result_type,
    qa_innovation_development_data.title AS title,
    qa_innovation_development_data.description AS description,
    qa_innovation_development_data.toc_planned AS toc_planned,
    qa_innovation_development_data.geographic_focus AS geographic_focus,
    qa_innovation_development_data.regions AS regions,
    qa_innovation_development_data.countries AS countries,
    qa_innovation_development_data.contributing_centers AS contributing_centers,
    qa_innovation_development_data.partners AS partners,
    qa_innovation_development_data.contributing_initiatives AS contributing_initiatives,
    qa_innovation_development_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_innovation_development_data.new_or_updated_result AS new_or_updated_result,
    qa_innovation_development_data.linked_results AS linked_results,
    qa_innovation_development_data.previous_portfolio AS previous_portfolio,
    qa_innovation_development_data.gender_tag_level AS gender_tag_level,
    qa_innovation_development_data.climate_change_level AS climate_change_level,
    qa_innovation_development_data.short_title AS short_title,
    qa_innovation_development_data.typology AS typology,
    qa_innovation_development_data.is_new_varieties AS is_new_varieties,
    qa_innovation_development_data.number_of_variety AS number_of_variety,
    qa_innovation_development_data.innovation_developers AS innovation_developers,
    qa_innovation_development_data.innovation_collaborators AS innovation_collaborators,
    qa_innovation_development_data.innovation_acknowledgement AS innovation_acknowledgement,
    qa_innovation_development_data.innovation_characterization AS innovation_characterization,
    qa_innovation_development_data.innovation_readiness_level AS innovation_readiness_level,
    qa_innovation_development_data.innovation_readiness_level_justification AS innovation_readiness_level_justification,
    qa_innovation_development_data.result_code AS result_code,
    qa_innovation_development_data.evidence AS evidence,
    qa_innovation_development_data.submitted AS submitted,
    qa_innovation_development_data.is_replicated AS is_replicated,
    qa_innovation_development_data.action_area AS action_area,
    qa_innovation_development_data.impact_area_targets AS impact_area_targets,
    qa_innovation_development_data.sdg AS sdg,
    qa_innovation_development_data.nutrition_tag_level AS nutrition_tag_level,
    qa_innovation_development_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_innovation_development_data.poverty_tag_level AS poverty_tag_level,
    qa_innovation_development_data.questions AS questions,
    qa_innovation_development_data.initiatives_investment AS initiatives_investment,
    qa_innovation_development_data.npp_investment AS npp_investment,
    qa_innovation_development_data.partner_investment AS partner_investment,
    qa_innovation_development_data.pictures AS pictures,
    qa_innovation_development_data.materials AS materials
FROM
    qadbtest.qa_innovation_development_data
WHERE
    qa_innovation_development_data.phase_year = 2023;

-- OTHER OUTPUT
CREATE
OR REPLACE VIEW qa_other_output AS
SELECT
    qa_other_output_data.crp_id AS crp_id,
    qa_other_output_data.phase_name AS phase_name,
    qa_other_output_data.phase_year AS phase_year,
    qa_other_output_data.included_AR AS included_AR,
    qa_other_output_data.is_active AS is_active,
    qa_other_output_data.id AS id,
    qa_other_output_data.result_level AS result_level,
    qa_other_output_data.result_type AS result_type,
    qa_other_output_data.title AS title,
    qa_other_output_data.description AS description,
    qa_other_output_data.toc_planned AS toc_planned,
    qa_other_output_data.geographic_focus AS geographic_focus,
    qa_other_output_data.regions AS regions,
    qa_other_output_data.countries AS countries,
    qa_other_output_data.contributing_centers AS contributing_centers,
    qa_other_output_data.partners AS partners,
    qa_other_output_data.contributing_initiatives AS contributing_initiatives,
    qa_other_output_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_other_output_data.new_or_updated_result AS new_or_updated_result,
    qa_other_output_data.linked_results AS linked_results,
    qa_other_output_data.previous_portfolio AS previous_portfolio,
    qa_other_output_data.gender_tag_level AS gender_tag_level,
    qa_other_output_data.climate_change_level AS climate_change_level,
    qa_other_output_data.result_code AS result_code,
    qa_other_output_data.submitted AS submitted,
    qa_other_output_data.is_replicated AS is_replicated,
    qa_other_output_data.action_area AS action_area,
    qa_other_output_data.impact_area_targets AS impact_area_targets,
    qa_other_output_data.sdg AS sdg,
    qa_other_output_data.evidence AS evidence,
    qa_other_output_data.nutrition_tag_level AS nutrition_tag_level,
    qa_other_output_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_other_output_data.poverty_tag_level AS poverty_tag_level
FROM
    qadbtest.qa_other_output_data
WHERE
    qa_other_output_data.phase_year = 2023;

-- IMPACT CONTRIBUTION
CREATE
OR REPLACE VIEW qa_impact_contribution AS
SELECT
    qa_impact_contribution_data.crp_id AS crp_id,
    qa_impact_contribution_data.phase_name AS phase_name,
    qa_impact_contribution_data.phase_year AS phase_year,
    qa_impact_contribution_data.included_AR AS included_AR,
    qa_impact_contribution_data.is_active AS is_active,
    qa_impact_contribution_data.id AS id,
    qa_impact_contribution_data.result_level AS result_level,
    qa_impact_contribution_data.result_type AS result_type,
    qa_impact_contribution_data.title AS title,
    qa_impact_contribution_data.description AS description,
    qa_impact_contribution_data.toc_planned AS toc_planned,
    qa_impact_contribution_data.geographic_focus AS geographic_focus,
    qa_impact_contribution_data.regions AS regions,
    qa_impact_contribution_data.countries AS countries,
    qa_impact_contribution_data.actors AS actors,
    qa_impact_contribution_data.contributing_centers AS contributing_centers,
    qa_impact_contribution_data.partners AS partners,
    qa_impact_contribution_data.contributing_initiatives AS contributing_initiatives,
    qa_impact_contribution_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_impact_contribution_data.new_or_updated_result AS new_or_updated_result,
    qa_impact_contribution_data.linked_results AS linked_results,
    qa_impact_contribution_data.previous_portfolio AS previous_portfolio,
    qa_impact_contribution_data.gender_tag_level AS gender_tag_level,
    qa_impact_contribution_data.climate_change_level AS climate_change_level,
    qa_impact_contribution_data.evidence AS evidence,
    qa_impact_contribution_data.climate_related_evidence AS climate_related_evidence,
    qa_impact_contribution_data.gender_related_evidence AS gender_related_evidence,
    qa_impact_contribution_data.supplementary_related_evidence AS supplementary_related_evidence,
    qa_impact_contribution_data.result_code AS result_code,
    qa_impact_contribution_data.submitted AS submitted,
    qa_impact_contribution_data.is_replicated AS is_replicated,
    qa_impact_contribution_data.action_area AS action_area,
    qa_impact_contribution_data.impact_area_targets AS impact_area_targets,
    qa_impact_contribution_data.sdg AS sdg,
    qa_impact_contribution_data.nutrition_tag_level AS nutrition_tag_level,
    qa_impact_contribution_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_impact_contribution_data.poverty_tag_level AS poverty_tag_level
FROM
    qadbtest.qa_impact_contribution_data
WHERE
    qa_impact_contribution_data.phase_year = 2023;

-- KNOWLEDGE PRODUCT
CREATE
OR REPLACE VIEW qa_knowledge_product AS
SELECT
    qa_knowledge_product_data.crp_id AS crp_id,
    qa_knowledge_product_data.phase_name AS phase_name,
    qa_knowledge_product_data.phase_year AS phase_year,
    qa_knowledge_product_data.included_AR AS included_AR,
    qa_knowledge_product_data.is_active AS is_active,
    qa_knowledge_product_data.id AS id,
    qa_knowledge_product_data.result_level AS result_level,
    qa_knowledge_product_data.result_type AS result_type,
    qa_knowledge_product_data.title AS title,
    qa_knowledge_product_data.description AS description,
    qa_knowledge_product_data.toc_planned AS toc_planned,
    qa_knowledge_product_data.regions AS regions,
    qa_knowledge_product_data.countries AS countries,
    qa_knowledge_product_data.contributing_centers AS contributing_centers,
    qa_knowledge_product_data.partners AS partners,
    qa_knowledge_product_data.evidence AS evidence,
    qa_knowledge_product_data.contributing_initiatives AS contributing_initiatives,
    qa_knowledge_product_data.contributing_non_pooled_project AS contributing_non_pooled_project,
    qa_knowledge_product_data.new_or_updated_result AS new_or_updated_result,
    qa_knowledge_product_data.linked_results AS linked_results,
    qa_knowledge_product_data.previous_portfolio AS previous_portfolio,
    qa_knowledge_product_data.gender_tag_level AS gender_tag_level,
    qa_knowledge_product_data.climate_change_level AS climate_change_level,
    qa_knowledge_product_data.is_melia AS is_melia,
    qa_knowledge_product_data.melia_previous_submitted AS melia_previous_submitted,
    qa_knowledge_product_data.handle AS handle,
    qa_knowledge_product_data.issue_date AS issue_date,
    qa_knowledge_product_data.authors AS authors,
    qa_knowledge_product_data.knowledge_product_type AS knowledge_product_type,
    qa_knowledge_product_data.peer_reviewed AS peer_reviewed,
    qa_knowledge_product_data.wos_isi AS wos_isi,
    qa_knowledge_product_data.accesibility AS accesibility,
    qa_knowledge_product_data.license AS license,
    qa_knowledge_product_data.keywords AS keywords,
    qa_knowledge_product_data.altmetrics AS altmetrics,
    qa_knowledge_product_data.findable AS findable,
    qa_knowledge_product_data.accesible AS accesible,
    qa_knowledge_product_data.interoperable AS interoperable,
    qa_knowledge_product_data.reusable AS reusable,
    qa_knowledge_product_data.result_code AS result_code,
    qa_knowledge_product_data.geographic_focus AS geographic_focus,
    qa_knowledge_product_data.submitted AS submitted,
    qa_knowledge_product_data.is_replicated AS is_replicated,
    qa_knowledge_product_data.action_area AS action_area,
    qa_knowledge_product_data.impact_area_targets AS impact_area_targets,
    qa_knowledge_product_data.sdg AS sdg,
    qa_knowledge_product_data.nutrition_tag_level AS nutrition_tag_level,
    qa_knowledge_product_data.environmental_biodiversity_tag_level AS environmental_biodiversity_tag_level,
    qa_knowledge_product_data.poverty_tag_level AS poverty_tag_level,
    qa_knowledge_product_data.online_date AS online_date
FROM
    qadbtest.qa_knowledge_product_data
WHERE
    qa_knowledge_product_data.phase_year = 2023;