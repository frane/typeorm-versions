import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Connection, MigrationExecutor } from "typeorm";
import { AddVersionMigration } from "../../../src/migration/AddVersionMigration";

class Version1000000000001 extends AddVersionMigration { tableName = "version1"}
class Version1000000000002 extends AddVersionMigration { tableName = "version2" }

describe("Migration", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        schemaCreate: true,
        dropSchema: true,
        migrations: [Version1000000000001, Version1000000000002],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("can recognise the pending migrations", () => Promise.all(connections.map(async connection => {
        const migrations = await connection.showMigrations();
        migrations.should.be.equal(true);
    })));

    it("inherits from AddVersionMigration", () => Promise.all(connections.map(async connection => {
        const migrationExecutor = new MigrationExecutor(connection);
        const migrations = await migrationExecutor.getAllMigrations();
        expect(migrations.pop()!.instance instanceof AddVersionMigration).to.equal(true);
    })));

    it("multiple with different names", () => Promise.all(connections.map(async connection => {
        const migrations = await connection.runMigrations({ transaction: "none" });
        const tables = (await connection.createQueryRunner().getTables(
            migrations.map( m => (m.instance! as AddVersionMigration).tableName )
        )).sort((a, b) => a.name.localeCompare(b.name));

        tables.length.should.be.equal(2);
        expect(tables[0].name).to.equal("version1", `failed for ${connection.name}`);
        expect(tables[1].name).to.equal("version2", `failed for ${connection.name}`);
        expect(tables[0].columns).to.deep.equal(tables[1].columns, `failed for ${connection.name}`);
    })));
    
});