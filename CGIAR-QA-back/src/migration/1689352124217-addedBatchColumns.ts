import {MigrationInterface, QueryRunner} from "typeorm";

export class addedBatchColumns1689352124217 implements MigrationInterface {
    name = 'addedBatchColumns1689352124217'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` DROP COLUMN `indicator_slug`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `qa_batchcol` varchar(45) NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `idts_start_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `idts_end_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `lead_assesor_start_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `lead_assesor_end_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `tpb_start_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `tpb_end_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `ppu_start_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` ADD `ppu_end_date` datetime NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_evaluations` CHANGE `batchDate` `batchDate` datetime NOT NULL DEFAULT NOW()", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_evaluations` CHANGE `batchDate` `batchDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `ppu_end_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `ppu_start_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `tpb_end_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `tpb_start_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `lead_assesor_end_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `lead_assesor_start_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `idts_end_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `idts_start_date`", undefined);
        await queryRunner.query("ALTER TABLE `qa_batch` DROP COLUMN `qa_batchcol`", undefined);
        await queryRunner.query("ALTER TABLE `qa_indicators_meta` ADD `indicator_slug` text NULL", undefined);
    }

}
