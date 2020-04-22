import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddVersionMigration implements MigrationInterface {
    tableName: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
//# sourceMappingURL=AddVersionMigration.d.ts.map