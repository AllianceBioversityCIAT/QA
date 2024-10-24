CREATE DEFINER = `prmsadmin` @`%` PROCEDURE `qadb`.`qa_update_indicator_ipsr`() BEGIN DECLARE start_time TIMESTAMP;

SET
    start_time = SYSDATE();

SET
    SQL_SAFE_UPDATES = 0;

SET
    SESSION group_concat_max_len = 2000000;

-- * POLICY CHANGE
CREATE TABLE qa_policy_change_data_tmp LIKE qa_policy_change_data;

INSERT INTO
    qa_policy_change_data_tmp (
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
    qa_policy_change_view cc;

DELETE FROM
    qa_policy_change_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_policy_change'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_policy_change_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_policy_change_data
SELECT
    *
FROM
    qa_policy_change_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_policy_change_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_policy_change_data_tmp;

-- * INNO USE
CREATE TABLE qa_innovation_use_data_tmp LIKE qa_innovation_use_data;

INSERT INTO
    qa_innovation_use_data_tmp (
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
    qa_innovation_use_view cc;

DELETE FROM
    qa_innovation_use_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_innovation_use'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_innovation_use_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_innovation_use_data
SELECT
    *
FROM
    qa_innovation_use_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_use_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_innovation_use_data_tmp;

-- * CAP SHARING
CREATE TABLE qa_capdev_data_tmp LIKE qa_capdev_data;

INSERT INTO
    qa_capdev_data_tmp (
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
    qa_capdev_view cc;

DELETE FROM
    qa_capdev_data
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_capdev'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_capdev_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_capdev_data
SELECT
    *
FROM
    qa_capdev_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_capdev_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_capdev_data_tmp;

-- * INNO DEV
CREATE TABLE qa_innovation_development_data_tmp LIKE qa_innovation_development_data;

INSERT INTO
    qa_innovation_development_data_tmp (
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
    qa_innovation_development_view cc;

DELETE FROM
    qa_innovation_development_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_innovation_development'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_innovation_development_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_innovation_development_data
SELECT
    *
FROM
    qa_innovation_development_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_development_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_innovation_development_data_tmp;

-- * OTHER OUTCOME
CREATE TABLE qa_other_output_data_tmp LIKE qa_other_output_data;

INSERT INTO
    qa_other_output_data_tmp (
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
    qa_other_output_view cc;

DELETE FROM
    qa_other_output_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_other_output'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_other_output_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_other_output_data
SELECT
    *
FROM
    qa_other_output_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_other_output_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_other_output_data_tmp;

-- * OTHER OUTCOME
CREATE TABLE qa_other_outcome_data_tmp LIKE qa_other_outcome_data;

INSERT INTO
    qa_other_outcome_data_tmp (
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
    qa_other_outcome_view cc;

DELETE FROM
    qa_other_outcome_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_other_outcome'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_other_outcome_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_other_outcome_data
SELECT
    *
FROM
    qa_other_outcome_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_other_outcome_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_other_outcome_data_tmp;

-- * IMPACT CONTRIBUTION
CREATE TABLE qa_impact_contribution_data_tmp LIKE qa_impact_contribution_data;

INSERT INTO
    qa_impact_contribution_data_tmp (
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
    qa_impact_contribution_view cc;

DELETE FROM
    qa_impact_contribution_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_impact_contribution'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_impact_contribution_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_impact_contribution_data
SELECT
    *
FROM
    qa_impact_contribution_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_impact_contribution_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_impact_contribution_data_tmp;

-- * KP
CREATE TABLE qa_knowledge_product_data_tmp LIKE qa_knowledge_product_data;

INSERT INTO
    qa_knowledge_product_data_tmp (
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
    cc.version,
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
    qa_knowledge_product_view cc;

DELETE FROM
    qa_knowledge_product_data qa
WHERE
    qa.phase_year = 2024
    AND qa.id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_knowledge_product'
    )
    AND qa.id IN (
        SELECT
            cc.id
        FROM
            qa_knowledge_product_view cc
        WHERE
            cc.id = qa.id
    );

INSERT INTO
    qa_knowledge_product_data
SELECT
    *
FROM
    qa_knowledge_product_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_knowledge_product_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_knowledge_product_data_tmp;

-- * IPSR
CREATE TABLE qa_innovation_use_ipsr_data_tmp LIKE qa_innovation_use_ipsr_data;

INSERT INTO
    qa_innovation_use_ipsr_data_tmp (
        phase_name,
        phase_year,
        included_AR,
        is_active,
        version,
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
    cc.version,
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
    qa_innovation_use_ipsr_view cc;

DELETE FROM
    qa_innovation_use_ipsr_data
WHERE
    phase_year = 2024
    AND id IN (
        SELECT
            qe.indicator_view_id
        FROM
            qa_evaluations qe
        WHERE
            qe.batchDate >= actual_batch_date()
            AND qe.indicator_view_name = 'qa_innovation_use_ipsr'
    );

INSERT INTO
    qa_innovation_use_ipsr_data
SELECT
    *
FROM
    qa_innovation_use_ipsr_data_tmp cc
WHERE
    NOT EXISTS (
        SELECT
            1
        FROM
            qa_innovation_use_ipsr_data qa
        WHERE
            qa.id = cc.id
    );

DROP TABLE qa_innovation_use_ipsr_data_tmp;

-- Insert data logs
INSERT INTO
    qa_data_refresh_log
SELECT
    'result_ipsr_data',
    start_time,
    DATE_ADD(start_time, INTERVAL -5 HOUR),
    null,
    TIME_TO_SEC(TIMEDIFF(sysdate(), start_time)) diff;

END