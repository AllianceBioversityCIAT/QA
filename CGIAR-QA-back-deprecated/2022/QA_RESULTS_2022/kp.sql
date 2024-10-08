select
    group_concat(distinct `i`.`official_code` separator ',') AS `crp_id`,
    'AR' AS `phase_name`,
    `r`.`reported_year_id` AS `phase_year`,
    'yes' AS `included_AR`,
    `r`.`is_active` AS `is_active`,
    `r`.`id` AS `id`,
    `r`.`result_code` AS `result_code`,
    `rl`.`name` AS `result_level`,
    `rt`.`name` AS `result_type`,
    `r`.`title` AS `title`,
    ifnull(`r`.`description`, '<Not applicable>') AS `description`,
    ifnull(
        group_concat(
            distinct if(
                (
                    (`r`.`result_level_id` = 1)
                    or (`r`.`result_level_id` = 2)
                ),
                '<Not applicable>',
                concat(
                    '• ',
                    `i`.`official_code`,
                    ' - ',
                    '<b>Outcome level:</b> ',
                    `tl`.`name`,
                    ', ',
                    '<b>Outcome:</b> ',
                    `tr`.`title`
                )
            ) separator '<br>'
        ),
        'Data not provided.'
    ) AS `toc_planned`,
    ifnull(
        if((`cgs`.`id` = 3), 'National', `cgs`.`name`),
        '<Not applicable>'
    ) AS `geographic_focus`,
    ifnull(
        group_concat(
            distinct if(
                (`r`.`has_regions` = 1),
                `cr`.`name`,
                '<Not applicable>'
            ) separator ', '
        ),
        '<Not applicable>'
    ) AS `regions`,
    ifnull(
        group_concat(
            distinct `rkp`.`cgspace_countries` separator ', '
        ),
        '<Not applicable>'
    ) AS `countries`,
    ifnull(
        group_concat(
            distinct if(
                (`r`.`result_level_id` = 4),
                '<Not applicable>',
                if(
                    (`rbi2`.`institution_roles_id` = 1),
                    if(
                        (
                            (`ci2`.`acronym` = NULL)
                            or (`ci2`.`acronym` = '')
                        ),
                        concat('• ', `ci2`.`name`),
                        concat('• ', `ci2`.`acronym`, ' - ', `ci2`.`name`)
                    ),
                    NULL
                )
            ) separator '<br>'
        ),
        'Data not provided.'
    ) AS `actors`,
    ifnull(
        group_concat(
            distinct concat(
                '• ',
                convert(`ci`.`name` using utf8mb4),
                convert(
                    if(
                        (`rcc`.`is_primary` = 1),
                        concat(
                            convert(space(2) using utf8mb4),
                            '- <b>Primary</b>'
                        ),
                        ''
                    ) using utf8mb4
                )
            ) separator '<br>'
        ),
        'Data not provided.'
    ) AS `contributing_centers`,
    ifnull(
        group_concat(
            distinct if(
                (`rbi2`.`institution_roles_id` = 2),
                if(
                    (
                        (`ci2`.`acronym` = NULL)
                        or (`ci2`.`acronym` = '')
                    ),
                    concat('• ', `ci2`.`name`),
                    concat('• ', `ci2`.`acronym`, ' - ', `ci2`.`name`)
                ),
                NULL
            ) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `partners`,
    group_concat(
        distinct concat(
            '• ',
            convert(`i2`.`official_code` using utf8mb4),
            ' - ',
            convert(`i2`.`short_name` using utf8mb4),
            convert(
                if(
                    (`rtr`.`initiative_id` = `rbi`.`inititiative_id`),
                    concat(
                        convert(space(2) using utf8mb4),
                        '- <b>Primary</b>'
                    ),
                    ''
                ) using utf8mb4
            )
        ) separator '<br>'
    ) AS `contributing_initiatives`,
    ifnull(
        group_concat(
            distinct '• ',
            '<b>Funder name:</b> ',
            convert(`ci3`.`name` using utf8mb4),
            ', ',
            convert(space(1) using utf8mb4),
            '<b>Grant title:</b> ',
            convert(`npp`.`grant_title` using utf8mb4),
            ', ',
            convert(space(1) using utf8mb4),
            '<b>Lead/Contract Center:</b> ',
            convert(`ci4`.`name` using utf8mb4) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `contributing_non_pooled_project`,
    if(
        (`r`.`legacy_id` is null),
        'New Result',
        'Updated Result'
    ) AS `new_or_updated_result`,
    ifnull(
        group_concat(
            distinct concat('• ', `r2`.`id`, ' - ', `r2`.`title`) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `linked_results`,
    ifnull(
        group_concat(distinct `lr`.`legacy_link` separator ', '),
        '<Not applicable>'
    ) AS `previous_portfolio`,
    `gtl`.`description` AS `gender_tag_level`,
    `gtl2`.`description` AS `climate_change_level`,
    group_concat(
        distinct concat(
            '• ',
            convert(
                (
                    case
                        when (
                            (`e`.`gender_related` = 1)
                            and (`e`.`youth_related` = 1)
                        ) then '<b>Gender and Climate related evidence</b> - '
                        when (
                            (
                                (`e`.`gender_related` = 1)
                                and (`e`.`youth_related` = 0)
                            )
                            or (`e`.`youth_related` = NULL)
                        ) then '<b>Gender related evidence</b> - '
                        when (
                            (
                                (`e`.`youth_related` = 1)
                                and (`e`.`gender_related` = 0)
                            )
                            or (`e`.`gender_related` = NULL)
                        ) then '<b>Climate related evidence</b> - '
                        when (`e`.`is_supplementary` = 1) then NULL
                        else ''
                    end
                ) using utf8mb4
            ),
            convert(
                if(
                    (`e`.`is_active` = 0),
                    NULL,
                    concat(
                        `e`.`link`,
                        if(
                            (
                                (`e`.`description` is null)
                                or (`e`.`description` = '')
                            ),
                            '<Not applicable>',
                            concat(' - ', `e`.`description`)
                        )
                    )
                ) using utf8mb4
            )
        ) separator '<br>'
    ) AS `evidence`,
    if(
        (`r`.`climate_change_tag_level_id` = 3),
        group_concat(
            distinct if(
                (`e`.`youth_related` = 1),
                concat(
                    '• ',
                    `e`.`link`,
                    ' - ',
                    if(
                        (
                            (`e`.`description` is null)
                            or (`e`.`description` = '')
                        ),
                        'Description not provided',
                        `e`.`description`
                    )
                ),
                NULL
            ) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `climate_related_evidence`,
    if(
        (`r`.`gender_tag_level_id` = 3),
        group_concat(
            distinct if(
                (`e`.`gender_related` = 1),
                concat(
                    '• ',
                    `e`.`link`,
                    ' - ',
                    if(
                        (
                            (`e`.`description` is null)
                            or (`e`.`description` = '')
                        ),
                        'Description not provided',
                        `e`.`description`
                    )
                ),
                NULL
            ) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `gender_related_evidence`,
    ifnull(
        group_concat(
            distinct if(
                (`e`.`is_supplementary` = 1),
                concat(
                    '• ',
                    `e`.`link`,
                    ' - ',
                    if(
                        (
                            (`e`.`description` is null)
                            or (`e`.`description` = '')
                        ),
                        'Description not provided',
                        `e`.`description`
                    )
                ),
                '<Not applicable>'
            ) separator '<br>'
        ),
        '<Not applicable>'
    ) AS `supplementary_related_evidence`,
    group_concat(
        distinct if((`rkp`.`is_melia` = 1), 'Yes', 'No') separator ','
    ) AS `is_melia`,
    group_concat(
        distinct if(
            (`rkp`.`is_melia` = 1),
            if(
                (`rkp`.`melia_previous_submitted` = 1),
                'YES',
                'No'
            ),
            '<Not applicable>'
        ) separator ','
    ) AS `melia_previous_submitted`,
    group_concat(
        distinct concat(
            'https://cgspace.cgiar.org/handle/',
            `rkp`.`handle`
        ) separator ','
    ) AS `handle`,
    group_concat(
        distinct concat(`rkpm`.`source`, ': ', `rkpm`.`year`) separator ', '
    ) AS `issue_date`,
    group_concat(
        distinct trim(concat('• ', `rkpa`.`author_name`)) separator '<br> '
    ) AS `authors`,
    group_concat(
        distinct `rkp`.`knowledge_product_type` separator ','
    ) AS `knowledge_product_type`,
    group_concat(
        distinct if(
            (`rkpm`.`is_peer_reviewed` = 1),
            concat(`rkpm`.`source`, ': ', 'Yes'),
            concat(`rkpm`.`source`, ': ', 'No')
        ) separator ', '
    ) AS `peer_reviewed`,
    group_concat(
        distinct if(
            (`rkpm`.`is_isi` = 1),
            concat(`rkpm`.`source`, ': ', 'Yes'),
            concat(`rkpm`.`source`, ': ', 'No')
        ) separator ', '
    ) AS `wos_isi`,
    group_concat(
        distinct concat(
            `rkpm`.`source`,
            ': ',
            convert(
                if(
                    (
                        (`rkpm`.`accesibility` = 'yes')
                        or (`rkpm`.`accesibility` = 'Yes')
                    ),
                    'Open Access',
                    'Limited Access'
                ) using utf8mb3
            )
        ) separator ', '
    ) AS `accesibility`,
    group_concat(distinct trim(`rkp`.`licence`) separator ', ') AS `license`,
    group_concat(distinct trim(`rkpk`.`keyword`) separator '; ') AS `keywords`,
    ifnull(
        convert(
            group_concat(distinct `rkpal`.`score` separator ',') using utf8mb4
        ),
        '<Not applicable>'
    ) AS `altmetrics`,
    group_concat(
        distinct convert(
            concat(
                cast((`rkpfb`.`findable` * 100) as decimal(10, 0))
            ) using utf8mb4
        ),
        '%' separator ','
    ) AS `findable`,
    group_concat(
        distinct convert(
            concat(
                cast((`rkpfb`.`accesible` * 100) as decimal(10, 0))
            ) using utf8mb4
        ),
        '%' separator ','
    ) AS `accesible`,
    group_concat(
        distinct convert(
            concat(
                cast(
                    (`rkpfb`.`interoperable` * 100) as decimal(10, 0)
                )
            ) using utf8mb4
        ),
        '%' separator ','
    ) AS `interoperable`,
    group_concat(
        distinct convert(
            concat(
                cast((`rkpfb`.`reusable` * 100) as decimal(10, 0))
            ) using utf8mb4
        ),
        '%' separator ','
    ) AS `reusable`,
    group_concat(
        distinct if((`rkp`.`doi` is not null), 1, 0) separator ','
    ) AS `doi`,
    group_concat(
        distinct if((`rkpm`.`source` is null), `rkpm`.`source`, NULL) separator ','
    ) AS `source_null`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_isi` = 1)
                and (`rkpm`.`source` = 'CGSpace')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_isi_cgspace`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_peer_reviewed` = 1)
                and (`rkpm`.`source` = 'CGSpace')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_peer_cgspace`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'CGSpace'),
            `rkpm`.`accesibility`,
            NULL
        ) separator ','
    ) AS `accesibility_cgspace`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'CGSpace'),
            `rkpm`.`source`,
            NULL
        ) separator ','
    ) AS `cgspace`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'CGSpace'),
            `rkpm`.`year`,
            NULL
        ) separator ','
    ) AS `cgspace_year`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_isi` = 1)
                and (`rkpm`.`source` = 'WOS')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_isi_wos`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_peer_reviewed` = 1)
                and (`rkpm`.`source` = 'WOS')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_peer_wos`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'WOS'),
            `rkpm`.`accesibility`,
            NULL
        ) separator ','
    ) AS `accesibility_wos`,
    group_concat(
        distinct if((`rkpm`.`source` = 'WOS'), `rkpm`.`source`, NULL) separator ','
    ) AS `wos`,
    group_concat(
        distinct if((`rkpm`.`source` = 'WOS'), `rkpm`.`year`, NULL) separator ','
    ) AS `wos_year`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_isi` = 1)
                and (`rkpm`.`source` = 'Scopus')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_isi_scopus`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_peer_reviewed` = 1)
                and (`rkpm`.`source` = 'Scopus')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_peer_scopus`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'Scopus'),
            `rkpm`.`source`,
            NULL
        ) separator ','
    ) AS `scopus`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'Scopus'),
            `rkpm`.`year`,
            NULL
        ) separator ','
    ) AS `scopus_year`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_isi` = 1)
                and (`rkpm`.`source` = 'Unpaywall')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_isi_unpaywall`,
    group_concat(
        distinct if(
            (
                (`rkpm`.`is_peer_reviewed` = 1)
                and (`rkpm`.`source` = 'Unpaywall')
            ),
            `rkpm`.`is_isi`,
            NULL
        ) separator ','
    ) AS `is_peer_unpaywall`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'Unpaywall'),
            `rkpm`.`source`,
            NULL
        ) separator ','
    ) AS `unpaywall`,
    group_concat(
        distinct if(
            (`rkpm`.`source` = 'Unpaywall'),
            `rkpm`.`year`,
            NULL
        ) separator ','
    ) AS `unpaywall_year`
