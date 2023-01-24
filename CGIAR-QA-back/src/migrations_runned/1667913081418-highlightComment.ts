import {MigrationInterface, QueryRunner} from "typeorm";

export class highlightComment1667913081418 implements MigrationInterface {
    name = 'highlightComment1667913081418'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` ADD `highlight_comment` tinyint NULL DEFAULT 0", undefined);
        await queryRunner.query("ALTER TABLE `qa_comments` ADD `highlightById` int NULL", undefined);
        await queryRunner.query("ALTER TABLE `qa_comments` ADD CONSTRAINT `FK_5a9b0f69b61fdc583925cb71804` FOREIGN KEY (`highlightById`) REFERENCES `qa_users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION", undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("ALTER TABLE `qa_comments` DROP FOREIGN KEY `FK_5a9b0f69b61fdc583925cb71804`", undefined);
        await queryRunner.query("ALTER TABLE `qa_comments` DROP COLUMN `highlightById`", undefined);
        await queryRunner.query("ALTER TABLE `qa_comments` DROP COLUMN `highlight_comment`", undefined);
    }

}
