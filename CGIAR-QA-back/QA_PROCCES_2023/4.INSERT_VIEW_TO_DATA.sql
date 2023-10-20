SET
    SQL_SAFE_UPDATES = 0;

SET
    group_concat_max_len = 25000;

-- CAP SHARING
INSERT INTO
    qa_capdev_data (
        phase_name,
        phase_year,
        included_AR,
        is_active,
        crp_id,
        id,
        result_code,
        result_level,
        result_type,
        title,
        description,
        gender_tag_level,
        climate_change_level,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level_id,
        submitted,
        is_replicated,
        actors,
        contributing_initiatives,
        partners,
        geographic_focus,
        regions,
        countries,
        toc_planned,
        action_area,
        impact_area_targets,
        sdg,
        number_of_people_trained,
        long_term_short_term,
        capdev_delivery_method,
        trainees_attending_on_behalf_of_an_organization
    )
SELECT
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.crp_id,
    cc.id,
    cc.result_code,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level_id,
    cc.submitted,
    cc.is_replicated,
    cc.actors,
    cc.contributing_initiatives,
    cc.partners,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.toc_planned,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.number_of_people_trained,
    cc.long_term_short_term,
    cc.capdev_delivery_method,
    cc.trainees_attending_on_behalf_of_an_organization
FROM
    qa_capdev cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_capdev_data qa
        WHERE
            qa.id = cc.id
    );