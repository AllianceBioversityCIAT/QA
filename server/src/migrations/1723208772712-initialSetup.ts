import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSetup1723208772712 implements MigrationInterface {
  name = 'InitialSetup1723208772712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    `SELECT * FROM "qa_users"`;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
