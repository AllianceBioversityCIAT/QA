-- CAPDEV Data Comparison Query
SELECT
    d.id AS data_id,
    di.id AS initial_data_id,
    d.crp_id AS data_crp_id,
    di.crp_id AS initial_crp_id,
    CASE
        WHEN d.crp_id != di.crp_id THEN 'Changed'
        ELSE 'No change'
    END AS crp_id,
    d.phase_name AS data_phase_name,
    di.phase_name AS initial_phase_name,
    CASE
        WHEN d.phase_name != di.phase_name THEN 'Changed'
        ELSE 'No change'
    END AS phase_name_change,
    d.phase_year AS data_phase_year,
    di.phase_year AS initial_phase_year,
    CASE
        WHEN d.phase_year != di.phase_year THEN 'Changed'
        ELSE 'No change'
    END AS phase_year_change,
    d.included_AR AS data_included_AR,
    di.included_AR AS initial_included_AR,
    CASE
        WHEN d.included_AR != di.included_AR THEN 'Changed'
        ELSE 'No change'
    END AS included_AR_change,
    d.is_active AS data_is_active,
    di.is_active AS initial_is_active,
    CASE
        WHEN d.is_active != di.is_active THEN 'Changed'
        ELSE 'No change'
    END AS is_active_change,
    d.version AS data_version,
    di.version AS initial_version,
    CASE
        WHEN d.version != di.version THEN 'Changed'
        ELSE 'No change'
    END AS version_change,
    d.result_level AS data_result_level,
    di.result_level AS initial_result_level,
    CASE
        WHEN d.result_level != di.result_level THEN 'Changed'
        ELSE 'No change'
    END AS result_level_change,
    d.result_type AS data_result_type,
    di.result_type AS initial_result_type,
    CASE
        WHEN d.result_type != di.result_type THEN 'Changed'
        ELSE 'No change'
    END AS result_type_change,
    d.title AS data_title,
    di.title AS initial_title,
    CASE
        WHEN d.title != di.title THEN 'Changed'
        ELSE 'No change'
    END AS title_change,
    d.description AS data_description,
    di.description AS initial_description,
    CASE
        WHEN d.description != di.description THEN 'Changed'
        ELSE 'No change'
    END AS description_change,
    d.toc_planned AS data_toc_planned,
    di.toc_planned AS initial_toc_planned,
    CASE
        WHEN d.toc_planned != di.toc_planned THEN 'Changed'
        ELSE 'No change'
    END AS toc_planned_change,
    d.geographic_focus AS data_geographic_focus,
    di.geographic_focus AS initial_geographic_focus,
    CASE
        WHEN d.geographic_focus != di.geographic_focus THEN 'Changed'
        ELSE 'No change'
    END AS geographic_focus_change,
    d.regions AS data_regions,
    di.regions AS initial_regions,
    CASE
        WHEN d.regions != di.regions THEN 'Changed'
        ELSE 'No change'
    END AS regions_change,
    d.countries AS data_countries,
    di.countries AS initial_countries,
    CASE
        WHEN d.countries != di.countries THEN 'Changed'
        ELSE 'No change'
    END AS countries_change,
    d.actors AS data_actors,
    di.actors AS initial_actors,
    CASE
        WHEN d.actors != di.actors THEN 'Changed'
        ELSE 'No change'
    END AS actors_change,
    d.contributing_centers AS data_contributing_centers,
    di.contributing_centers AS initial_contributing_centers,
    CASE
        WHEN d.contributing_centers != di.contributing_centers THEN 'Changed'
        ELSE 'No change'
    END AS contributing_centers_change,
    d.partners AS data_partners,
    di.partners AS initial_partners,
    CASE
        WHEN d.partners != di.partners THEN 'Changed'
        ELSE 'No change'
    END AS partners_change,
    d.contributing_initiatives AS data_contributing_initiatives,
    di.contributing_initiatives AS initial_contributing_initiatives,
    CASE
        WHEN d.contributing_initiatives != di.contributing_initiatives THEN 'Changed'
        ELSE 'No change'
    END AS contributing_initiatives_change,
    d.contributing_non_pooled_project AS data_non_pooled_project,
    di.contributing_non_pooled_project AS initial_non_pooled_project,
    CASE
        WHEN d.contributing_non_pooled_project != di.contributing_non_pooled_project THEN 'Changed'
        ELSE 'No change'
    END AS non_pooled_project_change,
    d.new_or_updated_result AS data_new_or_updated_result,
    di.new_or_updated_result AS initial_new_or_updated_result,
    CASE
        WHEN d.new_or_updated_result != di.new_or_updated_result THEN 'Changed'
        ELSE 'No change'
    END AS new_or_updated_result_change,
    d.gender_tag_level AS data_gender_tag_level,
    di.gender_tag_level AS initial_gender_tag_level,
    CASE
        WHEN d.gender_tag_level != di.gender_tag_level THEN 'Changed'
        ELSE 'No change'
    END AS gender_tag_level_change,
    d.climate_change_level AS data_climate_change_level,
    di.climate_change_level AS initial_climate_change_level,
    CASE
        WHEN d.climate_change_level != di.climate_change_level THEN 'Changed'
        ELSE 'No change'
    END AS climate_change_level_change,
    d.evidence AS data_evidence,
    di.evidence AS initial_evidence,
    CASE
        WHEN d.evidence != di.evidence THEN 'Changed'
        ELSE 'No change'
    END AS evidence_change,
    d.male_using AS data_male_using,
    di.male_using AS initial_male_using,
    CASE
        WHEN d.male_using != di.male_using THEN 'Changed'
        ELSE 'No change'
    END AS male_using_change,
    d.female_using AS data_female_using,
    di.female_using AS initial_female_using,
    CASE
        WHEN d.female_using != di.female_using THEN 'Changed'
        ELSE 'No change'
    END AS female_using_change,
    d.result_code AS data_result_code,
    di.result_code AS initial_result_code,
    CASE
        WHEN d.result_code != di.result_code THEN 'Changed'
        ELSE 'No change'
    END AS result_code_change,
    d.is_replicated AS data_is_replicated,
    di.is_replicated AS initial_is_replicated,
    CASE
        WHEN d.is_replicated != di.is_replicated THEN 'Changed'
        ELSE 'No change'
    END AS is_replicated_change
