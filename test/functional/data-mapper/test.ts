import "reflect-metadata";
import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Connection } from "typeorm";
import { Post } from "./entity/Post";
import { VersionRepository, VersionEvent } from "../../../src";

describe("Data Mapper", () => {

    let connections: Connection[] = [];
    before(async () => connections = await createTestingConnections({
        entities: [Post],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => connections && closeTestingConnections(connections));

    it("save 1 item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        post = await postRepository.save(post);

        const versionRepository = VersionRepository(connection)
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

        const versionRepository = VersionRepository(connection)
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

        post.content = "there!";
        post = await postRepository.save(post);

        const versionRepository = VersionRepository(connection)
        const versions = await versionRepository.allForEntity(post);

        expect(versions.length).to.equal(2);
        expect(versions[0].event).to.equal(VersionEvent.UPDATE, `failed for ${connection.name}`);
        expect(versions[0].itemId).to.equal(post.id.toString());
        expect(versions[0].itemType).to.equal(post.constructor.name);
    })));

    it("remove item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "hello";
        post.content = "World";
        post = await postRepository.save(post);

        const postId = post.id;

        await postRepository.remove(post);

        const versionRepository = VersionRepository(connection)
        const versions = await versionRepository.allForEntity(post, postId);

        expect(versions.length).to.equal(2, `failed for ${connection.name}`);
        expect(versions[0].event).to.equal(VersionEvent.REMOVE);
        expect(versions[0].itemId).to.equal(postId.toString());
        expect(versions[0].itemType).to.equal(post.constructor.name);
    })));

    it("recover item", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "Hello";
        post.content = "World";
        post = await postRepository.save(post);

        post.title = "Bye";
        post = await postRepository.save(post);

        const versionRepository = VersionRepository(connection)
        const previousVersion = await versionRepository.previousForEntity(post);

        expect(previousVersion).to.not.equal(undefined);

        post = previousVersion!.getObject<Post>();
        await postRepository.save(post);

        const versions = await versionRepository.allForEntity(post);
        expect(versions.length).to.eq(3, `failed for ${connection.name}`);
        expect(await postRepository.count()).to.equal(1);
    })));

    it("version navigation", () => Promise.all(connections.map(async connection => {
        const postRepository = connection.getRepository(Post);

        let post = new Post();
        post.title = "Hello";
        post.content = "World";
        post = await postRepository.save(post);

        post.title = "Bye";
        post = await postRepository.save(post);

        const versionRepository = VersionRepository(connection)
        const previousVersion = await versionRepository.previousForEntity(post);
        const latestVersion = await versionRepository.latestForEntity(post);

        expect((await previousVersion!.next())!.id).to.equal(latestVersion!.id, `failed for ${connection.name}`);
        expect((await latestVersion!.previous())!.id).to.equal(previousVersion!.id, `failed for ${connection.name}`);

        expect(await previousVersion!.previous()).to.equal(null, `failed for ${connection.name}`);
        expect(await latestVersion!.next()).to.equal(null, `failed for ${connection.name}`);
    })));

});
