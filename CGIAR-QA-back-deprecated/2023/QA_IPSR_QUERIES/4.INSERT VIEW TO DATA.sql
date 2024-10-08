SET
    SQL_SAFE_UPDATES = 0;

SET
    group_concat_max_len = 25000;

INSERT INTO
    qa_innovation_use_ipsr_data (
        phase_name,
        phase_year,
        included_AR,
        is_active,
        crp_id,
        id,
        result_code,
        result_level,
        result_type,
        lead_initiative,
        core_innovation,
        geo_scope,
        geo_focus,
        reported_year,
        title,
        description,
        gender_tag_level,
        climate_change_tag_level,
        is_krs,
        lead_initiative_toc,
        contributing_initiative,
        contributing_npp,
        partners,
        contributing_centers,
        eoi_outcomes,
        aa_outcomes,
        ia_outcomes,
        sdgs,
        actors,
        organizations,
        other_quantity,
        specify_scaling_partners,
        existing_complementary_innovation,
        new_complementary_innovation,
        workshop_list_of_participants,
        what_was_assessed_during_the_workshop,
        core_innovation_evidence_based_assessment,
        complementary_innovation_evidence_based_assessment,
        core_innovation_actors,
        core_innovation_organizations,
        core_innovation_measures,
        linked_result,
        results_from_previous_portfolio
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
    cc.lead_initiative,
    cc.core_innovation,
    cc.geo_scope,
    cc.geo_focus,
    cc.reported_year,
    cc.title,
    cc.description,
    cc.gender_tag_level,
    cc.climate_change_tag_level,
    cc.is_krs,
    cc.lead_initiative_toc,
    cc.contributing_initiative,
    cc.contributing_npp,
    cc.partners,
    cc.contributing_centers,
    cc.eoi_outcomes,
    cc.aa_outcomes,
    cc.ia_outcomes,
    cc.sdgs,
    cc.actors,
    cc.organizations,
    cc.other_quantity,
    cc.specify_scaling_partners,
    cc.existing_complementary_innovation,
    cc.new_complementary_innovation,
    cc.workshop_list_of_participants,
    cc.what_was_assessed_during_the_workshop,
    cc.core_innovation_evidence_based_assessment,
    cc.complementary_innovation_evidence_based_assessment,
    cc.core_innovation_actors,
    cc.core_innovation_organizations,
    cc.core_innovation_measures,
    cc.linked_result,
    cc.results_from_previous_portfolio
FROM
    qa_innovation_use_ipsr_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_use_ipsr_data qa
        WHERE
            qa.id = cc.id
    );