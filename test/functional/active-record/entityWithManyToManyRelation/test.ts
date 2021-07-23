import "reflect-metadata";
import "mocha";
import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Connection } from "typeorm";
import { Post } from "./entity/Post";
import { Version, VersionEvent } from "../../../src";

describe("Active Record", () => {

    let connections: Connection[] = [];
    before(async () => connections = await createTestingConnections({
        entities: [Post],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    describe('Simple entity', () => {
        it("save 1 item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            const versions = await post.versions().list();

            expect(versions.length).to.equal(1);
            expect(versions[0].event).to.equal(VersionEvent.INSERT);
            expect(versions[0].itemId).to.equal(post.id.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("save 2 items", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            let post2 = new Post();
            post2.title = "hello";
            post2.content = "again";
            await post2.save();

            const versions = await post2.versions().list();

            expect(versions.length).to.equal(1);
            expect(versions[0].event).to.equal(VersionEvent.INSERT);
            expect(versions[0].itemId).to.equal(post2.id.toString());
            expect(versions[0].itemType).to.equal(post2.constructor.name);
        })));

        it("update item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            post.content = "there!";
            await post.save();

            const versions = await post.versions().list();

            expect(versions.length).to.equal(2, `failed for ${connection.name}`);
            expect(versions[0].event).to.equal(VersionEvent.UPDATE, `failed for ${connection.name}`);
            expect(versions[0].itemId).to.equal(post.id.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("remove item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            const postId = post.id;

            await post.remove();

            post.id = postId; // object loses id after removal, add it back to fetch versions
            const versions = await post.versions().list();

            expect(versions.length).to.equal(2, `failed for ${connection.name}`);
            expect(versions[0].event).to.equal(VersionEvent.REMOVE);
            expect(versions[0].itemId).to.equal(postId.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("recover item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "Hello";
            post.content = "World";
            await post.save();

            post.title = "Bye";
            await post.save();

            const previousPost = await post.versions().previousObject();

            expect(previousPost).to.not.equal(undefined);

            await previousPost!.save();

            const versions = await post.versions().list();
            expect(versions.length).to.eq(3, `failed for ${connection.name}`);
            expect(await Post.count()).to.equal(1);
        })));

        it("version navigation", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "Hello";
            post.content = "World";
            await post.save();

            post.title = "Bye";
            await post.save();

            const previousVersion = await post.versions().previous();
            const latestVersion = await post.versions().latest();

            expect((await previousVersion!.next())!.id).to.equal(latestVersion!.id, `failed for ${connection.name}`);
            expect((await latestVersion!.previous())!.id).to
              .equal(previousVersion!.id, `failed for ${connection.name}`);

            expect(await previousVersion!.previous()).to.equal(undefined, `failed for ${connection.name}`);
            expect(await latestVersion!.next()).to.equal(undefined, `failed for ${connection.name}`);
        })));
    });

    describe('Entity with ManyToMany relation', () => {
        it("save 1 item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);
            Category.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            const versions = await post.versions().list();

            expect(versions.length).to.equal(1);
            expect(versions[0].event).to.equal(VersionEvent.INSERT);
            expect(versions[0].itemId).to.equal(post.id.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("save 2 items", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            let post2 = new Post();
            post2.title = "hello";
            post2.content = "again";
            await post2.save();

            const versions = await post2.versions().list();

            expect(versions.length).to.equal(1);
            expect(versions[0].event).to.equal(VersionEvent.INSERT);
            expect(versions[0].itemId).to.equal(post2.id.toString());
            expect(versions[0].itemType).to.equal(post2.constructor.name);
        })));

        it("update item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            post.content = "there!";
            await post.save();

            const versions = await post.versions().list();

            expect(versions.length).to.equal(2, `failed for ${connection.name}`);
            expect(versions[0].event).to.equal(VersionEvent.UPDATE, `failed for ${connection.name}`);
            expect(versions[0].itemId).to.equal(post.id.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("remove item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "hello";
            post.content = "World";
            await post.save();

            const postId = post.id;

            await post.remove();

            post.id = postId; // object loses id after removal, add it back to fetch versions
            const versions = await post.versions().list();

            expect(versions.length).to.equal(2, `failed for ${connection.name}`);
            expect(versions[0].event).to.equal(VersionEvent.REMOVE);
            expect(versions[0].itemId).to.equal(postId.toString());
            expect(versions[0].itemType).to.equal(post.constructor.name);
        })));

        it("recover item", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "Hello";
            post.content = "World";
            await post.save();

            post.title = "Bye";
            await post.save();

            const previousPost = await post.versions().previousObject();

            expect(previousPost).to.not.equal(undefined);

            await previousPost!.save();

            const versions = await post.versions().list();
            expect(versions.length).to.eq(3, `failed for ${connection.name}`);
            expect(await Post.count()).to.equal(1);
        })));

        it("version navigation", () => Promise.all(connections.map(async connection => {
            Post.useConnection(connection);

            let post = new Post();
            post.title = "Hello";
            post.content = "World";
            await post.save();

            post.title = "Bye";
            await post.save();

            const previousVersion = await post.versions().previous();
            const latestVersion = await post.versions().latest();

            expect((await previousVersion!.next())!.id).to.equal(latestVersion!.id, `failed for ${connection.name}`);
            expect((await latestVersion!.previous())!.id).to
              .equal(previousVersion!.id, `failed for ${connection.name}`);

            expect(await previousVersion!.previous()).to.equal(undefined, `failed for ${connection.name}`);
            expect(await latestVersion!.next()).to.equal(undefined, `failed for ${connection.name}`);
        })));
    });
});
