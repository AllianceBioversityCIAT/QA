import {MigrationInterface, QueryRunner} from "typeorm";

export class tpbRequireChanges1668610003396 implements MigrationInterface {
    name = 'tpbRequireChanges1668610003396'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` ADD `require_changes` tinyint NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `qa_evaluations` CHANGE `batchDate` `batchDate` datetime NOT NULL DEFAULT NOW()", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` DROP COLUMN `require_changes`", undefined);
    }

}
