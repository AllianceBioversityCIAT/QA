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
         (
        SELECT
            v1.phase_year
        FROM
            prdb.version v1
        WHERE
            r.version_id = v1.id
    ) AS phase_year,
    'yes' AS included_AR,
    r.is_active AS is_active,
    r.status_id AS submitted,
    r.version_id AS version,
    r.is_replicated AS is_replicated,
    r.in_qa AS in_qa,
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
                '<br>',
                IFNULL(
                    (
                        SELECT
                            GROUP_CONCAT(
                                '<a href="',
                                e1.link,
                                '" target="_blank">',
                                e1.link,
                                '</a>' SEPARATOR '<br>'
                            )
                        FROM
                            prdb.evidence e1
                        WHERE
                            e1.result_id = r.id
                            AND e1.is_active = 1
                            AND e1.gender_related = 1
                    ),
                    ''
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
                '<br>',
                IFNULL(
                    (
                        SELECT
                            GROUP_CONCAT(
                                '<a href="',
                                e1.link,
                                '" target="_blank">',
                                e1.link,
                                '</a>' SEPARATOR '<br>'
                            )
                        FROM
                            prdb.evidence e1
                        WHERE
                            e1.result_id = r.id
                            AND e1.is_active = 1
                            AND e1.youth_related = 1
                    ),
                    ''
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
                '<br>',
                IFNULL(
                    (
                        SELECT
                            GROUP_CONCAT(
                                '<a href="',
                                e1.link,
                                '" target="_blank">',
                                e1.link,
                                '</a>' SEPARATOR '<br>'
                            )
                        FROM
                            prdb.evidence e1
                        WHERE
                            e1.result_id = r.id
                            AND e1.is_active = 1
                            AND e1.nutrition_related = 1
                    ),
                    ''
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
                '<br>',
                IFNULL(
                    (
                        SELECT
                            GROUP_CONCAT(
                                '<a href="',
                                e1.link,
                                '" target="_blank">',
                                e1.link,
                                '</a>' SEPARATOR '<br>'
                            )
                        FROM
                            prdb.evidence e1
                        WHERE
                            e1.result_id = r.id
                            AND e1.is_active = 1
                            AND e1.environmental_biodiversity_related = 1
                    ),
                    ''
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
                '<br>',
                IFNULL(
                    (
                        SELECT
                            GROUP_CONCAT(
                                '<a href="',
                                e1.link,
                                '" target="_blank">',
                                e1.link,
                                '</a>' SEPARATOR '<br>'
                            )
                        FROM
                            prdb.evidence e1
                        WHERE
                            e1.result_id = r.id
                            AND e1.is_active = 1
                            AND e1.poverty_related = 1
                    ),
                    ''
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.poverty_tag_level_id
    ) AS poverty_tag_level,
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
                CONCAT(
                    IF(
                        (
                            SELECT
                                COUNT(1)
                            FROM
                                `Integration_information`.toc_results tr
                                LEFT JOIN prdb.results_toc_result rtr ON rtr.toc_result_id = tr.id
                            WHERE
                                rtr.results_id = r.id
                                AND rtr.is_active = 1
                                AND tr.result_type = 3
                        ) > 0,
                        CONCAT(
                            '<div style="background-color: #3AABA0; color: #ffffff; ',
                            'border: 1px solid #c8e6c9; padding: 8px; ',
                            'border-radius: 6px; margin-bottom: 10px; ',
                            'font-family: Arial, sans-serif; font-size: 14px;">',
                            '<b>EOI Outcome map</b></div><br>'
                        ),
                        ''
                    ),
                    GROUP_CONCAT(
                        '<li>',
                        ci9.official_code,
                        ' - ',
                        ci9.name,
                        '<br>',
                        '<b><a href="https://toc.mel.cgiar.org/toc/',
                        ci9.toc_id,
                        '" target="_blank" style="text-decoration: none; color: #1976d2;">See ToC</a></b><br>',
                        IFNULL(
                            (
                                SELECT
                                    CONCAT('<b>', wp.acronym, '</b> - ', wp.name)
                                FROM
                                    Integration_information.work_packages wp
                                WHERE
                                    wp.id = tr.work_packages_id
                            ),
                            ''
                        ),
                        '<br><b>Title: </b>',
                        tr.result_title,
                        '<br>',
                        IF(
                            tr.result_description IS NULL
                            OR tr.result_description = '',
                            '',
                            CONCAT('<b>Description: </b>', tr.result_description)
                        ),
                        '</li>' SEPARATOR '<br>'
                    )
                )
            FROM
                `Integration_information`.toc_results tr
                LEFT JOIN prdb.results_toc_result rtr ON rtr.toc_result_id = tr.id
                AND rtr.is_active = 1
                LEFT JOIN prdb.clarisa_initiatives ci9 ON ci9.id = rtr.initiative_id
            WHERE
                rtr.results_id = r.id
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
                        '<b>',
                        cia.name,
                        '</b>' ' - ' SEPARATOR '<br>'
                    )
                FROM
                    prdb.results_impact_area_target riat
                    LEFT JOIN prdb.clarisa_global_targets cgt ON cgt.targetId = riat.impact_area_target_id
                    LEFT JOIN prdb.clarisa_impact_areas cia ON cia.id = cgt.impactAreaId
                WHERE
                    riat.result_id = r.id
                    AND riat.is_active = 1
                ORDER BY
                    cgt.targetId ASC
            ),
            (
                SELECT
                    GROUP_CONCAT(
                        '<b>',
                        subquery.name,
                        '</b>',
                        ' - ',
                        subquery.target SEPARATOR '<br>'
                    )
                FROM
                    (
                        SELECT
                            DISTINCT rtiat.impact_area_indicator_id,
                            cia.name,
                            cgt.target
                        FROM
                            prdb.result_toc_impact_area_target rtiat
                            LEFT JOIN prdb.clarisa_global_targets cgt ON cgt.targetId = rtiat.impact_area_indicator_id
                            LEFT JOIN prdb.results_toc_result rtr ON rtr.results_id = r.id
                            AND rtr.is_active = 1
                            LEFT JOIN prdb.clarisa_impact_areas cia ON cia.id = cgt.impactAreaId
                        WHERE
                            rtiat.result_toc_result_id = rtr.result_toc_result_id
                            AND rtiat.is_active = 1
                    ) AS subquery
                ORDER BY
                    subquery.impact_area_indicator_id ASC
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
                    '<a href="https://reporting.cgiar.org/result/result-detail/',
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
    ) AS previous_portfolio,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<b>Source of the evidence</b>: ',
                    IF(
                        e.is_sharepoint = 1,
                        'Uploaded in Sharepoint',
                        'Link'
                    ),
                    '<br>',
                    IF(
                        e.is_sharepoint = 1,
                        CONCAT(
                            '<b>Is this a public file?: </b>',
                            (
                                SELECT
                                    IF(
                                        es.is_public_file = 1,
                                        'Yes',
                                        'No'
                                    )
                                FROM
                                    prdb.evidence_sharepoint es
                                WHERE
                                    es.evidence_id = e.id
                                    AND es.is_active = 1
                            ),
                            '<br>'
                        ),
                        ''
                    ),
                    '<br>',
                    '<a href="',
                    e.link,
                    '" target="_blank">',
                    e.link,
                    '</a>',
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.evidence e
            WHERE
                e.result_id = r.id
                AND e.is_active = 1
        ),
        '<Not applicable>'
    ) AS evidence,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<b>',
                    at.name,
                    '</b>',
                    IF(
                        ra.actor_type_id = 5,
                        CONCAT(
                            ' - ',
                            'Other actor type: ',
                            ra.other_actor_type
                        ),
                        ''
                    ),
                    IF(
                        (ra.sex_and_age_disaggregation != 1),
                        CONCAT(
                            '<br>',
                            'Women: ',
                            ra.women,
                            ' - ',
                            'Women youth: ',
                            ra.women_youth,
                            '<br>',
                            'Men: ',
                            ra.men,
                            ' - ',
                            'Men youth: ',
                            ra.men_youth,
                            '<br>',
                            'How many: ',
                            ra.how_many
                        ),
                        CONCAT(
                            '<br>',
                            'Sex and age disaggregation does not apply',
                            '<br>',
                            'How many: ',
                            ra.how_many
                        )
                    ),
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.result_actors ra
                LEFT JOIN prdb.actor_type at ON ra.actor_type_id = at.actor_type_id
            WHERE
                ra.result_id = r.id
                AND ra.is_active = 1
        ),
        '<Not applicable>'
    ) AS actors,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    '<b>',
                    cit.name,
                    '</b>',
                    IF(
                        rbit.institution_types_id = 78,
                        CONCAT(
                            ' - ',
                            'Other actor type: ',
                            rbit.other_institution
                        ),
                        ''
                    ),
                    '<br>',
                    'How many: ',
                    rbit.how_many,
                    IF(
                        (
                            rbit.graduate_students IS NOT NULL
                        ),
                        (
                            CONCAT(
                                '<br>',
                                'Graduate students: ',
                                rbit.graduate_students
                            )
                        ),
                        ''
                    ),
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.results_by_institution_type rbit
                LEFT JOIN prdb.clarisa_institution_types cit ON rbit.institution_types_id = cit.code
            WHERE
                rbit.results_id = r.id
                AND rbit.is_active = 1
                AND rbit.institution_roles_id = 5
        ),
        '<Not applicable>'
    ) AS organizations,
    IFNULL(
        (
            SELECT
                GROUP_CONCAT(
                    '<li>',
                    'Unit of measures: ',
                    rim.unit_of_measure,
                    '<br>',
                    'Quantity: ',
                    rim.quantity,
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.result_ip_measure rim
            WHERE
                rim.result_id = r.id
                AND rim.is_active = 1
        ),
        '<Not applicable>'
    ) AS other_quantitative
FROM
    prdb.result r
    LEFT JOIN prdb.results_by_inititiative rbi ON rbi.result_id = r.id
    AND rbi.initiative_role_id = 1
    LEFT JOIN prdb.results_innovations_use riu ON riu.results_id = r.id
    AND riu.is_active = 1
WHERE
    r.result_type_id = 2
    AND r.version_id IN (
        SELECT
            id
        FROM
            prdb.version v1
        WHERE
            v1.phase_year = 2024
            AND v1.phase_name LIKE '%Reporting%'
            AND v1.is_active = 1
    )
ORDER BY
    r.result_code DESC;