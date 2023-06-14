import { MigrationInterface, QueryRunner } from "typeorm";

export class adddedIPSRsection1686751739761 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`
        INSERT INTO
            qa_indicators (
                id,
                name,
                description,
                primary_field,
                view_name,
                \`order\`
            )
        VALUES
            (
                10,
                'Innovation Use (IPSR)',
                'Condensed list of significant Innovation Use (IPSR)',
                'id',
                'qa_innovation_use_ipsr',
                10
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {}
}
