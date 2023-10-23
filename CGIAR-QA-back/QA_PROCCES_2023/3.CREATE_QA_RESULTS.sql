-- VIEW TO FETCH THE MATERILIZED VIEW

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
WHERE qa_capdev_data.phase_year = 2023;