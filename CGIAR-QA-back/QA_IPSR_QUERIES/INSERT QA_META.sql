DELETE FROM
    qa_indicators_meta qim
WHERE
    qim.indicatorId = 10;

INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'phase_name',
        'Phase name',
        0,
        0,
        0,
        0,
        0,
        'Phase Name',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'phase_name'
    ),
    (
        'phase_year',
        'Phase year',
        0,
        0,
        0,
        0,
        0,
        'Phase year',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'phase_year'
    ),
    (
        'included_AR',
        'Include AR',
        0,
        0,
        0,
        0,
        0,
        'Include AR',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'included_AR'
    ),
    (
        'is_active',
        'Is active',
        0,
        0,
        0,
        0,
        0,
        'Is active',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'is_active'
    ),
    (
        'crp_id',
        'CRP ID',
        0,
        0,
        0,
        0,
        0,
        'CRP ID',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'crp_id'
    ),
    (
        'id',
        'ID',
        0,
        1,
        0,
        0,
        0,
        'ID',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'id'
    );

-- CREATE RESULT
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'create_result',
        '<h2>Create Result</h2>',
        0,
        0,
        0,
        1,
        1,
        '<h2>Create Result</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'create_result'
    ),
    (
        'result_level',
        'Result level',
        1,
        0,
        1,
        1,
        2,
        'Result level',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'result_level'
    ),
    (
        'result_type',
        'Result type',
        1,
        0,
        1,
        1,
        3,
        'Result type',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'result_type'
    ),
    (
        'lead_initiative',
        'Lead initiative',
        0,
        0,
        1,
        1,
        4,
        'Lead initiative',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'lead_initiative'
    ),
    (
        'core_innovation',
        'Selected core innovation',
        0,
        0,
        1,
        1,
        5,
        'Selected core innovation',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'core_innovation'
    );

-- GENERAL INFORMATION
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'general_info',
        '<h2>General information</h2>',
        0,
        0,
        0,
        1,
        9,
        '<h2>General information</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'general_info'
    ),
    (
        'reported_year',
        'Reporting year',
        0,
        0,
        1,
        1,
        10,
        'Reporting year',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'reported_year'
    ),
    (
        'title',
        'Title',
        1,
        0,
        1,
        1,
        11,
        'Title',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'title'
    ),
    (
        'description',
        'Description',
        1,
        0,
        1,
        1,
        12,
        'Description',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'description'
    ),
    (
        'geo_focus',
        'Geographic focus',
        1,
        0,
        1,
        1,
        13,
        'Geographic focus',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'geo_focus'
    ),
    (
        'gender_tag_level',
        'Gender tag level',
        1,
        0,
        1,
        1,
        14,
        'Gender tag level',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'gender_tag_level'
    ),
    (
        'climate_change_tag_level',
        'Climate change tag level',
        1,
        0,
        1,
        1,
        15,
        'Climate change tag level',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'climate_change_tag_level'
    ),
    (
        'is_krs',
        'Is this result featured in a Key Result Story for the Reporting year?',
        0,
        0,
        1,
        1,
        16,
        'Is this result featured in a Key Result Story for the Reporting year?',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'is_krs'
    );

-- CONTRIBUTORS
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'contributors',
        '<h2>Contributors</h2>',
        0,
        0,
        0,
        1,
        17,
        '<h2>Contributors</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'contributors'
    ),
    (
        'lead_initiative_toc',
        'Lead initiative Theory of Change',
        1,
        0,
        1,
        1,
        18,
        'Lead initiative Theory of Change',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'lead_initiative_toc'
    ),
    (
        'contributing_initiative',
        'Contributing CGIAR Initiatives',
        0,
        0,
        1,
        1,
        19,
        'Contributing CGIAR Initiatives',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'contributing_initiative'
    ),
    (
        'contributing_npp',
        'Contributing non-pooled projects',
        0,
        0,
        1,
        1,
        20,
        'Contributing non-pooled projects',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'contributing_npp'
    ),
    (
        'partners',
        'Partners & Partner role',
        0,
        0,
        1,
        1,
        21,
        'Partners & Partner role',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'partners'
    ),
    (
        'contributing_centers',
        'Contributing centers',
        0,
        0,
        1,
        1,
        20,
        'Contributing centers',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'contributing_centers'
    );

