import {MigrationInterface, QueryRunner} from "typeorm";

export class addedIsActiveColumn1698954726834 implements MigrationInterface {
    name = 'addedIsActiveColumn1698954726834'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators` ADD `is_active` tinyint NULL DEFAULT 1", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators` DROP COLUMN `is_active`", undefined);
    }

}
