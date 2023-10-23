SET
	SQL_SAFE_UPDATES = 0;

SET
	group_concat_max_len = 25000;

TRUNCATE TABLE qa_innovation_use_ipsr_data;

-- CAP DEV
INSERT INTO
    qa_capdev_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        id,
        result_code,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        actors,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level,
        long_term_short_term,
        capdev_delivery_method,
        trainees_attending_on_behalf_of_an_organization,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        number_of_people_trained
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.id,
    cc.result_code,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.actors,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level,
    cc.long_term_short_term,
    cc.capdev_delivery_method,
    cc.trainees_attending_on_behalf_of_an_organization,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.number_of_people_trained
FROM
    qa_capdev_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_capdev_data qa
        WHERE
            qa.id = cc.id
    );