-- STEP 1 - OUTCOMES & IMPACTS
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'step_one_outcomes_impacts',
        '<h2>IPSR Step 1</h2>',
        0,
        0,
        0,
        1,
        21,
        '<h2>IPSR Step 1</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'step_one_outcomes_impacts'
    ),
    (
        'eoi_outcomes',
        'End-of-Initiative Outcome(s)',
        1,
        0,
        1,
        1,
        22,
        'End-of-Initiative Outcome(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'eoi_outcomes'
    ),
    (
        'aa_outcomes',
        'CGIAR Action Area Outcome(s)',
        1,
        0,
        1,
        1,
        23,
        'CGIAR Action Area Outcome(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'aa_outcomes'
    ),
    (
        'ia_outcomes',
        'CGIAR Impact Area(s)',
        1,
        0,
        1,
        1,
        24,
        'CGIAR Impact Area(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'ia_outcomes'
    ),
    (
        'sdgs',
        'Sustainable Development Goal Target(s)',
        1,
        0,
        1,
        1,
        25,
        'Sustainable Development Goal Target(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'sdgs'
    );

-- STEP 1 - INNOVATION USE
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'actors',
        'Actor(s)',
        1,
        0,
        1,
        1,
        26,
        'Actor(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'actors'
    ),
    (
        'organizations',
        'Organization(s)',
        1,
        0,
        1,
        1,
        27,
        'Organization(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'organizations'
    ),
    (
        'other_quantity',
        'Other quantitative measures of innovation use',
        1,
        0,
        1,
        1,
        28,
        'Other quantitative measures of innovation use',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'other_quantity'
    );

-- STEP 1 - SCALLING PARTNERS
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'specify_scaling_partners',
        'Specify scaling partner(s)',
        0,
        0,
        1,
        1,
        29,
        'Specify scaling partner(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'specify_scaling_partners'
    );

-- STEP 1 - INNO PCKG EXPERTS
-- INSERT INTO
--     qa_indicators_meta (
--         col_name,
--         display_name,
--         enable_comments,
--         is_primay,
--         include_general,
--         include_detail,
--         `order`,
--         description,
--         createdAt,
--         updatedAt,
--         indicatorId,
--         is_core,
--         indicator_slug
--     )
-- VALUES
--     (
--         'innovation_pack_experts',
--         'Identified group of various public and private experts that should participate in the Innovation Package',
--         0,
--         0,
--         1,
--         1,
--         26,
--         'Identified group of various public and private experts that should participate in the Innovation Package',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'innovation_pack_experts'
--     ),
--     (
--         'experts_is_diverse',
--         'Engaging a diverse group of experts leads to better and more realistic innovation package design and assessment',
--         0,
--         0,
--         1,
--         1,
--         27,
--         'Identified group of various public and private experts that should participate in the Innovation Package',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'experts_is_diverse'
--     );
-- STEP 1 - CONSENSUS & CONSULTATION
-- INSERT INTO
--     qa_indicators_meta (
--         col_name,
--         display_name,
--         enable_comments,
--         is_primay,
--         include_general,
--         include_detail,
--         `order`,
--         description,
--         createdAt,
--         updatedAt,
--         indicatorId,
--         is_core,
--         indicator_slug
--     )
-- VALUES
--     (
--         'consensus_and_consultation',
--         'Consensus and Consultation',
--         0,
--         0,
--         1,
--         1,
--         28,
--         'Consensus and Consultation',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'consensus_and_consultation'
--     );
-- STEP 2 - COMPLEMENTARY
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'ipsr_step_2_complementary_innovation',
        '<h2>IPSR Step 2</h2>',
        0,
        0,
        0,
        1,
        30,
        '<h2>IPSR Step 2</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'ipsr_step_2_complementary_innovation'
    ),
    (
        'existing_complementary_innovation',
        'Existing Complementary innovation/ lenabler/ solution that GIAR and partners (already reported)',
        1,
        0,
        1,
        1,
        31,
        'Existing Complementary innovation/ lenabler/ solution that GIAR and partners (already reported)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'existing_complementary_innovation'
    ),
    (
        'new_complementary_innovation',
        'New complementary innovations/ enablers/ solutions',
        1,
        0,
        1,
        1,
        32,
        'New complementary innovations/ enablers/ solutions',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'new_complementary_innovation'
    );

-- STEP 3 - WORKSHOP DETAIL
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'expert_workshop_organized',
        '<h2>IPSR Step 3</h2>',
        0,
        0,
        0,
        1,
        33,
        '<h2>IPSR Step 3</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'expert_workshop_organized'
    ),
    -- (
    --     'expert_workshop_organized',
    --     'Was an Innovation Packaging and Scaling Readiness online or in-person expert workshop organized?',
    --     0,
    --     0,
    --     1,
    --     1,
    --     31,
    --     'Was an Innovation Packaging and Scaling Readiness online or in-person expert workshop organized?',
    --     CURRENT_TIMESTAMP(6),
    --     CURRENT_TIMESTAMP(6),
    --     10,
    --     0,
    --     'expert_workshop_organized'
    -- ),
    -- (
    --     'workshop_facilitators',
    --     'Specify the IPSR expert workshop facilitators',
    --     0,
    --     0,
    --     1,
    --     1,
    --     32,
    --     'Specify the IPSR expert workshop facilitators',
    --     CURRENT_TIMESTAMP(6),
    --     CURRENT_TIMESTAMP(6),
    --     10,
    --     0,
    --     'workshop_facilitators'
    -- ),
    (
        'workshop_list_of_participants',
        'Workshop list of participants',
        0,
        0,
        0,
        0,
        34,
        'Workshop list of participants',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'workshop_list_of_participants'
    );

