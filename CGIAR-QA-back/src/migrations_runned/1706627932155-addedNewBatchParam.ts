import {MigrationInterface, QueryRunner} from "typeorm";

export class addedNewBatchParam1706627932155 implements MigrationInterface {
    name = 'addedNewBatchParam1706627932155'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `is_open` tinyint NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `is_open`", undefined);
    }

}
