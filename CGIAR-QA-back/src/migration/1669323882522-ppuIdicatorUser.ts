import {MigrationInterface, QueryRunner} from "typeorm";

export class ppuIdicatorUser1669323882522 implements MigrationInterface {
    name = 'ppuIdicatorUser1669323882522'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicator_user` ADD `isPPU` tinyint NOT NULL DEFAULT 0", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicator_user` DROP COLUMN `isPPU`", undefined);
    }

}
