import {MigrationInterface, QueryRunner} from "typeorm";

export class innovationUseIPSRMeta1687545127268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'result_level',
                'Result level',
                1,
                0,
                1,
                1,
                1,
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
                2,
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
                3,
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
                4,
                'Selected core innovation',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'core_innovation'
            ),
            (
                'geo_scope',
                'Geographic scope',
                1,
                0,
                1,
                1,
                5,
                'Geographic scope',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'geo_scope'
            ),
            (
                'geo_focus',
                'Geographic focus',
                1,
                0,
                1,
                1,
                6,
                'Geographic focus',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'geo_focus'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'reported_year',
                'Reporting year',
                0,
                0,
                1,
                1,
                7,
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
                8,
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
                9,
                'Description',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'description'
            ),
            (
                'gender_tag_level',
                'Gender tag level',
                1,
                0,
                1,
                1,
                10,
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
                11,
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
                12,
                'Is this result featured in a Key Result Story for the Reporting year?',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'is_krs'
            );`);
        
        await queryRunner.query(`    
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'lead_initiative_toc',
                'Lead initiative Theory of Change',
                1,
                0,
                1,
                1,
                13,
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
                14,
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
                15,
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
                16,
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
                17,
                'Contributing centers',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'contributing_centers'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'eoi_outcomes',
                'End-of-Initiative Outcome(s)',
                1,
                0,
                1,
                1,
                18,
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
                19,
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
                20,
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
                21,
                'Sustainable Development Goal Target(s)',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'sdgs'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                22,
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
                23,
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
                24,
                'Other quantitative measures of innovation use',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'other_quantity'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                25,
                'Specify scaling partner(s)',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'specify_scaling_partners'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'innovation_pack_experts',
                'Identified group of various public and private experts that should participate in the Innovation Package',
                0,
                0,
                1,
                1,
                26,
                'Identified group of various public and private experts that should participate in the Innovation Package',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'innovation_pack_experts'
            ),
            (
                'experts_is_diverse',
                'Engaging a diverse group of experts leads to better and more realistic innovation package design and assessment',
                0,
                0,
                1,
                1,
                27,
                'Identified group of various public and private experts that should participate in the Innovation Package',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'experts_is_diverse'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'consensus_and_consultation',
                'Consensus and Consultation',
                0,
                0,
                1,
                1,
                28,
                'Consensus and Consultation',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'consensus_and_consultation'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'existing_complementary_innovation',
                'Existing Complementary innovation/ lenabler/ solution that GIAR and partners (already reported)',
                1,
                0,
                1,
                1,
                29,
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
                30,
                'New complementary innovations/ enablers/ solutions',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'new_complementary_innovation'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                'Was an Innovation Packaging and Scaling Readiness online or in-person expert workshop organized?',
                0,
                0,
                1,
                1,
                31,
                'Was an Innovation Packaging and Scaling Readiness online or in-person expert workshop organized?',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'expert_workshop_organized'
            ),
            (
                'workshop_facilitators',
                'Specify the IPSR expert workshop facilitators',
                0,
                0,
                1,
                1,
                32,
                'Specify the IPSR expert workshop facilitators',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'workshop_facilitators'
            ),
            (
                'workshop_list_of_participants',
                'Workshop list of participants',
                1,
                0,
                1,
                1,
                33,
                'Workshop list of participants',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'workshop_list_of_participants'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                34,
                'What was assessed during the expert workshop?',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'what_was_assessed_during_the_workshop'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                1,
                0,
                1,
                1,
                35,
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
                36,
                'Evidence-based assessment of complementary innovation(s)',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                1,
                'complementary_innovation_evidence_based_assessment'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
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
                37,
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
                38,
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
                39,
                'Current use of the core innovation: Other quantitative measures',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                1,
                'core_innovation_measures'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'expected_lead_initiative_investment',
                'Expected CGIAR Lead Initiative investment',
                0,
                0,
                1,
                1,
                40,
                'Expected CGIAR Lead Initiative investment',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'expected_lead_initiative_investment'
            ),
            (
                'expected_contributing_initiative_investment',
                'Expected CGIAR Contributing Initiative(s) investment',
                0,
                0,
                1,
                1,
                41,
                'Expected CGIAR Contributing Initiative(s) investment',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'expected_contributing_initiative_investment'
            ),
            (
                'bilateral_project_investment',
                'Non-pooled / bilateral project(s) investment',
                0,
                0,
                1,
                1,
                42,
                'Non-pooled / bilateral project(s) investment',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'bilateral_project_investment'
            ),
            (
                'expected_partner_investment',
                'Partner investment (from own resources)',
                0,
                0,
                1,
                1,
                43,
                'Partner investment (from own resources)',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'expected_partner_investment'
            );`);
        
        await queryRunner.query(`
        INSERT INTO
            qa_indicators_meta (
                col_name,
                display_name,
                enable_comments,
                is_primay,
                include_general,
                include_detail,
                \`order\`,
                description,
                createdAt,
                updatedAt,
                indicatorId,
                is_core,
                indicator_slug
            )
        VALUES
            (
                'linked_result',
                'Linked result(s)',
                1,
                0,
                1,
                1,
                44,
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
                45,
                'Results from previous portfolio',
                CURRENT_TIMESTAMP(6),
                CURRENT_TIMESTAMP(6),
                10,
                0,
                'results_from_previous_portfolio'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
