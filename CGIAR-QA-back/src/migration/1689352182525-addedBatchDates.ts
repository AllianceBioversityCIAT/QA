import {MigrationInterface, QueryRunner} from "typeorm";

export class addedBatchDates1689352182525 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
        UPDATE
            qa_batch
        SET
            submission_date = '2023-08-15 12:00:00',
            assessors_start_date = '2023-08-21 12:00:00',
            assessors_end_date = '2023-08-25 12:00:00',
            programs_start_date = '2022-08-25 12:00:00',
            programs_end_date = '2022-06-01 12:00:00',
            batch_name = '3',
            phase_year = 2023,
            qa_batchcol = NULL,
            idts_start_date = '2023-08-28 12:00:00',
            idts_end_date = '2023-09-01 12:00:00',
            lead_assesor_start_date = '2023-09-04 12:00:00',
            lead_assesor_end_date = '2023-09-05 12:00:00',
            tpb_start_date = '2023-09-06 12:00:00',
            tpb_end_date = '2023-09-07 12:00:00',
            ppu_start_date = '2023-09-08 12:00:00',
            ppu_end_date = NULL
        WHERE
            id = 3;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
