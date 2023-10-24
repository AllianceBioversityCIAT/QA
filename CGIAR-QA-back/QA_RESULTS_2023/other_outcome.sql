SELECT
    DISTINCT r.id AS id,
    (
        SELECT
            ci.official_code
        FROM
            prdb.clarisa_initiatives ci
        WHERE
            rbi.inititiative_id = ci.id
    ) AS crp_id,
    'AR' AS phase_name,
    r.reported_year_id AS phase_year,
    'yes' AS included_AR,
    r.is_active AS is_active,
    r.status_id AS submitted,
    r.is_replicated AS is_replicated,
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
    IF(
        (r.is_replicated = 0),
        'New Result',
        'Updated Result'
    ) AS new_or_updated_result,
    r.title,
    IFNULL(r.description, 'Data not provided.') AS description,
    (
        SELECT
            CONCAT(
                gtl.description,
                ': ',
                IF(
                    (e.gender_related = 1),
                    CONCAT(
                        '<a href="',
                        e.link,
                        '" target="_blank">',
                        'See Gender evidence',
                        '</a>'
                    ),
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.gender_tag_level_id
    ) AS gender_tag_level,
    (
        SELECT
            CONCAT(
                gtl.description,
                ': ',
                IF(
                    (e.youth_related = 1),
                    CONCAT(
                        '<a href="',
                        e.link,
                        '" target="_blank">',
                        'See Climate evidence',
                        '</a>'
                    ),
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.climate_change_tag_level_id
    ) AS climate_change_level,
    (
        SELECT
            CONCAT(
                gtl.description,
                ': ',
                IF(
                    (e.nutrition_related = 1),
                    CONCAT(
                        '<a href="',
                        e.link,
                        '" target="_blank">',
                        'See Nutrition evidence',
                        '</a>'
                    ),
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.nutrition_tag_level_id
    ) AS nutrition_tag_level,
    (
        SELECT
            CONCAT(
                gtl.description,
                ': ',
                IF(
                    (e.environmental_biodiversity_related = 1),
                    CONCAT(
                        '<a href="',
                        e.link,
                        '" target="_blank">',
                        'See Enviromental evidence',
                        '</a>'
                    ),
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.environmental_biodiversity_tag_level_id
    ) AS environmental_biodiversity_tag_level,
    (
        SELECT
            CONCAT(
                gtl.description,
                ': ',
                IF(
                    (e.poverty_related = 1),
                    CONCAT(
                        '<a href="',
                        e.link,
                        '" target="_blank">',
                        'See Poverty evidence',
                        '</a>'
                    ),
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.poverty_tag_level_id
    ) AS poverty_tag_level,
    IF (
        r.result_level_id = 4,
        '<Not applicable>',
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    ci.name,
                    '<br>',
                    '<b>Actor type(s): </b>',
                    cit.name,
                    '<br>',
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.results_by_institution rbi3
                LEFT JOIN prdb.clarisa_institutions ci ON rbi3.institutions_id = ci.id
                INNER JOIN prdb.clarisa_institution_types cit ON ci.institution_type_code = cit.code
            WHERE
                rbi3.result_id = r.id
                AND rbi3.is_active = 1
                AND rbi3.institution_roles_id = 1
        )
    ) AS actors,
    (
        SELECT
            GROUP_CONCAT(
                '<li>',
                (
                    SELECT
                        GROUP_CONCAT(
                            '<b>',
                            ci2.official_code,
                            ' - ',
                            ci2.short_name,
                            '</b>',
                            ' - ',
                            ci2.name
                        )
                    FROM
                        prdb.clarisa_initiatives ci2
                    WHERE
                        rbi2.inititiative_id = ci2.id
                ),
                IF (
                    rbi2.initiative_role_id = 1,
                    '   <b>PRIMARY SUBMITTER</b>',
                    ''
                ),
                '</li>' SEPARATOR '<br>'
            )
        FROM
            prdb.results_by_inititiative rbi2
        WHERE
            rbi2.result_id = r.id
            AND rbi2.is_active = 1
    ) AS contributing_initiatives,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    'Founder name: ',
                    (
                        SELECT
                            CONCAT(
                                '<b>',
                                ci.acronym,
                                ' - ',
                                ci.name,
                                '</b>'
                            )
                        FROM
                            prdb.clarisa_institutions ci
                        WHERE
                            ci.id = npp.funder_institution_id
                    ),
                    '<br>',
                    'Title: ',
                    '<b>',
                    npp.grant_title,
                    '</b>',
                    '<br>',
                    'Center grant ID: ',
                    '<b>',
                    npp.center_grant_id,
                    '</b>',
                    '<br>',
                    'Lead/Contract center: ',
                    (
                        SELECT
                            CONCAT(
                                '<b>',
                                ci3.acronym,
                                ' - ',
                                ci3.name,
                                '</b>'
                            )
                        FROM
                            prdb.clarisa_center cc
                            LEFT JOIN prdb.clarisa_institutions ci3 ON ci3.id = cc.institutionId
                        WHERE
                            cc.code = npp.lead_center_id
                    ),
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.non_pooled_project npp
            WHERE
                npp.results_id = r.id
                AND npp.is_active = 1
        ),
        '<Not applicable>'
    ) AS contributing_non_pooled_project,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<b>',
                    ci9.acronym,
                    '</b>',
                    ' - ',
                    ci9.name,
                    '</li>' SEPARATOR ' '
                )
            FROM
                prdb.results_center rc9
                LEFT JOIN prdb.clarisa_center cc9 ON rc9.center_id = cc9.code
                LEFT JOIN prdb.clarisa_institutions ci9 ON ci9.id = cc9.institutionId
            WHERE
                rc9.result_id = r.id
                AND rc9.is_active = 1
        ),
        'Data not provided.'
    ) AS contributing_centers,
    IF (
        r.result_level_id = 1
        OR r.result_level_id = 2,
        '<Not applicable>',
        (
            SELECT
                GROUP_CONCAT(
                    '<b><a href="https://toc.mel.cgiar.org/toc/',
                    (
                        SELECT
                            i.toc_id
                        FROM
                            prdb.clarisa_initiatives i
                        WHERE
                            i.id = rbi.inititiative_id
                    ),
                    '" target="_blank">',
                    'See ToC',
                    '</a></b>',
                    '<br>',
                    (
                        SELECT
                            CONCAT(
                                '<b>',
                                wp.acronym,
                                '</b>',
                                ' - ',
                                wp.name
                            )
                        FROM
                            Integration_information.work_packages wp
                        WHERE
                            wp.id = tr.work_packages_id
                    ),
                    '<br>',
                    '<b>Title: </b>',
                    tr.result_title,
                    '<br>',
                    IF(
                        (
                            tr.result_description IS NULL
                            OR tr.result_description = ''
                        ),
                        '',
                        CONCAT('<b>Description: </b>', tr.result_description)
                    ) SEPARATOR '<br>'
                )
            FROM
                `Integration_information`.toc_results tr
                LEFT JOIN prdb.results_toc_result rtr ON rtr.results_id = r.id
                AND rtr.is_active = 1
            WHERE
                tr.id = rtr.toc_result_id
        )
    ) AS toc_planned,
    IFNULL(
        IF(
            r.result_level_id != 1,
            (
                SELECT
                    GROUP_CONCAT(
                        (
                            SELECT
                                CONCAT(
                                    '<b>',
                                    caa.name,
                                    '</b>'
                                )
                            FROM
                                prdb.clarisa_action_area caa
                            WHERE
                                caa.id = caao.actionAreaId
                        ),
                        ' (',
                        caao.outcomeSMOcode,
                        ')',
                        ' - ',
                        caao.outcomeStatement SEPARATOR '<br>'
                    )
                FROM
                    prdb.result_toc_action_area rtaa
                    LEFT JOIN prdb.clarisa_action_area_outcome caao ON caao.id = rtaa.action_area_outcome
                    LEFT JOIN prdb.results_toc_result rtr ON rtr.results_id = r.id
                    AND rtr.is_active = 1
                WHERE
                    rtaa.result_toc_result_id = rtr.result_toc_result_id
                    AND rtaa.is_active = 1
            ),
            NULL
        ),
        '<Not applicable>'
    ) AS action_area,
    IFNULL (
        IF (
            r.result_level_id = 1
            OR r.result_level_id = 2,
            (
                SELECT
                    GROUP_CONCAT(
                        (
                            SELECT
                                CONCAT(
                                    '<b>',
                                    cia.name,
                                    '</b>'
                                )
                            FROM
                                prdb.clarisa_impact_areas cia
                            WHERE
                                cia.id = cgt.impactAreaId
                        ),
                        ' - ',
                        cgt.target SEPARATOR '<br>'
                    )
                FROM
                    prdb.results_impact_area_target riat
                    LEFT JOIN prdb.clarisa_global_targets cgt ON cgt.targetId = riat.impact_area_target_id
                WHERE
                    riat.result_id = r.id
                    AND riat.is_active = 1
            ),
            (
                SELECT
                    GROUP_CONCAT(
                        (
                            SELECT
                                CONCAT(
                                    '<b>',
                                    cia.name,
                                    '</b>'
                                )
                            FROM
                                prdb.clarisa_impact_areas cia
                            WHERE
                                cia.id = cgt.impactAreaId
                        ),
                        ' - ',
                        cgt.target SEPARATOR '<br>'
                    )
                FROM
                    prdb.result_toc_impact_area_target rtiat
                    LEFT JOIN prdb.clarisa_global_targets cgt ON cgt.targetId = rtiat.impact_area_indicator_id
                    LEFT JOIN prdb.results_toc_result rtr ON rtr.results_id = r.id
                    AND rtr.is_active = 1
                WHERE
                    rtiat.result_toc_result_id = rtr.result_toc_result_id
                    AND rtiat.is_active = 1
            )
        ),
        '<Not applicable>'
    ) AS impact_area_targets,
    IFNULL (
        IF (
            r.result_level_id = 1
            OR r.result_level_id = 2,
            (
                SELECT
                    GROUP_CONCAT(
                        '<b>',
                        cst.sdg_target_code,
                        '</b>',
                        ' - ',
                        cst.sdg_target SEPARATOR '<br>'
                    )
                FROM
                    prdb.result_sdg_targets rst
                    LEFT JOIN prdb.clarisa_sdgs_targets cst ON rst.clarisa_sdg_target_id = cst.id
                WHERE
                    rst.result_id = r.id
                    AND rst.is_active = 1
            ),
            (
                SELECT
                    GROUP_CONCAT(
                        '<b>',
                        cst.sdg_target_code,
                        '</b>',
                        ' - ',
                        cst.sdg_target SEPARATOR '<br>'
                    )
                FROM
                    prdb.result_toc_sdg_targets rtst
                    LEFT JOIN prdb.clarisa_sdgs_targets cst ON rtst.clarisa_sdg_target_id = cst.id
                    LEFT JOIN prdb.results_toc_result rtr ON rtr.results_id = r.id
                    AND rtr.is_active = 1
                WHERE
                    rtst.result_toc_result_id = rtr.result_toc_result_id
                    AND rtst.is_active = 1
            )
        ),
        '<Not applicable>'
    ) AS sdg,
    IF (
        r.no_applicable_partner = 1,
        '<Not applicable>',
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    ci.name,
                    '<br>',
                    '<b>Institution type: </b>',
                    cit.name,
                    '<br>',
                    '<b>Role: </b>',
                    (
                        SELECT
                            GROUP_CONCAT(
                                pdt.name SEPARATOR '; '
                            )
                        FROM
                            prdb.result_by_institutions_by_deliveries_type rbibd
                            LEFT JOIN prdb.partner_delivery_type pdt ON pdt.id = rbibd.partner_delivery_type_id
                        WHERE
                            rbibd.result_by_institution_id = rbi3.id
                            AND rbibd.is_active = 1
                    ),
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.results_by_institution rbi3
                LEFT JOIN prdb.clarisa_institutions ci ON rbi3.institutions_id = ci.id
                INNER JOIN prdb.clarisa_institution_types cit ON ci.institution_type_code = cit.code
            WHERE
                rbi3.result_id = r.id
                AND rbi3.is_active = 1
                AND rbi3.institution_roles_id = 2
        )
    ) AS partners,
    (
        SELECT
            cgs.name
        FROM
            prdb.clarisa_geographic_scope cgs
        WHERE
            r.geographic_scope_id = cgs.id
    ) AS geographic_focus,
    IF (
        r.has_regions = 1,
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    cr.name,
                    '</li>' SEPARATOR ' '
                )
            FROM
                prdb.result_region rg
                LEFT JOIN prdb.clarisa_regions cr ON rg.region_id = cr.um49Code
            WHERE
                rg.result_id = r.id
                AND rg.is_active = 1
        ),
        '<Not applicable>'
    ) AS regions,
    IF (
        r.has_countries = 1,
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    cc.name,
                    '</li>' SEPARATOR ' '
                )
            FROM
                prdb.result_country rc
                LEFT JOIN prdb.clarisa_countries cc ON rc.country_id = cc.id
            WHERE
                rc.result_id = r.id
                AND rc.is_active = 1
        ),
        '<Not applicable>'
    ) AS countries,
    IFNULL (
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<b>',
                    'Result: ',
                    '<a href="https://prtest.ciat.cgiar.org/result/result-detail/',
                    r2.result_code,
                    '?phase=',
                    r2.version_id,
                    '">',
                    r2.result_code,
                    '</a>',
                    (
                        SELECT
                            CONCAT(
                                ' (',
                                rt.name,
                                ')'
                            )
                        FROM
                            prdb.result_type rt
                        WHERE
                            rt.id = r2.result_type_id
                    ),
                    ' - ',
                    'Status: ',
                    '</b>',
                    (
                        SELECT
                            rs.status_name
                        FROM
                            prdb.result_status rs
                        WHERE
                            rs.result_status_id = r2.status_id
                    ),
                    ' ',
                    '<b>',
                    'Phase: ',
                    '</b>',
                    (
                        SELECT
                            v.phase_name
                        FROM
                            prdb.version v
                        WHERE
                            v.id = r2.version_id
                    ),
                    '<br>',
                    '<b>',
                    r2.title,
                    '</b>',
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.linked_result lr
                LEFT JOIN prdb.result r2 ON lr.linked_results_id = r2.id
            WHERE
                lr.origin_result_id = r.id
                AND lr.is_active = 1
                AND lr.legacy_link IS NULL
        ),
        '<Not applicable>'
    ) AS linked_results,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<a href="',
                    lr.legacy_link,
                    '" target="_blank">',
                    lr.legacy_link,
                    '</a>',
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.linked_result lr
            WHERE
                lr.origin_result_id = r.id
                AND lr.is_active = 1
                AND lr.legacy_link IS NOT NULL
        ),
        '<Not applicable>'
    ) AS previous_portfolio
FROM
    prdb.result r
    LEFT JOIN prdb.results_by_inititiative rbi ON rbi.result_id = r.id
    AND rbi.initiative_role_id = 1
    LEFT JOIN prdb.evidence e ON e.result_id = r.id
    AND e.is_active = 1
WHERE
    r.is_active = 1
    AND rbi.is_active = 1
    AND r.result_type_id = 4
    AND r.version_id IN (
        SELECT
            id
        FROM
            prdb.version v1
        WHERE
            v1.phase_year = 2023
            AND v1.phase_name LIKE '%Reporting%'
            AND v1.is_active = 1
    )
ORDER BY
    r.result_code DESC;