import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class AddVersionMigration implements MigrationInterface {

    tableName: string = "version";

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: this.tableName,
            columns: [
                {
                    name: "id",
                    type: queryRunner.connection.driver.normalizeType({
                        type: queryRunner.connection.driver.mappedDataTypes.migrationId, // good enough
                    }),
                    isGenerated: true,
                    generationStrategy: "increment",
                    isPrimary: true,
                },
                {
                    name: "itemType",
                    type: queryRunner.connection.driver.normalizeType({ type: String }),
                    isNullable: false,
                },
                {
                    name: "itemId",
                    type: queryRunner.connection.driver.normalizeType({ type: String }),
                    isNullable: false,
                },
                {
                    name: "event",
                    type: queryRunner.connection.driver.normalizeType({ type: String }),
                    isNullable: false,
                },
                {
                    name: "owner",
                    type: queryRunner.connection.driver.normalizeType({ type: String }),
                    isNullable: false,
                },
                {
                    name: "object",
                    type: queryRunner.connection.driver.normalizeType({ type: "simple-json" }),
                    isNullable: false,
                },
                {
                    name: "timestamp",
                    type: queryRunner.connection.driver.normalizeType({ 
                        type: queryRunner.connection.driver.mappedDataTypes.createDate,
                        precision: queryRunner.connection.driver.mappedDataTypes.createDatePrecision
                    }),
                    precision: 6,
                    isNullable: false,
                },
            ],
        }), true);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(this.tableName);
    }

}