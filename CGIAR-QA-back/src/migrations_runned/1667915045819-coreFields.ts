import {MigrationInterface, QueryRunner} from "typeorm";

export class coreFields1667915045819 implements MigrationInterface {
    name = 'coreFields1667915045819'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` ADD `is_core` tinyint NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` DROP COLUMN `is_core`", undefined);
    }

}
