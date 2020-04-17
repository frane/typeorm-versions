import {MigrationInterface, QueryRunner, Table} from "typeorm";
import {SqliteDriver} from 'typeorm/driver/sqlite/SqliteDriver';

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
                    type: queryRunner.connection.driver.mappedDataTypes.createDate as string,
                    isNullable: false,
                    precision: 6
                },
            ],
        }), true);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("version");
    }

}