select 
    r.result_code as "Result Code",
    (
      SELECT
        v.phase_name
      FROM
        version v
      WHERE
        r.version_id = v.id
    ) AS "Reporting phase",
    rl.name as "Result Level",
    rt.name as "Result Type",
    IF(r.in_qa = 1, 'Yes', 'No') as "In QA",
    IF(r.is_replicated = 1, 'Yes', 'No') as "Updated",
    IF(rkp.is_melia = 1, 'Yes', 'No') as "MELIA", 
    rs.status_name as "Status",
    r.title as "Result Title",
    r.description as "Result Description",
    r.lead_contact_person as "Lead Contact Person",
    gtl.title as "Gender Tag Level",
    gtl2.title as "Climate Tag Level",
    gtl3.title as "Nutrition Tag Level",
    gtl4.title as "Environment and/or biodiversity Tag Level",
    gtl5.title as "Poverty Tag Level",
    if(r.is_krs is null,'Not provided',if(r.is_krs,'Yes','No')) as "Is Key Result Story?",
    -- section 2
    concat(ci.official_code, ' - ', ci.name) as "Primary Submitter",
    GROUP_CONCAT(distinct concat(ci2.official_code, ' - ', ci2.name) SEPARATOR '; ') as "Contributing Initiative(s)",
    GROUP_CONCAT(distinct CONCAT('(Funder name: ',ci4.acronym,' - ',ci4.name ,', Grant title: ',npp.grant_title,', Center Grant ID: ',IFNULL(npp.center_grant_id, 'Not applicable'),', Lead/Contract Center: ',ci3.name,')') SEPARATOR ', ') as "Non-pooled Project(s)",
   /* GROUP_CONCAT(CONCAT(if(rc.is_primary,'(Primary: ','('),ci4.acronym,' - ',ci4.name,')') SEPARATOR ', ') as "Contributing Center(s)", */
    GROUP_CONCAT(distinct CONCAT(if(rc.is_primary,'(Primary: ','('),ci5.acronym,' - ',ci5.name,')') SEPARATOR ', ') as "Contributing Center(s)",
    CONCAT('(',ci.official_code,' - ',ci.short_name,'): ', 'Toc Level: ' ,IFNULL(tl.name , 'Not provider'), ', ToC result title:' ,IFNULL(tr.title, 'Not provider')) as "ToC Mapping (Primary submitter)",
    GROUP_CONCAT(distinct CONCAT('(',ci6.official_code,' - ',ci6.short_name,'): ', 'Toc Level: ' ,IFNULL(tl2.name , 'Not provider'), ', ToC result title:' ,IFNULL(tr2.title, 'Not provider')) SEPARATOR ', ') as "ToC Mapping (Contributting initiatives)",
    -- section 3
    if(rt.id <> 6, if(r.no_applicable_partner=1, "No", "Yes"), "Yes") as "Are partners applicable?",
    if(rt.id <> 6,(select GROUP_CONCAT(DISTINCT concat('• ', q1.partner) SEPARATOR '\n')
    from (select concat(concat(if(coalesce(ci7.acronym, '') = '', '', concat(ci7.acronym, ' - ')), ci7.name), '; Delivery type(s): ', group_concat(distinct pdt.name separator ', ')) as partner
    FROM results_by_institution rbi
    left join result_by_institutions_by_deliveries_type rbibdt 
          on rbibdt.result_by_institution_id = rbi.id 
        and rbibdt.is_active > 0
    left join clarisa_institutions ci7 
          on ci7.id = rbi.institutions_id
    left JOIN partner_delivery_type pdt 
          on pdt.id = rbibdt.partner_delivery_type_id
      WHERE rbi.result_id = r.id
        and rbi.institution_roles_id = 2
        and rbi.is_active > 0
    GROUP by rbi.result_id, ci7.id) as q1), 'Not Applicable') as "Partners (with delivery type) for non-KP results",
      if(rt.id = 6, (SELECT group_concat(distinct concat('• ', q1.partner) separator '\n')
    from ( select concat('CGSpace Institution: ', rkmi.intitution_name, '; Mapped institution: ', if(rbi.id is null, 'None', concat(concat(if(coalesce(ci8.acronym, '') = '', '', concat(ci8.acronym, ' - ')), ci8.name), '; Delivery type(s): ', group_concat(distinct pdt.name separator ', ')))) as partner
    FROM results_kp_mqap_institutions rkmi
    left join results_knowledge_product rkp on rkmi.result_knowledge_product_id = rkp.result_knowledge_product_id and rkp.is_active > 0
    left join results_by_institution rbi on	rkmi.results_by_institutions_id = rbi.id and rbi.is_active > 0 and rbi.institution_roles_id = 2
    left join result_by_institutions_by_deliveries_type rbibdt on rbibdt.result_by_institution_id = rbi.id and rbibdt.is_active > 0
    left join clarisa_institutions ci8 on ci8.id = rbi.institutions_id
    left JOIN partner_delivery_type pdt on pdt.id = rbibdt.partner_delivery_type_id
    WHERE rkmi.is_active > 0 and rkp.results_id = r.id
    GROUP by rkp.results_id, rbi.institutions_id, rkmi.intitution_name, rkmi.results_by_institutions_id) as q1), 'Not Applicable') as "Partners (with delivery type) for KP results",
    if(rt.id = 6, if(r.no_applicable_partner=1, "No", "Yes"), 'Not Applicable') as "Are additional partners for KP results applicable?",
    if(rt.id = 6,(select GROUP_CONCAT(DISTINCT concat('• ', q1.partner) SEPARATOR '\n')
    from (select concat(concat(if(coalesce(ci7.acronym, '') = '', '', concat(ci7.acronym, ' - ')), ci7.name), '; Delivery type(s): ', group_concat(distinct pdt.name separator ', ')) as partner
    FROM results_by_institution rbi
    left join result_by_institutions_by_deliveries_type rbibdt 
          on rbibdt.result_by_institution_id = rbi.id 
        and rbibdt.is_active > 0
    left join clarisa_institutions ci7 
          on ci7.id = rbi.institutions_id
    left JOIN partner_delivery_type pdt 
          on pdt.id = rbibdt.partner_delivery_type_id
      WHERE rbi.result_id = r.id
        and rbi.institution_roles_id = 8
        and rbi.is_active > 0
    GROUP by rbi.result_id, ci7.id) as q1), 'Not Applicable') as "Additional partners (with delivery type) for KP results",
    -- section 4
    (SELECT if(cgs.name is null, 'Not Provided', (if(cgs.id = 3, 'National', cgs.name))) 
  FROM clarisa_geographic_scope cgs
 WHERE cgs.id = r.geographic_scope_id
 GROUP BY cgs.id,cgs.name) as "Geographic Focus",
    ( SELECT GROUP_CONCAT(DISTINCT cr.name separator ', ')
     FROM result_region rr
left join clarisa_regions cr 
       on cr.um49Code = rr.region_id 
    WHERE rr.result_id  =  r.id
      and rr.is_active = 1) as "Regions",
     (SELECT if(rt.id<>6, GROUP_CONCAT(DISTINCT cc3.name separator ', '), rkp.cgspace_countries) 
     FROM result_country rc2
left join clarisa_countries cc3 
       on cc3.id = rc2.country_id 
    WHERE rc2.result_id  = r.id
      and rc2.is_active = 1) as "Countries",
    -- section 5
    GROUP_CONCAT(DISTINCT CONCAT('(',res2.result_code,': ',res2.result_type,' - ', res2.title,')')) as "Linked Results",
 /* GROUP_CONCAT(DISTINCT lr2.legacy_link separator ', ') as "Results from previous portfolio", */
 (SELECT GROUP_CONCAT(DISTINCT lr2.legacy_link separator ', ')
  FROM linked_result lr2
 WHERE lr2.origin_result_id = 28
    and lr2.linked_results_id is NULL 
    and lr2.is_active > 0
    and lr2.legacy_link is not NULL) as "Results from previous portfolio",
    -- section 6
   /* GROUP_CONCAT(DISTINCT CONCAT('• Link: ', e.link, '; Gender related? ', IF(COALESCE(e.gender_related, 0) = 1, 'Yes', 'No'), '; Youth related? ', IF(COALESCE(e.youth_related, 0) = 1, 'Yes', 'No'), '; Details: ', COALESCE(e.description, 'Not Provided')) SEPARATOR '\n') as "Evidences" */
   (SELECT GROUP_CONCAT(DISTINCT CONCAT(
        '• Link: ', 
        COALESCE(e.link, 'Not Provided'), 
        '; Gender related? ', 
        IF(COALESCE(e.gender_related, 0) = 1, 'Yes', 'No'), 
        '; Youth related? ', 
        IF(COALESCE(e.youth_related, 0) = 1, 'Yes', 'No'), 
        '; Nutrition related? ', 
        IF(COALESCE(e.nutrition_related, 0) = 1, 'Yes', 'No'), 
        '; Environment and/or biodiversity related? ', 
        IF(COALESCE(e.environmental_biodiversity_related, 0) = 1, 'Yes', 'No'), 
        '; Poverty related? ', 
        IF(COALESCE(e.poverty_related, 0) = 1, 'Yes', 'No'), 
        '; Details: ', 
        COALESCE(e.description, 'Not Provided')
    ) SEPARATOR '\n')
    FROM evidence e
    WHERE e.result_id = r.id
      AND e.is_active > 0) AS "Evidences"
    FROM 
    result r
    left join gender_tag_level gtl on gtl.id = r.gender_tag_level_id 
    left join gender_tag_level gtl2 on gtl2.id = r.climate_change_tag_level_id 
    left join gender_tag_level gtl3 on gtl3.id = r.nutrition_tag_level_id 
    left join gender_tag_level gtl4 on gtl4.id = r.environmental_biodiversity_tag_level_id
    left join gender_tag_level gtl5 on gtl5.id = r.poverty_tag_level_id
    left join results_by_inititiative rbi on rbi.result_id = r.id 
    and rbi.initiative_role_id = 1
    and rbi.is_active > 0
    left join clarisa_initiatives ci on ci.id = rbi.inititiative_id
    left join results_by_inititiative rbi2 on rbi2.result_id = r.id 
    and rbi2.initiative_role_id = 2
    and rbi2.is_active > 0
    left join clarisa_initiatives ci2 on ci2.id = rbi2.inititiative_id 
    left join result_level rl ON rl.id = r.result_level_id 
    left join result_type rt on rt.id = r.result_type_id 
    left join non_pooled_project npp on npp.results_id = r.id 
    and npp.is_active > 0
    left JOIN clarisa_center cc on cc.code = npp.lead_center_id 
    left join clarisa_institutions ci3 on ci3.id = cc.institutionId 
    left join clarisa_institutions ci4 on ci4.id = npp.funder_institution_id 
    left join results_center rc on rc.result_id = r.id 
    and rc.is_active > 0
    left join clarisa_center cc2 on cc2.code = rc.center_id 
    left join clarisa_institutions ci5 on ci5.id = cc2.institutionId 
    left join results_toc_result rtr on rtr.results_id = r.id 
    and rtr.initiative_id = ci.id 
    and rtr.is_active > 0
    left join toc_result tr on tr.toc_result_id = rtr.toc_result_id
    left join toc_level tl on tl.toc_level_id = tr.toc_level_id 
    left join results_toc_result rtr2 on rtr2.results_id = r.id 
    and rtr2.initiative_id <> ci.id 
    and rtr2.is_active > 0
    left join clarisa_initiatives ci6 on ci6.id = rtr2.initiative_id 
    left join toc_result tr2 on tr2.toc_result_id = rtr2.toc_result_id
    left join toc_level tl2 on tl2.toc_level_id = tr2.toc_level_id