-- STEP 3 - SELF ASSESSMENT
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'what_was_assessed_during_the_workshop',
        'What was assessed during the expert workshop?',
        0,
        0,
        1,
        1,
        36,
        'What was assessed during the expert workshop?',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'what_was_assessed_during_the_workshop'
    );

-- STEP 3 - BASSED ASSESSMENT
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'core_innovation_evidence_based_assessment',
        'Evidence-based assessment of core innovation',
        0,
        0,
        0,
        0,
        38,
        'Evidence-based assessment of core innovation',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'core_innovation_evidence_based_assessment'
    ),
    (
        'complementary_innovation_evidence_based_assessment',
        'Evidence-based assessment of complementary innovation(s)',
        1,
        0,
        1,
        1,
        39,
        'Evidence-based assessment of complementary innovation(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'complementary_innovation_evidence_based_assessment'
    );

-- STEP 3 - CURRENT USE NUMBERS OF THE CORE INNOVATION
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'core_innovation_actors',
        'Current use of the core innovation: Actor(s)',
        1,
        0,
        1,
        1,
        41,
        'Current use of the core innovation: Actor(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'core_innovation_actors'
    ),
    (
        'core_innovation_organizations',
        'Current use of the core innovation: Organization(s)',
        1,
        0,
        1,
        1,
        42,
        'Current use of the core innovation: Organization(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'core_innovation_organizations'
    ),
    (
        'core_innovation_measures',
        'Current use of the core innovation: Other quantitative measures',
        1,
        0,
        1,
        1,
        43,
        'Current use of the core innovation: Other quantitative measures',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        1,
        'core_innovation_measures'
    );

-- STEP 4 - ANTICIPATED INVESTMENT
-- INSERT INTO
--     qa_indicators_meta (
--         col_name,
--         display_name,
--         enable_comments,
--         is_primay,
--         include_general,
--         include_detail,
--         `order`,
--         description,
--         createdAt,
--         updatedAt,
--         indicatorId,
--         is_core,
--         indicator_slug
--     )
-- VALUES
--     (
--         'expected_lead_initiative_investment',
--         'Expected CGIAR Lead Initiative investment',
--         0,
--         0,
--         1,
--         1,
--         40,
--         'Expected CGIAR Lead Initiative investment',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'expected_lead_initiative_investment'
--     ),
--     (
--         'expected_contributing_initiative_investment',
--         'Expected CGIAR Contributing Initiative(s) investment',
--         0,
--         0,
--         1,
--         1,
--         41,
--         'Expected CGIAR Contributing Initiative(s) investment',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'expected_contributing_initiative_investment'
--     ),
--     (
--         'bilateral_project_investment',
--         'Non-pooled / bilateral project(s) investment',
--         0,
--         0,
--         1,
--         1,
--         42,
--         'Non-pooled / bilateral project(s) investment',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'bilateral_project_investment'
--     ),
--     (
--         'expected_partner_investment',
--         'Partner investment (from own resources)',
--         0,
--         0,
--         1,
--         1,
--         43,
--         'Partner investment (from own resources)',
--         CURRENT_TIMESTAMP(6),
--         CURRENT_TIMESTAMP(6),
--         10,
--         0,
--         'expected_partner_investment'
--     );
-- LINKS TO RESULTS
INSERT INTO
    qa_indicators_meta (
        col_name,
        display_name,
        enable_comments,
        is_primay,
        include_general,
        include_detail,
        `order`,
        description,
        createdAt,
        updatedAt,
        indicatorId,
        is_core,
        indicator_slug
    )
VALUES
    (
        'link_to_results',
        '<h2>Link to results</h2>',
        0,
        0,
        0,
        1,
        44,
        '<h2>Link to results</h2>',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'link_to_results'
    ),
    (
        'linked_result',
        'Linked result(s)',
        1,
        0,
        1,
        1,
        45,
        'Linked result(s)',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'linked_result'
    ),
    (
        'results_from_previous_portfolio',
        'Results from previous portfolio',
        0,
        0,
        1,
        1,
        46,
        'Results from previous portfolio',
        CURRENT_TIMESTAMP(6),
        CURRENT_TIMESTAMP(6),
        10,
        0,
        'results_from_previous_portfolio'
    );