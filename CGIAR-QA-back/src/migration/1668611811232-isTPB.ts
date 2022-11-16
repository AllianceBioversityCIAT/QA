import {MigrationInterface, QueryRunner} from "typeorm";

export class isTPB1668611811232 implements MigrationInterface {
    name = 'isTPB1668611811232'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicator_user` ADD `isTPB` tinyint NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicator_user` DROP COLUMN `isTPB`", undefined);
    }

}
