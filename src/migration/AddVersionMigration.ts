import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class AddVersionMigration implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "version",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                },
                {
                    name: "itemType",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "itemId",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "event",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "owner",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "object",
                    type: "json",
                    isNullable: false,
                },
                {
                    name: "timestamp",
                    type: "timestamp",
                    isNullable: false,
                    default: "now()",
                },
            ],
        }), true)
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("version");
    }

}