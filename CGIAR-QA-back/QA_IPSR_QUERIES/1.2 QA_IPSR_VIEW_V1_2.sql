SELECT
    'AR' AS phase_name,
    r.reported_year_id AS phase_year,
    'yes' AS included_AR,
    r.is_active AS is_active,
    r.status AS submitted,
    (
        SELECT
            s.created_date
        FROM
            prdb.submission s
        WHERE
            s.status = 1
            AND s.results_id = r.id
        ORDER BY
            created_date DESC
        LIMIT
            1
    ) AS submission_date,
    (
        SELECT
            ci.official_code
        FROM
            prdb.clarisa_initiatives ci
        WHERE
            rbi.inititiative_id = ci.id
    ) AS crp_id,
    r.id AS id,
    r.result_code AS result_code,
    (
        SELECT
            rl.name
        FROM
            prdb.result_level rl
        WHERE
            rl.id = r.result_level_id
    ) AS result_level,
    (
        SELECT
            rt.name
        FROM
            prdb.result_type rt
        WHERE
            rt.id = r.result_type_id
    ) AS result_type,
    (
        SELECT
            CONCAT(ci.official_code, ' - ', ci.name)
        FROM
            prdb.clarisa_initiatives ci
        WHERE
            rbi.inititiative_id = ci.id
    ) AS lead_initiative,
    (
        SELECT
            CONCAT(
                '<a href="https://prtest.ciat.cgiar.org/reports/result-details/',
                r2.result_code,
                '?phase=1">',
                r2.result_code,
                ' - ',
                r2.title,
                ' - ',
                ci2.official_code,
                '</a>'
            )
        FROM
            prdb.result r2
            JOIN prdb.results_by_inititiative rbi2 ON rbi2.result_id = r2.id
            JOIN prdb.clarisa_initiatives ci2 ON ci2.id = rbi2.inititiative_id
        WHERE
            r2.id = rbip.result_id
            AND rbi2.initiative_role_id = 1
    ) AS core_innovation,
    (
        SELECT
            IF(
                (r.geographic_scope_id = 3),
                'National',
                cgs.name
            )
        FROM
            prdb.clarisa_geographic_scope cgs
        WHERE
            cgs.id = r.geographic_scope_id
    ) AS geo_scope,
    IFNULL(
        CASE
            WHEN r.geographic_scope_id = 2 THEN (
                SELECT
                    GROUP_CONCAT(
                        DISTINCT CONCAT('• ', cr.name) SEPARATOR '<br>'
                    )
                FROM
                    prdb.clarisa_regions cr
                    INNER JOIN prdb.result_region rr ON rr.region_id = cr.um49Code
                WHERE
                    rr.result_id = r.id
                    AND rr.is_active = 1
            )
            WHEN (
                r.geographic_scope_id = 3
                OR r.geographic_scope_id = 4
            ) THEN (
                SELECT
                    GROUP_CONCAT(
                        DISTINCT CONCAT('• ', cc.name) SEPARATOR '<br>'
                    )
                FROM
                    prdb.clarisa_countries cc
                    JOIN prdb.result_country rc ON rc.country_id = cc.id
                WHERE
                    rc.result_id = r.id
                    AND rc.is_active = 1
            )
            WHEN r.geographic_scope_id = 5 THEN (
                SELECT
                    GROUP_CONCAT(
                        DISTINCT CONCAT(
                            '• ',
                            cc.name,
                            ' ',
                            (
                                SELECT
                                    GROUP_CONCAT(
                                        DISTINCT CONCAT(
                                            '(',
                                            rcsn.sub_level_one_name,
                                            CONCAT('; ', rcsn.sub_level_two_name),
                                            ')'
                                        )
                                    )
                                FROM
                                    prdb.result_countries_sub_national rcsn
                                WHERE
                                    rcsn.result_countries_id = rc.result_country_id
                                    AND rcsn.is_active = TRUE
                            )
                        ) SEPARATOR '<br>'
                    )
                FROM
                    prdb.clarisa_countries cc
                    INNER JOIN prdb.result_country rc ON rc.country_id = cc.id
                WHERE
                    rc.result_id = r.id
                    AND rc.is_active = 1
            )
            ELSE '<Not applicable>'
        END,
        'Data not provided.'
    ) AS geo_focus,
    r.reported_year_id AS reported_year,
    r.title,
    IFNULL(r.description, 'Data not provided.') AS description,
    IFNULL(
        (
            SELECT
                gtl.description
            FROM
                prdb.gender_tag_level gtl
            WHERE
                gtl.id = r.gender_tag_level_id
        ),
        'Data not provided.'
    ) AS gender_tag_level,
    IFNULL(
        (
            SELECT
                gtl.description
            FROM
                prdb.gender_tag_level gtl
            WHERE
                gtl.id = r.climate_change_tag_level_id
        ),
        'Data not provided.'
    ) AS climate_change_tag_level,
    IF ((r.is_krs = 1), 'Yes', 'No') AS is_krs,
    IFNULL (
        (
            SELECT
                CONCAT(
                    '<b>',
                    tl.name,
                    '</b>',
                    ' - ',
                    CONCAT(
                        '<b><a href="https://toc.mel.cgiar.org/toc/',
                        (
                            SELECT
                                i.toc_id
                            FROM
                                prdb.clarisa_initiatives i
                            WHERE
                                i.id = rbi.inititiative_id
                                AND active = 1
                        ),
                        '" target="_blank">',
                        'See ToC',
                        '</a></b>'
                    ),
                    '<br>',
                    '<b>Title: </b>',
                    tr.title,
                    '<br>',
                    IF(
                        (
                            tr.description IS NULL
                            OR tr.description = ''
                        ),
                        '',
                        CONCAT('<b>Description: </b>', tr.description)
                    )
                )
            FROM
                prdb.results_toc_result rtr
                JOIN prdb.toc_result tr On tr.toc_result_id = rtr.toc_result_id
                JOIN prdb.toc_level tl On tl.toc_level_id = tr.toc_level_id
            WHERE
                rtr.results_id = r.id
                AND rtr.initiative_id = rbi.inititiative_id
        ),
        'Data not provided.'
    ) AS lead_initiative_toc,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    DISTINCT '• ',
                    '<b>',
                    ci2.official_code,
                    '</b>',
                    ' - ',
                    ci2.name,
                    '<br>',
                    '<b>',
                    tl2.name,
                    '</b>',
                    ': ',
                    tr2.title SEPARATOR '<br>'
                )
            FROM
                prdb.results_toc_result rtr2
                JOIN prdb.clarisa_initiatives ci2 ON ci2.id = rtr2.initiative_id
                JOIN prdb.toc_result tr2 On tr2.toc_result_id = rtr2.toc_result_id
                JOIN prdb.toc_level tl2 On tl2.toc_level_id = tr2.toc_level_id
            WHERE
                rtr2.results_id = r.id
                AND rtr2.is_active = 1
                AND rtr2.initiative_id != rbi.inititiative_id
        ),
        '<Not applicable>'
    ) AS contributing_initiative,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '<b>Founder Name:</b> ',
                    cin.name,
                    '<br>',
                    '<b>Grant title:</b> ',
                    npp.grant_title SEPARATOR '<br><br>'
                )
            FROM
                prdb.non_pooled_project npp
                JOIN prdb.clarisa_institutions cin ON cin.id = npp.funder_institution_id
            WHERE
                npp.results_id = r.id
                AND npp.is_active = 1
                AND npp.non_pooled_project_type_id = 1
        ),
        '<Not applicable>'
    ) AS contributing_npp,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    DISTINCT CONCAT(
                        '• ',
                        '<b>Partner:</b> ',
                        cin2.acronym,
                        ' - ',
                        cin2.name,
                        '  -  ',
                        CONCAT (
                            '<b>Partners role(s): </b>',
                            (
                                SELECT
                                    GROUP_CONCAT(pdt.name SEPARATOR '; ')
                                FROM
                                    prdb.result_by_institutions_by_deliveries_type rbibd
                                    JOIN prdb.partner_delivery_type pdt ON pdt.id = rbibd.partner_delivery_type_id
                                WHERE
                                    rbibd.result_by_institution_id = rbin.id
                                    AND rbibd.is_active = 1
                            )
                        )
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.results_by_institution rbin
                JOIN prdb.clarisa_institutions cin2 ON cin2.id = rbin.institutions_id
            WHERE
                rbin.result_id = r.id
                AND rbin.is_active = 1
                AND rbin.institution_roles_id = 2
        ),
        '<Not applicable>'
    ) AS partners,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>',
                    ci.acronym,
                    '</b>',
                    ' - ',
                    ci.name,
                    IF((rc.is_primary = 1), ' <b>PRIMARY</b>', '') SEPARATOR '<br><br>'
                )
            FROM
                prdb.results_center rc
                JOIN prdb.clarisa_center cc ON cc.code = rc.center_id
                JOIN prdb.clarisa_institutions ci ON ci.id = cc.institutionId
            WHERE
                rc.result_id = r.id
                AND rc.is_active = 1
        ),
        'Data not provided.'
    ) AS contributing_centers,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    tr3.title,
                    IF(
                        (rieo.contributing_toc = 1),
                        ' <b>CONTRIBUTING EoI</b>',
                        ''
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_ip_eoi_outcomes rieo
                JOIN prdb.toc_result tr3 ON tr3.toc_result_id = rieo.toc_result_id
            WHERE
                rieo.result_by_innovation_package_id = rbip.result_by_innovation_package_id
                AND rieo.is_active = 1
        ),
        'Data not provided.'
    ) AS eoi_outcomes,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>',
                    caa.name,
                    '</b>',
                    ':  ',
                    caao.outcomeSMOcode,
                    ' - ',
                    caao.outcomeStatement SEPARATOR '<br>'
                )
            FROM
                prdb.result_ip_action_area_outcome ripa
                JOIN prdb.clarisa_action_area_outcome caao ON caao.id = ripa.action_area_outcome_id
                JOIN prdb.clarisa_action_area caa ON caa.id = caao.actionAreaId
            WHERE
                ripa.result_by_innovation_package_id = rbip.result_by_innovation_package_id
                AND ripa.is_active = 1
            ORDER BY
                caa.id
        ),
        'Data not provided.'
    ) AS aa_outcomes,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>',
                    cia.name,
                    '</b>',
                    ' - ',
                    cgt.target SEPARATOR '<br>'
                )
            FROM
                prdb.result_ip_impact_area_target riia
                JOIN prdb.clarisa_global_targets cgt ON cgt.targetId = riia.impact_area_indicator_id
                JOIN prdb.clarisa_impact_areas cia ON cia.id = cgt.impactAreaId
            WHERE
                riia.result_by_innovation_package_id = rbip.result_by_innovation_package_id
                AND riia.is_active = 1
            ORDER BY
                cgt.impactAreaId
        ),
        'Data not provided.'
    ) AS ia_outcomes,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>',
                    cst.sdg_target_code,
                    '</b>',
                    ' - ',
                    cst.sdg_target SEPARATOR '<br>'
                )
            FROM
                prdb.result_ip_sdg_targets rist
                JOIN prdb.clarisa_sdgs_targets cst ON cst.id = rist.clarisa_sdg_target_id
            WHERE
                rist.result_by_innovation_package_id = rbip.result_by_innovation_package_id
                AND rist.is_active = 1
            ORDER BY
                cst.sdg_target_code ASC
        ),
        'Data not provided.'
    ) AS sdgs,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>Actor: </b>',
                    aty.name,
                    IF(
                        (aty.actor_type_id = 5),
                        CONCAT(
                            ' ',
                            '(',
                            ra.other_actor_type,
                            ')'
                        ),
                        ''
                    ),
                    '<br>',
                    IF(
                        (ra.sex_and_age_disaggregation = 1),
                        CONCAT(
                            '<b>Sex and age disaggregation:</b> No',
                            '  -  ',
                            '<b>How many:</b> ',
                            ra.how_many
                        ),
                        CONCAT(
                            '<b>Sex and age disaggregation:</b> Yes',
                            '  -  ',
                            '<b>Total: </b>',
                            ra.how_many,
                            '<br>',
                            '<b>Women: </b>',
                            ra.women,
                            '  -  ',
                            '<b>Women youth: </b>',
                            ra.women_youth,
                            '<br>',
                            '<b>Men: </b>',
                            ra.men,
                            '  -  ',
                            '<b>Men youth: </b>',
                            ra.men_youth
                        )
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_actors ra
                JOIN prdb.actor_type aty ON aty.actor_type_id = ra.actor_type_id
            WHERE
                ra.result_id = r.id
                AND ra.is_active = 1
        ),
        '<Not applicable>'
    ) AS actors,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>Institution: </b>',
                    cit.name,
                    IF(
                        (rbit.institution_types_id = 78),
                        CONCAT(
                            ' ',
                            '(',
                            rbit.other_institution,
                            ')'
                        ),
                        ''
                    ),
                    '  -  ',
                    '<b>How many: </b>',
                    rbit.how_many SEPARATOR '<br>'
                )
            FROM
                prdb.results_by_institution_type rbit
                JOIN prdb.clarisa_institution_types cit ON cit.code = rbit.institution_types_id
            WHERE
                rbit.results_id = r.id
                AND rbit.is_active = 1
        ),
        '<Not applicable>'
    ) AS organizations,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>Unit of measure: </b>',
                    rim.unit_of_measure,
                    '  -  ',
                    '<b>Quantity: </b>',
                    rim.quantity SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_ip_measure rim
            WHERE
                rim.result_ip_id = r.id
                AND rim.is_active = 1
        ),
        '<Not applicable>'
    ) AS other_quantity,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<b>Partner: </b>',
                    cin3.name,
                    '  -  ',
                    CONCAT (
                        '<b>Partner role(s): </b>',
                        (
                            SELECT
                                GROUP_CONCAT(pdt.name SEPARATOR '; ')
                            FROM
                                prdb.result_by_institutions_by_deliveries_type rbibd
                                JOIN prdb.partner_delivery_type pdt ON pdt.id = rbibd.partner_delivery_type_id
                            WHERE
                                rbibd.result_by_institution_id = rbin2.id
                                AND rbibd.is_active = 1
                        )
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.results_by_institution rbin2
                JOIN prdb.clarisa_institutions cin3 ON cin3.id = rbin2.institutions_id
            WHERE
                rbin2.result_id = r.id
                AND rbin2.is_active = 1
                AND rbin2.institution_roles_id = 5
        ),
        'Data not provided.'
    ) AS specify_scaling_partners,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<a href="https://prtest.ciat.cgiar.org/reports/result-details/',
                    r2.result_code,
                    '?phase=1">',
                    '<b>',
                    r2.result_code,
                    '</b>',
                    ' - ',
                    r2.title,
                    ' - ',
                    '<b>',
                    ci3.official_code,
                    '</b>',
                    '</a>' SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_by_innovation_package rbip2
                JOIN prdb.result r2 ON r2.id = rbip2.result_id
                AND r2.result_type_id = 7
                JOIN prdb.results_by_inititiative rbi3 ON rbi3.result_id = r2.id
                AND rbi3.initiative_role_id = 1
                JOIN prdb.clarisa_initiatives ci3 ON ci3.id = rbi3.inititiative_id
            WHERE
                rbip2.result_innovation_package_id = r.id
                AND rbip2.ipsr_role_id = 2
                AND rbip2.is_active = 1
            ORDER BY
                r2.result_code DESC
        ),
        '<Not applicable>'
    ) AS existing_complementary_innovation,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '<b>Code: </b>',
                    r3.result_code,
                    '<br>',
                    '<b>Initiative: </b>',
                    ci4.official_code,
                    '<br>',
                    r3.title,
                    '<br>',
                    rcin.short_title,
                    '<br>',
                    r3.description,
                    '<br>',
                    IFNULL(
                        (
                            SELECT
                                CONCAT(
                                    '<b>Functions: </b>',
                                    '<br>',
                                    GROUP_CONCAT(
                                        '- ',
                                        cif.name SEPARATOR '<br>'
                                    )
                                )
                            FROM
                                prdb.results_complementary_innovations_function rcif
                                JOIN prdb.complementary_innovation_functions cif ON cif.complementary_innovation_functions_id = rcif.complementary_innovation_function_id
                            WHERE
                                rcif.result_complementary_innovation_id = rcin.result_complementary_innovation_id
                                AND rcif.is_active = 1
                        ),
                        '<b>Functions: </b> Not provided.'
                    ),
                    '<br>',
                    IF (
                        (
                            rcin.other_funcions IS NULL
                            OR rcin.other_funcions = ''
                        ),
                        '<b>Other functions: </b> Not provided.<br>',
                        CONCAT(
                            '<b>Other functions: </b>',
                            rcin.other_funcions,
                            '<br>'
                        )
                    )
                )
            FROM
                prdb.result_by_innovation_package rbip3
                JOIN prdb.result r3 ON r3.id = rbip3.result_id
                AND r3.result_type_id = 11
                JOIN prdb.results_by_inititiative rbi4 ON rbi4.result_id = r3.id
                AND rbi4.initiative_role_id = 1
                JOIN prdb.clarisa_initiatives ci4 ON ci4.id = rbi4.inititiative_id
                JOIN prdb.results_complementary_innovation rcin ON rcin.result_id = r3.id
                AND rcin.is_active = 1
            WHERE
                rbip3.result_innovation_package_id = r.id
                AND rbip3.ipsr_role_id = 2
                AND rbip3.is_active = 1
            ORDER BY
                r3.result_code DESC
        ),
        '<Not applicable>'
    ) AS new_complementary_innovation,
    IF (
        rip.is_expert_workshop_organized = 1,
        IFNULL(
            (
                SELECT
                    e4.link
                FROM
                    prdb.evidence e4
                WHERE
                    e4.result_id = r.id
                    AND e4.is_active = 1
                    AND e4.evidence_type_id = 5
            ),
            '<Not applicable>'
        ),
        '<Not applicable>'
    ) AS workshop_list_of_participants,
    IF(
        rip.is_expert_workshop_organized = 1,
        (
            CASE
                WHEN (rip.assessed_during_expert_workshop_id = 1) THEN(
                    CONCAT(
                        '<b>',
                        (
                            SELECT
                                adew.name
                            FROM
                                prdb.assessed_during_expert_workshop adew
                            WHERE
                                adew.id = rip.assessed_during_expert_workshop_id
                        ),
                        '</b>',
                        '<br><br>',
                        (
                            SELECT
                                GROUP_CONCAT(
                                    '• ',
                                    IF(
                                        (rbip5.ipsr_role_id = 1),
                                        '<b>Core innovation</b>',
                                        '<b>Complementary innovation / enabler / solution</b>'
                                    ),
                                    '<br>',
                                    r6.result_code,
                                    ' - ',
                                    r6.title,
                                    '<br><br>',
                                    'Current situation (now)',
                                    '<br>',
                                    '<b>Innovation readiness: </b>',
                                    'Level ',
                                    cirl3.level,
                                    ': ',
                                    cirl3.name,
                                    ' - ',
                                    cirl3.definition,
                                    '<br>',
                                    '<b>Innovation use: </b>',
                                    'Level ',
                                    ciul3.level,
                                    ': ',
                                    ciul3.name,
                                    ' - ',
                                    ciul3.definition SEPARATOR '<br><br>'
                                )
                            FROM
                                prdb.result_by_innovation_package rbip5
                                JOIN prdb.result r6 ON r6.id = rbip5.result_id
                                JOIN prdb.clarisa_innovation_readiness_level cirl3 ON cirl3.id = rbip5.current_innovation_readiness_level
                                JOIN prdb.clarisa_innovation_use_levels ciul3 ON ciul3.id = rbip5.current_innovation_use_level
                            WHERE
                                rbip5.result_innovation_package_id = rip.result_innovation_package_id
                                AND rbip5.is_active = 1
                        )
                    )
                )
                WHEN (rip.assessed_during_expert_workshop_id = 2) THEN(
                    CONCAT(
                        (
                            SELECT
                                adew2.name
                            FROM
                                prdb.assessed_during_expert_workshop adew2
                            WHERE
                                adew2.id = rip.assessed_during_expert_workshop_id
                        ),
                        '<br>',
                        (
                            SELECT
                                GROUP_CONCAT(
                                    '• ',
                                    IF(
                                        (rbip6.ipsr_role_id = 1),
                                        '<b>Core innovation</b>',
                                        '<b>Complementary innovation / enabler / solution</b>'
                                    ),
                                    '<br>',
                                    r7.result_code,
                                    ' - ',
                                    r7.title,
                                    '<br><br>',
                                    'Current situation (now)',
                                    '<br>',
                                    '<b>Innovation readiness: </b>',
                                    'Level ',
                                    cirl4.level,
                                    ': ',
                                    cirl4.name,
                                    ' - ',
                                    cirl4.definition,
                                    '<br>',
                                    '<b>Innovation use: </b>',
                                    'Level ',
                                    ciul4.level,
                                    ': ',
                                    ciul4.name,
                                    ' - ',
                                    ciul4.definition,
                                    '<br><br>',
                                    'Potential situation (12 months later)',
                                    '<br>',
                                    '<b>Innovation readiness: </b>',
                                    'Level ',
                                    cirl5.level,
                                    ': ',
                                    cirl5.name,
                                    ' - ',
                                    cirl5.definition,
                                    '<br>',
                                    '<b>Innovation use: </b>',
                                    'Level ',
                                    ciul5.level,
                                    ': ',
                                    ciul5.name,
                                    ' - ',
                                    ciul5.definition SEPARATOR '<br><br>'
                                )
                            FROM
                                prdb.result_by_innovation_package rbip6
                                JOIN prdb.result r7 ON r7.id = rbip6.result_id
                                JOIN prdb.clarisa_innovation_readiness_level cirl4 ON cirl4.id = rbip6.current_innovation_readiness_level
                                JOIN prdb.clarisa_innovation_readiness_level cirl5 ON cirl5.id = rbip6.potential_innovation_readiness_level
                                JOIN prdb.clarisa_innovation_use_levels ciul4 ON ciul4.id = rbip6.current_innovation_use_level
                                JOIN prdb.clarisa_innovation_use_levels ciul5 ON ciul5.id = rbip6.potential_innovation_use_level
                            WHERE
                                rbip6.result_innovation_package_id = rip.result_innovation_package_id
                                AND rbip6.is_active = 1
                        )
                    )
                )
                ELSE 'Nothing was evaluated during the expert workshop'
            END
        ),
        '<Not applicable>'
    ) AS what_was_assessed_during_the_workshop,
    IFNULL(
        (
            CONCAT(
                IF(
                    (rbip.readiness_level_evidence_based = 11),
                    '<b>Innovation Readiness level evidence-based: </b>The innovation is at idea stage.',
                    (
                        CONCAT(
                            '<b>Innovation Readiness level evidence-based: </b>',
                            (
                                SELECT
                                    CONCAT(
                                        'Level ',
                                        cirl.level,
                                        ': ',
                                        cirl.name,
                                        ' - ',
                                        cirl.definition
                                    )
                                FROM
                                    prdb.clarisa_innovation_readiness_level cirl
                                WHERE
                                    cirl.id = rbip.readiness_level_evidence_based
                            ),
                            '<br>',
                            '<b>Readiness evidence link: </b>',
                            rbip.readinees_evidence_link,
                            IF(
                                (
                                    rbip.readiness_details_of_evidence IS NULL
                                    OR rbip.readiness_details_of_evidence = ''
                                ),
                                '',
                                CONCAT(
                                    '<br><b>Details of readiness evidence: </b>',
                                    rbip.readiness_details_of_evidence
                                )
                            )
                        )
                    )
                ),
                '<br><br>',
                IF(
                    (rbip.use_level_evidence_based = 11),
                    '<b>Innovation use level evidence-based: </b>Innovation is not used.',
                    (
                        CONCAT(
                            '<b>Innovation Use level evidence-based: </b>',
                            (
                                SELECT
                                    CONCAT(
                                        'Level ',
                                        ciul.level,
                                        ': ',
                                        ciul.name,
                                        ' - ',
                                        ciul.definition
                                    )
                                FROM
                                    prdb.clarisa_innovation_use_levels ciul
                                WHERE
                                    ciul.id = rbip.use_level_evidence_based
                            ),
                            '<br>',
                            '<b>Use evidence link: </b>',
                            rbip.use_evidence_link,
                            IF(
                                (
                                    rbip.use_details_of_evidence IS NULL
                                    OR rbip.use_details_of_evidence = ''
                                ),
                                '',
                                CONCAT(
                                    '<br><b>Details of use evidence: </b>',
                                    rbip.use_details_of_evidence
                                )
                            )
                        )
                    )
                )
            )
        ),
        'Data not provided.'
    ) AS core_innovation_evidence_based_assessment,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    r4.result_code,
                    ' - ',
                    r4.title,
                    '<br>',
                    IF(
                        (rbip4.readiness_level_evidence_based = 11),
                        '<b>Innovation Readiness level evidence-based: </b>The innovation is at idea stage.',
                        (
                            CONCAT(
                                '<b>Innovation Readiness level evidence-based: </b>',
                                (
                                    SELECT
                                        CONCAT(
                                            'Level ',
                                            cirl2.level,
                                            ': ',
                                            cirl2.name,
                                            ' - ',
                                            cirl2.definition
                                        )
                                    FROM
                                        prdb.clarisa_innovation_readiness_level cirl2
                                    WHERE
                                        cirl2.id = rbip4.readiness_level_evidence_based
                                ),
                                '<br>',
                                '<b>Readiness evidence link: </b>',
                                rbip4.readinees_evidence_link,
                                IF(
                                    (
                                        rbip4.readiness_details_of_evidence IS NULL
                                        OR rbip4.readiness_details_of_evidence = ''
                                    ),
                                    '',
                                    CONCAT(
                                        '<br><b>Details of readiness evidence: </b>',
                                        rbip4.readiness_details_of_evidence
                                    )
                                )
                            )
                        )
                    ),
                    '<br><br>',
                    IF(
                        (rbip4.use_level_evidence_based = 11),
                        '<b>Innovation use level evidence-based: </b>Innovation is not used.',
                        (
                            CONCAT(
                                '<b>Innovation Use level evidence-based: </b>',
                                (
                                    SELECT
                                        CONCAT(
                                            'Level ',
                                            ciul2.level,
                                            ': ',
                                            ciul2.name,
                                            ' - ',
                                            ciul2.definition
                                        )
                                    FROM
                                        prdb.clarisa_innovation_use_levels ciul2
                                    WHERE
                                        ciul2.id = rbip4.use_level_evidence_based
                                ),
                                '<br>',
                                '<b>Use evidence link: </b>',
                                rbip4.use_evidence_link,
                                IF(
                                    (
                                        rbip4.use_details_of_evidence IS NULL
                                        OR rbip4.use_details_of_evidence = ''
                                    ),
                                    '',
                                    CONCAT(
                                        '<br><b>Details of use evidence: </b>',
                                        rbip4.use_details_of_evidence
                                    )
                                )
                            )
                        )
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_by_innovation_package rbip4
                JOIN prdb.result r4 ON r4.id = rbip4.result_id
            WHERE
                rbip4.result_innovation_package_id = r.id
                AND rbip4.ipsr_role_id = 2
                AND rbip4.is_active = 1
        ),
        'Data not provided.'
    ) AS complementary_innovation_evidence_based_assessment,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<b>Actor: </b>',
                    (
                        SELECT
                            at2.name
                        FROM
                            prdb.actor_type at2
                        WHERE
                            at2.actor_type_id = rira.actor_type_id
                    ),
                    IF(
                        (rira.actor_type_id = 5),
                        CONCAT(
                            ' ',
                            '(',
                            rira.other_actor_type,
                            ')'
                        ),
                        ''
                    ),
                    '<br>',
                    IF(
                        (rira.sex_and_age_disaggregation = 1),
                        CONCAT(
                            '<b>Sex and age disaggregation:</b> No',
                            '  -  ',
                            '<b>How many:</b> ',
                            rira.how_many,
                            '<br>',
                            '<b>Evidence link: </b>',
                            rira.evidence_link
                        ),
                        CONCAT(
                            '<b>Sex and age disaggregation:</b> Yes',
                            '  -  ',
                            '<b>Total: </b>',
                            rira.how_many,
                            '<br>',
                            '<b>Women: </b>',
                            rira.women,
                            '  -  ',
                            '<b>Women youth: </b>',
                            rira.women_youth,
                            '<br>',
                            '<b>Men: </b>',
                            rira.men,
                            '  -  ',
                            '<b>Men youth: </b>',
                            rira.men_youth,
                            '<br>',
                            '<b>Evidence link: </b>',
                            rira.evidence_link
                        )
                    ) SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_ip_result_actors rira
            WHERE
                rira.result_ip_result_id = rbip.result_by_innovation_package_id
                AND rira.is_active = 1
        ),
        '<Not applicable>'
    ) AS core_innovation_actors,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<b>Organization: </b>',
                    cit2.name,
                    IF(
                        (ririt.institution_types_id = 78),
                        CONCAT(
                            ' ',
                            '(',
                            ririt.other_institution,
                            ')'
                        ),
                        ''
                    ),
                    '  -  ',
                    '<b>How many: </b>',
                    ririt.how_many,
                    '<br>',
                    '<b>Evidence link: </b>',
                    ririt.evidence_link SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_ip_result_institution_types ririt
                JOIN prdb.clarisa_institution_types cit2 ON cit2.code = ririt.institution_types_id
            WHERE
                ririt.result_ip_results_id = rbip.result_by_innovation_package_id
                AND ririt.is_active = 1
        ),
        '<Not applicable>'
    ) AS core_innovation_organizations,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<b>Unit of measure: </b>',
                    rirm.unit_of_measure,
                    '  -  ',
                    '<b>Quantity: </b>',
                    rirm.quantity,
                    '<br>',
                    '<b>Evidence link: </b>',
                    rirm.evidence_link SEPARATOR '<br><br>'
                )
            FROM
                prdb.result_ip_result_measures rirm
            WHERE
                rirm.result_ip_result_id = rbip.result_by_innovation_package_id
                AND rirm.is_active = 1
        ),
        '<Not applicable>'
    ) AS core_innovation_measures,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    '<a href="https://prtest.ciat.cgiar.org/reports/result-details/',
                    r5.result_code,
                    '?phase=1">',
                    '<b>',
                    r5.result_code,
                    '</b>',
                    ' - ',
                    r5.title,
                    '</a>',
                    '<br>',
                    '<b>Result type: </b>',
                    rt2.name SEPARATOR '<br><br>'
                )
            FROM
                prdb.linked_result lr
                JOIN prdb.result r5 ON r5.id = lr.linked_results_id
                JOIN prdb.result_type rt2 ON rt2.id = r5.result_type_id
            WHERE
                lr.origin_result_id = r.id
                AND lr.is_active = 1
        ),
        '<Not applicable>'
    ) AS linked_result,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '• ',
                    lr2.legacy_link SEPARATOR '<br><br>'
                )
            FROM
                prdb.linked_result lr2
            WHERE
                lr2.origin_result_id = r.id
                AND lr2.is_active = 1
        ),
        '<Not applicable>'
    ) AS results_from_previous_portfolio
FROM
    prdb.result r
    LEFT JOIN prdb.result_innovation_package rip ON rip.result_innovation_package_id = r.id
    AND rip.is_active = TRUE
    LEFT JOIN prdb.result_by_innovation_package rbip ON rbip.result_innovation_package_id = rip.result_innovation_package_id
    AND rbip.ipsr_role_id = 1
    LEFT JOIN prdb.results_by_inititiative rbi ON rbi.result_id = r.id
    AND rbi.initiative_role_id = 1
WHERE
    r.is_active = 1
    AND r.result_type_id = 10
ORDER BY
    r.result_code DESC;