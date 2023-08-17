import {MigrationInterface, QueryRunner} from "typeorm";

export class addedEnableAssessorParameter1686855986278 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
        INSERT INTO
            qa_comments_meta (
                enable_crp,
                enable_assessor,
                indicatorId
            )
        VALUES
            (1, 0, 10);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
