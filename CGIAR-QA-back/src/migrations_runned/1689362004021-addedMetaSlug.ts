import {MigrationInterface, QueryRunner} from "typeorm";

export class addedMetaSlug1689362004021 implements MigrationInterface {
    name = 'addedMetaSlug1689362004021'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` ADD `indicator_slug` text NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` DROP COLUMN `indicator_slug`", undefined);
    }

}