from
    (
        (
            (
                (
                    (
                        (
                            (
                                (
                                    (
                                        (
                                            (
                                                (
                                                    (
                                                        (
                                                            (
                                                                (
                                                                    (
                                                                        (
                                                                            (
                                                                                (
                                                                                    (
                                                                                        (
                                                                                            (
                                                                                                (
                                                                                                    (
                                                                                                        (
                                                                                                            (
                                                                                                                (
                                                                                                                    (
                                                                                                                        (
                                                                                                                            (
                                                                                                                                (
                                                                                                                                    (
                                                                                                                                        `prdb`.`result` `r`
                                                                                                                                        join `prdb`.`results_by_inititiative` `rbi` on (
                                                                                                                                            (
                                                                                                                                                (`rbi`.`result_id` = `r`.`id`)
                                                                                                                                                and (`rbi`.`initiative_role_id` = 1)
                                                                                                                                            )
                                                                                                                                        )
                                                                                                                                    )
                                                                                                                                    join `prdb`.`clarisa_initiatives` `i` on ((`i`.`id` = `rbi`.`inititiative_id`))
                                                                                                                                )
                                                                                                                                join `prdb`.`results_knowledge_product` `rkp` on ((`rkp`.`results_id` = `r`.`id`))
                                                                                                                            )
                                                                                                                            left join `prdb`.`results_kp_metadata` `rkpm` on (
                                                                                                                                (
                                                                                                                                    `rkpm`.`result_knowledge_product_id` = `rkp`.`result_knowledge_product_id`
                                                                                                                                )
                                                                                                                            )
                                                                                                                        )
                                                                                                                        left join `prdb`.`results_kp_authors` `rkpa` on (
                                                                                                                            (
                                                                                                                                `rkpa`.`result_knowledge_product_id` = `rkp`.`result_knowledge_product_id`
                                                                                                                            )
                                                                                                                        )
                                                                                                                    )
                                                                                                                    left join `prdb`.`results_kp_keywords` `rkpk` on (
                                                                                                                        (
                                                                                                                            `rkpk`.`result_knowledge_product_id` = `rkp`.`result_knowledge_product_id`
                                                                                                                        )
                                                                                                                    )
                                                                                                                )
                                                                                                                left join `prdb`.`results_kp_altmetrics` `rkpal` on (
                                                                                                                    (
                                                                                                                        `rkpal`.`result_knowledge_product_id` = `rkp`.`result_knowledge_product_id`
                                                                                                                    )
                                                                                                                )
                                                                                                            )
                                                                                                            left join `prdb`.`results_kp_fair_baseline` `rkpfb` on (
                                                                                                                (
                                                                                                                    `rkpfb`.`knowledge_product_id` = `rkp`.`result_knowledge_product_id`
                                                                                                                )
                                                                                                            )
                                                                                                        )
                                                                                                        left join `prdb`.`results_toc_result` `rtr` on ((`rtr`.`results_id` = `r`.`id`))
                                                                                                    )
                                                                                                    left join `prdb`.`toc_result` `tr` on ((`tr`.`toc_result_id` = `rtr`.`toc_result_id`))
                                                                                                )
                                                                                                left join `prdb`.`toc_level` `tl` on ((`tl`.`toc_level_id` = `tr`.`toc_level_id`))
                                                                                            )
                                                                                            left join `prdb`.`results_center` `rcc` on ((`rcc`.`result_id` = `r`.`id`))
                                                                                        )
                                                                                        left join `prdb`.`clarisa_center` `ccc` on ((`ccc`.`code` = `rcc`.`center_id`))
                                                                                    )
                                                                                    left join `prdb`.`clarisa_institutions` `ci` on ((`ci`.`id` = `ccc`.`institutionId`))
                                                                                )
                                                                                left join `prdb`.`results_by_institution` `rbi2` on ((`rbi2`.`result_id` = `r`.`id`))
                                                                            )
                                                                            left join `prdb`.`clarisa_institutions` `ci2` on ((`ci2`.`id` = `rbi2`.`institutions_id`))
                                                                        )
                                                                        left join `prdb`.`clarisa_initiatives` `i2` on ((`i2`.`id` = `rtr`.`initiative_id`))
                                                                    )
                                                                    left join `prdb`.`non_pooled_project` `npp` on ((`npp`.`results_id` = `r`.`id`))
                                                                )
                                                                left join `prdb`.`clarisa_institutions` `ci3` on ((`ci3`.`id` = `npp`.`funder_institution_id`))
                                                            )
                                                            left join `prdb`.`clarisa_center` `cc2` on ((`cc2`.`code` = `npp`.`lead_center_id`))
                                                        )
                                                        left join `prdb`.`clarisa_institutions` `ci4` on ((`ci4`.`id` = `cc2`.`institutionId`))
                                                    )
                                                    left join `prdb`.`result_level` `rl` on ((`rl`.`id` = `r`.`result_level_id`))
                                                )
                                                left join `prdb`.`result_type` `rt` on ((`rt`.`id` = `r`.`result_type_id`))
                                            )
                                            left join `prdb`.`clarisa_geographic_scope` `cgs` on ((`cgs`.`id` = `r`.`geographic_scope_id`))
                                        )
                                        left join `prdb`.`result_country` `rc` on ((`r`.`id` = `rc`.`result_id`))
                                    )
                                    left join `prdb`.`clarisa_countries` `cc` on ((`cc`.`id` = `rc`.`country_id`))
                                )
                                left join `prdb`.`result_region` `rr` on ((`r`.`id` = `rr`.`result_id`))
                            )
                            left join `prdb`.`clarisa_regions` `cr` on ((`cr`.`um49Code` = `rr`.`region_id`))
                        )
                        left join `prdb`.`linked_result` `lr` on ((`lr`.`origin_result_id` = `r`.`id`))
                    )
                    left join `prdb`.`result` `r2` on ((`r2`.`id` = `lr`.`linked_results_id`))
                )
                left join `prdb`.`gender_tag_level` `gtl` on ((`gtl`.`id` = `r`.`gender_tag_level_id`))
            )
            left join `prdb`.`gender_tag_level` `gtl2` on (
                (`gtl2`.`id` = `r`.`climate_change_tag_level_id`)
            )
        )
        left join `prdb`.`evidence` `e` on ((`e`.`result_id` = `r`.`id`))
    )
where
    (
        (`r`.`result_type_id` = 6)
        and (`r`.`is_active` = 1)
        and (
            (`rkp`.`is_melia` = 1)
            or (
                `rkp`.`knowledge_product_type` = 'Journal Article'
            )
        )
    )
group by
    `r`.`id`;