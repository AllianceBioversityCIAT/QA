import {MigrationInterface, QueryRunner} from "typeorm";

export class qaNewDates1673363214549 implements MigrationInterface {
    name = 'qaNewDates1673363214549'


    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE qa_batch
        ADD COLUMN qa_batchcol VARCHAR(45) NULL AFTER phase_year,
        ADD COLUMN idts_start_date DATETIME NULL AFTER qa_batchcol,
        ADD COLUMN idts_end_date DATETIME NULL AFTER idts_start_date,
        ADD COLUMN lead_assesor_start_date DATETIME NULL AFTER idts_end_date,
        ADD COLUMN lead_assesor_end_date DATETIME NULL AFTER lead_assesor_start_date,
        ADD COLUMN tpb_start_date DATETIME NULL AFTER lead_assesor_end_date,
        ADD COLUMN tpb_end_date DATETIME NULL AFTER tpb_start_date,
        ADD COLUMN ppu_start_date DATETIME NULL AFTER tpb_end_date,
        ADD COLUMN ppu_end_date DATETIME NULL AFTER ppu_start_date;`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
