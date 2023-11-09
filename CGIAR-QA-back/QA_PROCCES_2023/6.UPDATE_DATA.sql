SET
    SQL_SAFE_UPDATES = 0;

SET
    group_concat_max_len = 25000;

-- POLICY CHANGE
DELETE FROM
    qa_policy_change_data
WHERE
    phase_year = 2023;

INSERT INTO
    qa_policy_change_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
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
    cc.evidence,
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
    phase_year = 2023;

INSERT INTO
    qa_innovation_use_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
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
    cc.evidence,
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
    phase_year = 2023;

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
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        evidence,
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
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.evidence,
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
    phase_year = 2023;

INSERT INTO
    qadb.qa_innovation_development_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
        gender_tag_level,
        climate_change_level,
        short_title,
        typology,
        is_new_varieties,
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
        materials
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
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
    cc.evidence,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.short_title,
    cc.typology,
    cc.is_new_varieties,
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
    cc.materials
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
    phase_year = 2023;

INSERT INTO
    qa_other_output_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
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
    cc.evidence,
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
    phase_year = 2023;

INSERT INTO
    qa_other_outcome_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
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
    cc.evidence,
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
    phase_year = 2023;

INSERT INTO
    qa_impact_contribution_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
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
        evidence,
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
    cc.evidence,
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
DELETE FROM
    qa_knowledge_product_data
WHERE
    phase_year = 2023;

INSERT INTO
    qa_knowledge_product_data (
        crp_id,
        phase_name,
        phase_year,
        included_AR,
        is_active,
        id,
        result_level,
        result_type,
        title,
        description,
        toc_planned,
        regions,
        countries,
        contributing_centers,
        partners,
        contributing_initiatives,
        contributing_non_pooled_project,
        new_or_updated_result,
        linked_results,
        previous_portfolio,
        evidence,
        gender_tag_level,
        climate_change_level,
        is_melia,
        melia_previous_submitted,
        handle,
        issue_date,
        authors,
        knowledge_product_type,
        peer_reviewed,
        wos_isi,
        accesibility,
        license,
        keywords,
        altmetrics,
        findable,
        accesible,
        interoperable,
        reusable,
        result_code,
        geographic_focus,
        submitted,
        is_replicated,
        action_area,
        impact_area_targets,
        sdg,
        nutrition_tag_level,
        environmental_biodiversity_tag_level,
        poverty_tag_level,
        online_date
    )
SELECT
    cc.crp_id,
    cc.phase_name,
    cc.phase_year,
    cc.included_AR,
    cc.is_active,
    cc.id,
    cc.result_level,
    cc.result_type,
    cc.title,
    cc.description,
    cc.toc_planned,
    cc.regions,
    cc.countries,
    cc.contributing_centers,
    cc.partners,
    cc.contributing_initiatives,
    cc.contributing_non_pooled_project,
    cc.new_or_updated_result,
    cc.linked_results,
    cc.previous_portfolio,
    cc.evidence,
    cc.gender_tag_level,
    cc.climate_change_level,
    cc.is_melia,
    cc.melia_previous_submitted,
    cc.handle,
    cc.issue_date,
    cc.authors,
    cc.knowledge_product_type,
    cc.peer_reviewed,
    cc.wos_isi,
    cc.accesibility,
    cc.license,
    cc.keywords,
    cc.altmetrics,
    cc.findable,
    cc.accesible,
    cc.interoperable,
    cc.reusable,
    cc.result_code,
    cc.geographic_focus,
    cc.submitted,
    cc.is_replicated,
    cc.action_area,
    cc.impact_area_targets,
    cc.sdg,
    cc.nutrition_tag_level,
    cc.environmental_biodiversity_tag_level,
    cc.poverty_tag_level,
    cc.online_date
FROM
    qa_knowledge_product_view cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_knowledge_product_data qa
        WHERE
            qa.id = cc.id
    );