import {MigrationInterface, QueryRunner} from "typeorm";

export class tpbCommentEntity1669318510883 implements MigrationInterface {
    name = 'tpbCommentEntity1669318510883'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` ADD `tpb` tinyint NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` DROP COLUMN `tpb`", undefined);
    }

}
