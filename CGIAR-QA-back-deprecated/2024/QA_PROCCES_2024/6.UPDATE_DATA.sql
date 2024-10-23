SET
    SQL_SAFE_UPDATES = 0;

SET
    SESSION group_concat_max_len = 2000000;

-- POLICY CHANGE
DELETE FROM
    qa_policy_change_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_policy_change_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        policy_type,
        usd_amount,
        status,
        stage,
        implementing_organizations,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level,
        result_related
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.policy_type,
    cc.usd_amount,
    cc.status,
    cc.stage,
    cc.implementing_organizations,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level,
    cc.result_related
FROM
    qa_policy_change_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_policy_change_data qa
        WHERE
            qa.id = cc.id
    );

-- INNO USE
DELETE FROM
    qa_innovation_use_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_innovation_use_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level,
        actors,
        organizations,
        other_quantitative
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level,
    cc.actors,
    cc.organizations,
    cc.other_quantitative
FROM
    qa_innovation_use_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_use_data qa
        WHERE
            qa.id = cc.id
    );

-- CAP DEV
DELETE FROM
    qa_capdev_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_capdev_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
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
    cc.version,
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

-- INNO DEV
DELETE FROM
    qa_innovation_development_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_innovation_development_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        short_title,
        typology,
        number_of_variety,
        innovation_developers,
        innovation_collaborators,
        innovation_acknowledgement,
        innovation_characterization,
        innovation_readiness_level,
        innovation_readiness_level_justification,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level,
        questions,
        anticipated,
        initiatives_investment,
        npp_investment,
        partner_investment,
        pictures,
        materials,
        evidence
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.short_title,
    cc.typology,
    cc.number_of_variety,
    cc.innovation_developers,
    cc.innovation_collaborators,
    cc.innovation_acknowledgement,
    cc.innovation_characterization,
    cc.innovation_readiness_level,
    cc.innovation_readiness_level_justification,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level,
    cc.questions,
    cc.anticipated,
    cc.initiatives_investment,
    cc.npp_investment,
    cc.partner_investment,
    cc.pictures,
    cc.materials,
    cc.evidence
FROM
    qa_innovation_development_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_development_data qa
        WHERE
            qa.id = cc.id
    );

-- OTHER OUTPUT
DELETE FROM
    qa_other_output_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_other_output_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level
FROM
    qa_other_output_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_other_output_data qa
        WHERE
            qa.id = cc.id
    );

-- OTHER OUTCOME
DELETE FROM
    qa_other_outcome_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_other_outcome_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level
FROM
    qa_other_outcome_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_other_outcome_data qa
        WHERE
            qa.id = cc.id
    );

-- IMPACT CONTRIBUTION
DELETE FROM
    qa_impact_contribution_data
WHERE
    phase_year = 2024;

INSERT INTO
    qa_impact_contribution_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        geographic_focus,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        gender_tag_level,
        climate_change_level,
        result_code,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.version,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.geographic_focus,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.result_code,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level
FROM
    qa_impact_contribution_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_impact_contribution_data qa
        WHERE
            qa.id = cc.id
    );

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
    v.in_qa = 1;

-- IPSR
DELETE FROM
    qa_innovation_use_ipsr_data
WHERE
    phase_year = 2024;

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