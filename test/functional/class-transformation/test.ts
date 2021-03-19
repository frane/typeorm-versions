import "reflect-metadata";
import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Connection } from "typeorm";
import { VersionRepository, VersionEvent } from "../../../src";
import { Foo } from "./entity/Foo";


describe("Class Transformation", () => {

    let connections: Connection[] = [];
    before(async () => connections = await createTestingConnections({
        entities: [Foo],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => connections && closeTestingConnections(connections));

    it("recover saved item with custom types", () => Promise.all(connections.map(async connection => {
        const fooRepository = connection.getRepository(Foo);

        const foo = new Foo();
        await fooRepository.save(foo);

        const versionRepository = connection.getCustomRepository(VersionRepository);
        const versionedFoo = await versionRepository.latestObjectForEntity(foo);

        expect(versionedFoo).to.eql(foo);
        expect(versionedFoo).to.be.a(typeof foo);
        expect(versionedFoo!.bar).to.be.a(typeof foo.bar);
        expect(versionedFoo!.d).to.be.a('Date');
    })));

});