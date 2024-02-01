import {MigrationInterface, QueryRunner} from "typeorm";

export class alterCapacity1698954813805 implements MigrationInterface {
    name = 'alterCapacity1698954813805'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            UPDATE qa_indicators
            SET is_active = 0
            WHERE id = 2;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
    }

}