/*  left join (select rbi3.result_id, ci7.name, GROUP_CONCAT(pdt.name separator ', ') as deliveries_type  
    from results_by_institution rbi3 
    left join result_by_institutions_by_deliveries_type rbibdt on rbibdt.result_by_institution_id = rbi3.id 
    and rbibdt.is_active > 0
    left join clarisa_institutions ci7 on ci7.id = rbi3.institutions_id
    left JOIN partner_delivery_type pdt on pdt.id = rbibdt.partner_delivery_type_id
    WHERE rbi3.institution_roles_id = 2
    and rbi3.is_active > 0
    GROUP by rbi3.result_id, ci7.name) prt on prt.result_id = r.id */
  /*  left join result_region rr ON rr.result_id = r.id 
    and rr.is_active > 0
    left join clarisa_regions cr on cr.um49Code = rr.region_id 
    left join result_country rc2 on rc2.result_id = r.id 
    and rc2.is_active > 0
    left join clarisa_countries cc3 on cc3.id = rc2.country_id 
    left join clarisa_geographic_scope cgs ON cgs.id = r.geographic_scope_id */
    left join linked_result lr on lr.origin_result_id = r.id
    and lr.linked_results_id is not NULL 
    and lr.is_active > 0
    and lr.legacy_link is NULL 
    left join (select r2.id, r2.result_code, r2.title, rt2.name as result_type 
    from result r2 
    left join result_type rt2 on rt2.id = r2.result_type_id
    where r2.is_active > 0) res2 on res2.id = lr.linked_results_id
   /* left join linked_result lr2 on lr2.origin_result_id = r.id
    and lr2.linked_results_id is NULL 
    and lr2.is_active > 0
    and lr2.legacy_link is not NULL */
    left join results_knowledge_product rkp on rkp.results_id = r.id and rkp.is_active > 0
    INNER JOIN result_status rs ON rs.result_status_id = r.status_id 
  /*  left join evidence e on e.result_id = r.id and e.is_active > 0 */
    WHERE r.result_type_id = 6
    	and r.is_active > 0
    	and r.in_qa = 1
    	and rkp.is_melia = 1
    GROUP by 
    r.result_code,
    r.id,
    r.title,
    r.description,
    gtl.title,
    gtl2.title,
    gtl3.title,
    gtl4.title,
    gtl5.title,
    rl.name,
    rt.name,
    r.is_krs,
    r.lead_contact_person,
    ci.official_code,
    rtr.result_toc_result_id,
    ci.official_code,
    ci.short_name,
    r.no_applicable_partner,
    rkp.cgspace_countries,
    rt.id,
    ci.name