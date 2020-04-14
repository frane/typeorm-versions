import "reflect-metadata";
import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases, sleep } from "../../utils/test-utils";
import { Connection } from "typeorm";
import { Post } from "./entity/Post";
import { VersionRepository, VersionEvent } from "../../../src";

describe("Data Mapper", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [Post],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("save 1 item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        post = await postRepository.save(post);

        const versionRepository = connection.getCustomRepository(VersionRepository);
        const versions = await versionRepository.allForEntity(post);

        expect(versions.length).to.equal(1);
        expect(versions[0].event).to.equal(VersionEvent.INSERT);
        expect(versions[0].itemId).to.equal(post.id.toString());
        expect(versions[0].itemType).to.equal(post.constructor.name);
    })));

    it("save 2 items", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        await postRepository.save(post);

        let post2 = new Post();
        post2.title = "hello";
        post2.content = "again";
        post2 = await postRepository.save(post2);

        const versionRepository = connection.getCustomRepository(VersionRepository);
        const versions = await versionRepository.allForEntity(post2);

        expect(versions.length).to.equal(1);
        expect(versions[0].event).to.equal(VersionEvent.INSERT);
        expect(versions[0].itemId).to.equal(post2.id.toString());
        expect(versions[0].itemType).to.equal(post2.constructor.name);
    })));

    it("update item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        post = await postRepository.save(post);

        // SQLite's datetime has only sec. precision, so "make sure" enough time has passed
        if (connection.name === "sqlite") {
            await sleep(1000);
        }

        post.content = "there!";
        post = await postRepository.save(post);

        const versionRepository = connection.getCustomRepository(VersionRepository);
        const versions = await versionRepository.allForEntity(post);

        expect(versions.length).to.equal(2);
        expect(versions[0].event).to.equal(VersionEvent.UPDATE);
        expect(versions[0].itemId).to.equal(post.id.toString());
        expect(versions[0].itemType).to.equal(post.constructor.name);
    })));

    it("remove item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        post = await postRepository.save(post);

        // SQLite's datetime has only sec. precision, so "make sure" enough time has passed
        if (connection.name === "sqlite") {
            await sleep(1000);
        }

        await postRepository.remove(post);

        const versionRepository = connection.getCustomRepository(VersionRepository);
        const versions = await versionRepository.allForEntity(post);

        expect(versions.length).to.equal(2);
        expect(versions[0].event).to.equal(VersionEvent.REMOVE);
        expect(versions[0].itemId).to.equal(post.id.toString());
        expect(versions[0].itemType).to.equal(post.constructor.name);
    })));

});