FROM
    qa_capdev_data d
    LEFT JOIN qa_capdev_data_initial di ON d.id = di.id
    LEFT JOIN qa_evaluations qe ON qe.indicator_view_id = d.id
WHERE 
	qe.phase_year = 2024;

-- INNO DEV Data Comparison Query
SELECT
	d.result_code,
    d.id AS data_id,
    di.id AS initial_data_id,
    CASE
        WHEN d.crp_id != di.crp_id THEN 'Changed'
        ELSE 'No change'
    END AS crp_id,
    CASE
        WHEN d.phase_name != di.phase_name THEN 'Changed'
        ELSE 'No change'
    END AS phase_name,
    CASE
        WHEN d.phase_year != di.phase_year THEN 'Changed'
        ELSE 'No change'
    END AS phase_year,
    CASE
        WHEN d.included_AR != di.included_AR THEN 'Changed'
        ELSE 'No change'
    END AS included_AR,
    CASE
        WHEN d.is_active != di.is_active THEN 'Changed'
        ELSE 'No change'
    END AS is_active,
    CASE
        WHEN d.version != di.version THEN 'Changed'
        ELSE 'No change'
    END AS version,
    CASE
        WHEN d.result_level != di.result_level THEN 'Changed'
        ELSE 'No change'
    END AS result_level,
    CASE
        WHEN d.result_type != di.result_type THEN 'Changed'
        ELSE 'No change'
    END AS result_type,
    CASE
        WHEN d.title != di.title THEN 'Changed'
        ELSE 'No change'
    END AS title,
    CASE
        WHEN d.description != di.description THEN 'Changed'
        ELSE 'No change'
    END AS description,
    CASE
        WHEN d.toc_planned != di.toc_planned THEN 'Changed'
        ELSE 'No change'
    END AS toc_planned,
    CASE
        WHEN d.geographic_focus != di.geographic_focus THEN 'Changed'
        ELSE 'No change'
    END AS geographic_focus,
    CASE
        WHEN d.regions != di.regions THEN 'Changed'
        ELSE 'No change'
    END AS regions,
    CASE
        WHEN d.countries != di.countries THEN 'Changed'
        ELSE 'No change'
    END AS countries,
    CASE
        WHEN d.actors != di.actors THEN 'Changed'
        ELSE 'No change'
    END AS actors,
    CASE
        WHEN d.contributing_centers != di.contributing_centers THEN 'Changed'
        ELSE 'No change'
    END AS contributing_centers,
    CASE
        WHEN d.partners != di.partners THEN 'Changed'
        ELSE 'No change'
    END AS partners,
    CASE
        WHEN d.contributing_initiatives != di.contributing_initiatives THEN 'Changed'
        ELSE 'No change'
    END AS contributing_initiatives,
    CASE
        WHEN d.contributing_non_pooled_project != di.contributing_non_pooled_project THEN 'Changed'
        ELSE 'No change'
    END AS non_pooled_project,
    CASE
        WHEN d.new_or_updated_result != di.new_or_updated_result THEN 'Changed'
        ELSE 'No change'
    END AS new_or_updated_result,
    CASE
        WHEN d.linked_results != di.linked_results THEN 'Changed'
        ELSE 'No change'
    END AS linked_results,
    CASE
        WHEN d.previous_portfolio != di.previous_portfolio THEN 'Changed'
        ELSE 'No change'
    END AS previous_portfolio,
    CASE
        WHEN d.gender_tag_level != di.gender_tag_level THEN 'Changed'
        ELSE 'No change'
    END AS gender_tag_level,
    CASE
        WHEN d.climate_change_level != di.climate_change_level THEN 'Changed'
        ELSE 'No change'
    END AS climate_change_level,
    CASE
        WHEN d.evidence != di.evidence THEN 'Changed'
        ELSE 'No change'
    END AS evidence,
    CASE
        WHEN d.climate_related_evidence != di.climate_related_evidence THEN 'Changed'
        ELSE 'No change'
    END AS climate_related_evidence,
    CASE
        WHEN d.gender_related_evidence != di.gender_related_evidence THEN 'Changed'
        ELSE 'No change'
    END AS gender_related_evidence,
    CASE
        WHEN d.supplementary_related_evidence != di.supplementary_related_evidence THEN 'Changed'
        ELSE 'No change'
    END AS supplementary_related_evidence,
    CASE
        WHEN d.short_title != di.short_title THEN 'Changed'
        ELSE 'No change'
    END AS short_title,
    CASE
        WHEN d.typology != di.typology THEN 'Changed'
        ELSE 'No change'
    END AS typology,
    CASE
        WHEN d.is_new_varieties != di.is_new_varieties THEN 'Changed'
        ELSE 'No change'
    END AS is_new_varieties,
    CASE
        WHEN d.number_of_variety != di.number_of_variety THEN 'Changed'
        ELSE 'No change'
    END AS number_of_variety,
    CASE
        WHEN d.innovation_developers != di.innovation_developers THEN 'Changed'
        ELSE 'No change'
    END AS innovation_developers,
    CASE
        WHEN d.innovation_collaborators != di.innovation_collaborators THEN 'Changed'
        ELSE 'No change'
    END AS innovation_collaborators,
    CASE
        WHEN d.innovation_acknowledgement != di.innovation_acknowledgement THEN 'Changed'
        ELSE 'No change'
    END AS innovation_acknowledgement,
    CASE
        WHEN d.innovation_characterization != di.innovation_characterization THEN 'Changed'
        ELSE 'No change'
    END AS innovation_characterization,
    CASE
        WHEN d.innovation_readiness_level != di.innovation_readiness_level THEN 'Changed'
        ELSE 'No change'
    END AS innovation_readiness_level,
    CASE
        WHEN d.innovation_readiness_level_justification != di.innovation_readiness_level_justification THEN 'Changed'
        ELSE 'No change'
    END AS readiness_level_justification,
    CASE
        WHEN d.result_code != di.result_code THEN 'Changed'
        ELSE 'No change'
    END AS result_code,
    CASE
        WHEN d.submitted != di.submitted THEN 'Changed'
        ELSE 'No change'
    END AS submitted,
    CASE
        WHEN d.is_replicated != di.is_replicated THEN 'Changed'
        ELSE 'No change'
    END AS is_replicated,
    CASE
        WHEN d.action_area != di.action_area THEN 'Changed'
        ELSE 'No change'
    END AS action_area,
    CASE
        WHEN d.impact_area_targets != di.impact_area_targets THEN 'Changed'
        ELSE 'No change'
    END AS impact_area_targets,
    CASE
        WHEN d.sdg != di.sdg THEN 'Changed'
        ELSE 'No change'
    END AS sdg,
    CASE
        WHEN d.nutrition_tag_level != di.nutrition_tag_level THEN 'Changed'
        ELSE 'No change'
    END AS nutrition_tag_level,
    CASE
        WHEN d.environmental_biodiversity_tag_level != di.environmental_biodiversity_tag_level THEN 'Changed'
        ELSE 'No change'
    END AS biodiversity_tag_level,
    CASE
        WHEN d.poverty_tag_level != di.poverty_tag_level THEN 'Changed'
        ELSE 'No change'
    END AS poverty_tag_level,
    CASE
        WHEN d.questions != di.questions THEN 'Changed'
        ELSE 'No change'
    END AS questions,
    CASE
        WHEN d.initiatives_investment != di.initiatives_investment THEN 'Changed'
        ELSE 'No change'
    END AS initiatives_investment,
    CASE
        WHEN d.npp_investment != di.npp_investment THEN 'Changed'
        ELSE 'No change'
    END AS npp_investment,
    CASE
        WHEN d.partner_investment != di.partner_investment THEN 'Changed'
        ELSE 'No change'
    END AS partner_investment,
    CASE
        WHEN d.pictures != di.pictures THEN 'Changed'
        ELSE 'No change'
    END AS pictures,
    CASE
        WHEN d.materials != di.materials THEN 'Changed'
        ELSE 'No change'
    END AS materials,
    CASE
        WHEN d.anticipated != di.anticipated THEN 'Changed'
        ELSE 'No change'
    END AS anticipated
FROM
    qa_innovation_development_data d
    LEFT JOIN qa_innovation_development_data_initial di ON d.id = di.id
    LEFT JOIN qa_evaluations qe ON qe.indicator_view_id = d.id
WHERE 
	qe.phase_year = 2024;