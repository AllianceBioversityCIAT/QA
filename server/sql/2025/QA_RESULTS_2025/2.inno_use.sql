WITH phase_versions AS (
    SELECT
        v1.id AS current_phase_id,
        v1.previous_phase
    FROM
        prdb.version v1
    WHERE
        v1.phase_year = 2025
        AND v1.phase_name LIKE '%Reporting%'
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
        r.result_type_id = 2
        AND r.is_active = 1
)
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
                    '<b>',
                    TRIM(cp.short_name),
                    '</b>',
                    '<br>',
                    '<span>',
                    IFNULL(
                        NULLIF(TRIM(cp.description), ''),
                        'Data not provided.'
                    ),
                    '</span>',
                    '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.results_by_projects rbp
                INNER JOIN prdb.clarisa_projects cp ON cp.id = rbp.project_id
            WHERE
                rbp.result_id = r.id
                AND rbp.is_active = 1
            ORDER BY
                TRIM(cp.short_name)
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
                                    CASE 
                                        WHEN rit.contributing_indicator IS NULL 
                                             OR CAST(rit.contributing_indicator AS CHAR) = '' 
                                             OR TRIM(CAST(rit.contributing_indicator AS CHAR)) = '' THEN 'N/A'
                                        WHEN CAST(rit.contributing_indicator AS DECIMAL(10, 2)) = FLOOR(CAST(rit.contributing_indicator AS DECIMAL(10, 2))) THEN
                                            CAST(CAST(rit.contributing_indicator AS DECIMAL(10, 2)) AS UNSIGNED)
                                        ELSE
                                            CAST(rit.contributing_indicator AS DECIMAL(10, 2))
                                    END,
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
    ) AS toc_planned,
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
                        e.description IS NOT NULL AND e.description != '',
                        CONCAT(
                            '<b>Description:</b> ',
                            e.description,
                            '<br>'
                        ),
                        ''
                    ),
                    IF(
                        e.is_sharepoint = 1,
                        CONCAT(
                            '<b>File name:</b> ',
                            IFNULL(
                                (
                                    SELECT
                                        es.file_name
                                    FROM
                                        prdb.evidence_sharepoint es
                                    WHERE
                                        es.evidence_id = e.id
                                        AND es.is_active = 1
                                    LIMIT 1
                                ),
                                '<Not applicable>'
                            ),
                            '<br>',
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
                                LIMIT 1
                            ), '<br>'
                        ), ''
                    ), '<br>', '<a href="', e.link, '" target="_blank">', e.link, '</a>', '</li>' SEPARATOR '<br>'
                )
            FROM
                prdb.evidence e
            WHERE
                e.result_id = r.id
                AND e.is_active = 1
        ),
        '<Not applicable>'
    ) AS evidence,
    IF(
        riu.innov_use_to_be_determined = 1,
        'This is yet to be determined',
        '<Not applicable>'
    ) AS current_core_innovation_use,
    IFNULL(
        (
            SELECT
                CONCAT(
                    ciul.level,
                    ' - ',
                    ciul.definition
                )
            FROM
                prdb.clarisa_innovation_use_levels ciul
            WHERE
                ciul.id = riu.innovation_use_level_id
        ),
        '<Not applicable>'
    ) AS current_use_level_of_the_innovation,
    IF(
        riu.innov_use_to_be_determined = 1,
        '<Not applicable>',
        CONCAT(
            IF(
                EXISTS(
                    SELECT 1
                    FROM prdb.result_actors ra
                    WHERE ra.result_id = r.id
                    AND ra.is_active = 1
                ),
                CONCAT(
                    '<b>Actors:</b><br>',
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
                                        IFNULL(ra.women, 0),
                                        ' - ',
                                        'Women youth: ',
                                        IFNULL(ra.women_youth, 0),
                                        '<br>',
                                        'Men: ',
                                        IFNULL(ra.men, 0),
                                        ' - ',
                                        'Men youth: ',
                                        IFNULL(ra.men_youth, 0),
                                        '<br>',
                                        'How many: ',
                                        IFNULL(ra.how_many, 0)
                                    ),
                                    CONCAT(
                                        '<br>',
                                        'Sex and age disaggregation does not apply',
                                        '<br>',
                                        'How many: ',
                                        IFNULL(ra.how_many, 0)
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
                            AND ra.section_id = 1
                    ),
                    '<br><br>'
                ),
                ''
            ),
            IF(
                EXISTS(
                    SELECT 1
                    FROM prdb.results_by_institution_type rbit
                    WHERE rbit.results_id = r.id
                    AND rbit.is_active = 1
                    AND rbit.institution_roles_id = 5
                ),
                CONCAT(
                    '<b>Organizations:</b><br>',
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
                            AND rbit.section_id = 1
                    ),
                    '<br><br>'
                ),
                ''
            ),
            IF(
                EXISTS(
                    SELECT 1
                    FROM prdb.result_ip_measure rim
                    WHERE rim.result_id = r.id
                    AND rim.is_active = 1
                ),
                CONCAT(
                    '<b>Other Quantitative:</b><br>',
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
                            AND rim.section_id = 1
                    )
                ),
                ''
            )
        )
    ) AS actors_organizations_quantitative,
    IF(
        riu.has_innovation_link IS NULL OR riu.has_innovation_link = 0,
        'No',
        CONCAT(
            'Yes',
            IFNULL(
                (
                    SELECT
                        CONCAT(
                            '<br>',
                            GROUP_CONCAT(
                                CONCAT(
                                    '<b>Result code:</b> ',
                                    r_linked.result_code,
                                    '<br>',
                                    '<b>Title:</b> ',
                                    IFNULL(r_linked.title, '<Not applicable>')
                                )
                                SEPARATOR '<br><br>'
                            )
                        )
                    FROM
                        prdb.linked_result lr
                        INNER JOIN prdb.result r_linked ON r_linked.id = lr.linked_results_id
                    WHERE
                        lr.origin_result_id = r.id
                        AND lr.is_active = 1
                ),
                ''
            )
        )
    ) AS innovation_linked
FROM
    valid_results vr
    LEFT JOIN prdb.result r ON r.id = vr.id
    LEFT JOIN prdb.results_by_inititiative rbi ON rbi.result_id = r.id
    AND rbi.initiative_role_id = 1
    LEFT JOIN prdb.results_innovations_use riu ON riu.results_id = r.id
    AND riu.is_active = 1
WHERE
    r.source = 'Result'
ORDER BY
    r.result_code DESC;