import {MigrationInterface, QueryRunner} from "typeorm";

export class addPpuAtribute1669911281006 implements MigrationInterface {
    name = 'addPpuAtribute1669911281006'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` ADD `ppu` tinyint NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` DROP COLUMN `ppu`", undefined);
    }

}
