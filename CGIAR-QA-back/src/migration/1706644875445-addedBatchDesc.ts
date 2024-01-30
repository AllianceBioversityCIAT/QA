import {MigrationInterface, QueryRunner} from "typeorm";

export class addedBatchDesc1706644875445 implements MigrationInterface {
    name = 'addedBatchDesc1706644875445'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `qa_batch_desc` text NULL", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `qa_batch_desc`", undefined);
    }

}
