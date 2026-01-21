WITH phase_versions AS (
    SELECT
        v1.id AS current_phase_id,
        v1.previous_phase
    FROM
        prdb.version v1
    WHERE
        v1.phase_year = 2025
        AND v1.phase_name LIKE '%IPSR%'
        AND v1.is_active = 1
),
valid_results AS (
    SELECT DISTINCT r.id
    FROM
        prdb.result r
        INNER JOIN phase_versions pv ON (
            r.version_id = pv.current_phase_id
            OR (
                r.version_id = pv.previous_phase
                AND EXISTS (
                    SELECT 1
                    FROM prdb.result r2
                    WHERE r2.result_code = r.result_code
                    AND r2.version_id = pv.current_phase_id
                    AND r2.is_replicated = 1
                    AND r2.is_active = 1
                )
            )
        )
    WHERE
        r.is_active = 1
        AND r.result_type_id = 10
)
SELECT
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
    r.is_replicated AS is_replicated,
    r.version_id AS version,
    r.in_qa,
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
                '<a href="https://reporting.cgiar.org/result/result-detail/',
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
    r.lead_contact_person AS lead_contact_person,
    IFNULL(
        IF(
            r.is_lead_by_partner = 1,
            (
                SELECT
                    CONCAT(
                        '<b>Lead by Partner:</b><br>',
                        '<b>',
                        ci.name,
                        '</b>',
                        '<br>',
                        '<b>Institution type: </b>',
                        cit.name,
                        '<br>',
                        '<b>Role: </b>',
                        IFNULL(
                            (
                                SELECT
                                    GROUP_CONCAT(
                                        pdt.name SEPARATOR '; '
                                    )
                                FROM
                                    prdb.result_by_institutions_by_deliveries_type rbibd
                                    LEFT JOIN prdb.partner_delivery_type pdt ON pdt.id = rbibd.partner_delivery_type_id
                                WHERE
                                    rbibd.result_by_institution_id = rbi_lead.id
                                    AND rbibd.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                FROM
                    prdb.results_by_institution rbi_lead
                    LEFT JOIN prdb.clarisa_institutions ci ON rbi_lead.institutions_id = ci.id
                    INNER JOIN prdb.clarisa_institution_types cit ON ci.institution_type_code = cit.code
                WHERE
                    rbi_lead.result_id = r.id
                    AND rbi_lead.is_active = 1
                    AND rbi_lead.institution_roles_id = 2
                    AND rbi_lead.is_leading_result = 1
                LIMIT 1
            ),
            (
                SELECT
                    CONCAT(
                        '<b>Lead by Center:</b><br>',
                        '<b>',
                        ci9.acronym,
                        '</b>',
                        ' - ',
                        ci9.name
                    )
                FROM
                    prdb.results_center rc9
                    LEFT JOIN prdb.clarisa_center cc9 ON rc9.center_id = cc9.code
                    LEFT JOIN prdb.clarisa_institutions ci9 ON ci9.id = cc9.institutionId
                WHERE
                    rc9.result_id = r.id
                    AND rc9.is_active = 1
                    AND rc9.is_leading_result = 1
                LIMIT 1
            )
        ),
        '<Not applicable>'
    ) AS lead_center_or_partner,
    (
        SELECT
            CONCAT(
                gtl.description,
                CASE
                    WHEN gtl.id = 3 THEN CONCAT(
                        '<br><b>Which component of the Impact Area is this result intended to impact?</b> ',
                        IFNULL(
                            (
                                SELECT
                                    iasc.name
                                FROM
                                    prdb.impact_areas_scores_components iasc
                                WHERE
                                    iasc.id = NULLIF(r.gender_impact_area_id, 0)
                                    AND iasc.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                    ELSE ''
                END,
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
                CASE
                    WHEN gtl.id = 3 THEN CONCAT(
                        '<br><b>Which component of the Impact Area is this result intended to impact?</b> ',
                        IFNULL(
                            (
                                SELECT
                                    iasc.name
                                FROM
                                    prdb.impact_areas_scores_components iasc
                                WHERE
                                    iasc.id = NULLIF(r.climate_impact_area_id, 0)
                                    AND iasc.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                    ELSE ''
                END,
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
                            AND e1.is_active = 1 -- OJO: aquí en tu SQL actual está youth_related, revisa si debería ser climate_related
                            AND e1.youth_related = 1
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
                CASE
                    WHEN gtl.id = 3 THEN CONCAT(
                        '<br><b>Which component of the Impact Area is this result intended to impact?</b> ',
                        IFNULL(
                            (
                                SELECT
                                    iasc.name
                                FROM
                                    prdb.impact_areas_scores_components iasc
                                WHERE
                                    iasc.id = NULLIF(r.nutrition_impact_area_id, 0)
                                    AND iasc.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                    ELSE ''
                END,
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
                CASE
                    WHEN gtl.id = 3 THEN CONCAT(
                        '<br><b>Which component of the Impact Area is this result intended to impact?</b> ',
                        IFNULL(
                            (
                                SELECT
                                    iasc.name
                                FROM
                                    prdb.impact_areas_scores_components iasc
                                WHERE
                                    iasc.id = NULLIF(r.environmental_biodiversity_impact_area_id, 0)
                                    AND iasc.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                    ELSE ''
                END,
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
                CASE
                    WHEN gtl.id = 3 THEN CONCAT(
                        '<br><b>Which component of the Impact Area is this result intended to impact?</b> ',
                        IFNULL(
                            (
                                SELECT
                                    iasc.name
                                FROM
                                    prdb.impact_areas_scores_components iasc
                                WHERE
                                    iasc.id = NULLIF(r.poverty_impact_area_id, 0)
                                    AND iasc.is_active = 1
                            ),
                            '<Not applicable>'
                        )
                    )
                    ELSE ''
                END,
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
                    '<Not applicable>'
                )
            )
        FROM
            prdb.gender_tag_level gtl
        WHERE
            gtl.id = r.poverty_tag_level_id
    ) AS poverty_tag_level,
    IF ((r.is_krs = 1), 'Yes', 'No') AS is_krs,
    IFNULL(
            (
                SELECT
                    GROUP_CONCAT(
                        '<li>',
                        IF(
                            rtr.planned_result = 0,
                            CONCAT(
                                '<b>Unplanned</b><br>',
                                IF(
                                    tr.category IS NOT NULL 
                                    AND (tr.result_title IS NOT NULL OR tr.result_description IS NOT NULL)
                                    AND (NULLIF(TRIM(tr.result_title), '') IS NOT NULL OR NULLIF(TRIM(tr.result_description), '') IS NOT NULL),
                                    CONCAT(
                                        '<b>',
                                        IF(
                                            tr.category = 'OUTCOME',
                                            'Intermediate Outcome:',
                                            IF(
                                                tr.category = 'OUTPUT',
                                                'HLO:',
                                                IF(
                                                    tr.category = 'EOI',
                                                    '2030 Outcome:',
                                                    IFNULL(tr.category, 'N/A')
                                                )
                                            )
                                        ),
                                        '</b>',
                                        ' ',
                                        CONCAT(
                                            IFNULL(
                                                NULLIF(TRIM(tr.result_title), ''),
                                                'N/A'
                                            ),
                                            ' - ',
                                            IFNULL(
                                                NULLIF(TRIM(tr.result_description), ''),
                                                'N/A'
                                            )
                                        ),
                                        '<br>'
                                    ),
                                    ''
                                ),
                                IF(
                                    rtr.toc_progressive_narrative IS NOT NULL AND NULLIF(TRIM(rtr.toc_progressive_narrative), '') IS NOT NULL,
                                    CONCAT(
                                        '<b>Why is the result being reported?:</b> ',
                                        rtr.toc_progressive_narrative
                                    ),
                                    ''
                                )
                            ),
                            CONCAT(
                                '<b>Planned</b><br>',
                                '<b>',
                                IFNULL(NULLIF(TRIM(wp.acronym), ''), 'N/A'),
                                '</b>',
                                IF(
                                    wp.name IS NOT NULL AND wp.name != '' AND IFNULL(NULLIF(TRIM(wp.acronym), ''), 'N/A') != 'N/A',
                                    CONCAT(' - ', wp.name),
                                    ''
                                ),
                                '<br>',
                                '<b>',
                                IF(
                                    tr.category = 'OUTCOME',
                                    'Intermediate Outcome:',
                                    IF(
                                        tr.category = 'OUTPUT',
                                        'HLO:',
                                        IF(
                                            tr.category = 'EOI',
                                            '2030 Outcome:',
                                            IFNULL(tr.category, 'N/A')
                                        )
                                    )
                                ),
                                '</b>',
                                ' ',
                                CONCAT(
                                    IFNULL(
                                        NULLIF(TRIM(tr.result_title), ''),
                                        'N/A'
                                    ),
                                    ' - ',
                                    IFNULL(
                                        NULLIF(TRIM(tr.result_description), ''),
                                        'N/A'
                                    )
                                ),
                                '<br>',
                                '<b>Indicator name:</b> ',
                                IFNULL(
                                    NULLIF(TRIM(tri.indicator_description), ''),
                                    'N/A'
                                ),
                                '<br>',
                                '<b>Target contribution:</b> ',
                                IFNULL(
                                    IF(
                                        rit.contributing_indicator IS NULL OR rit.contributing_indicator = '',
                                        'N/A',
                                        IF(
                                            CAST(rit.contributing_indicator AS DECIMAL(10, 2)) = FLOOR(CAST(rit.contributing_indicator AS DECIMAL(10, 2))),
                                            CAST(CAST(rit.contributing_indicator AS DECIMAL(10, 2)) AS UNSIGNED),
                                            CAST(rit.contributing_indicator AS DECIMAL(10, 2))
                                        )
                                    ),
                                    'N/A'
                                ),
                                '<br>',
                                IF(
                                    rtr.toc_progressive_narrative IS NOT NULL AND NULLIF(TRIM(rtr.toc_progressive_narrative), '') IS NOT NULL,
                                    CONCAT(
                                        '<b>Why is the result being reported?:</b> ',
                                        rtr.toc_progressive_narrative
                                    ),
                                    ''
                                )
                            )
                        ),
                        '</li>' SEPARATOR '<br>'
                    )
                FROM
                    prdb.results_toc_result rtr
                    INNER JOIN prdb.clarisa_initiatives ci ON ci.id = rtr.initiative_id
                    AND ci.active > 0
                    LEFT JOIN Integration_information.toc_results tr ON tr.id = rtr.toc_result_id
                    AND tr.is_active > 0
                    LEFT JOIN Integration_information.toc_work_packages wp ON wp.toc_id = tr.wp_id
                    LEFT JOIN prdb.results_toc_result_indicators rtri ON rtri.results_toc_results_id = rtr.result_toc_result_id
                    AND rtri.is_active = 1
                    AND rtri.is_not_aplicable = 0
                    LEFT JOIN Integration_information.toc_results_indicators tri ON tri.related_node_id = rtri.toc_results_indicator_id
                    AND tri.is_active = 1
                    LEFT JOIN prdb.result_indicators_targets rit ON rit.result_toc_result_indicator_id = rtri.result_toc_result_indicator_id
                    AND rit.is_active = 1
                WHERE
                    rtr.results_id = r.id
                    AND rtr.is_active = 1
                ORDER BY
                    rtr.initiative_id,
                    rtr.result_toc_result_id,
                    rtri.result_toc_result_indicator_id
            ),
            '<Not applicable>'
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
                    '<a href="https://reporting.cgiar.org/result/result-detail/',
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
                    IFNULL(r3.description, ''),
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
                    ) SEPARATOR '<br>'
                )
            FROM
                prdb.result_by_innovation_package rbip3
                LEFT JOIN prdb.result r3 ON r3.id = rbip3.result_id
                AND r3.result_type_id = 11
                LEFT JOIN prdb.results_by_inititiative rbi4 ON rbi4.result_id = r3.id
                AND rbi4.initiative_role_id = 1
                LEFT JOIN prdb.clarisa_initiatives ci4 ON ci4.id = rbi4.inititiative_id
                LEFT JOIN prdb.results_complementary_innovation rcin ON rcin.result_id = r3.id
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
                    (rbip.use_level_evidence_based = 1),
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
                    IF(
                        (r.id = r4.id),
                        '<b>Core innovation</b> ',
                        '<b>Complementary innovation / enabler / solution</b> '
                    ),
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
                                IF(
                                    (rbip4.readiness_level_evidence_based = 11),
                                    'Not applicable',
                                    rbip4.readinees_evidence_link
                                ),
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
                        (rbip4.use_level_evidence_based = 1),
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
                                IF(
                                    (rbip4.use_level_evidence_based = 1),
                                    'Not applicable',
                                    rbip4.use_evidence_link
                                ),
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
    ) AS core_innovation_measures
FROM
    valid_results vr
    LEFT JOIN prdb.result r ON r.id = vr.id
    LEFT JOIN prdb.result_innovation_package rip ON rip.result_innovation_package_id = r.id
    AND rip.is_active = TRUE
    LEFT JOIN prdb.result_by_innovation_package rbip ON rbip.result_innovation_package_id = rip.result_innovation_package_id
    AND rbip.ipsr_role_id = 1
    LEFT JOIN prdb.results_by_inititiative rbi ON rbi.result_id = r.id
    AND rbi.initiative_role_id = 1
    LEFT JOIN prdb.`version` v ON v.id = r.version_id
WHERE
    r.source = 'Result'
ORDER BY
    r.result_code DESC;