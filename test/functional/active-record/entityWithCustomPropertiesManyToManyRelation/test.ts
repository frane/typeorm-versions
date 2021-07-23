import "reflect-metadata";
import "mocha";
import { expect } from "chai";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../../utils/test-utils";
import { Connection } from "typeorm";
import { Post } from "./Post";
import { Category } from "./Category";
import { VersionEvent } from "../../../../src";
import { PostToCategory } from './PostToCategory';

describe("Active Record - Entity with custom properties ManyToMany relation", () => {

    let connections: Connection[] = [];
    before(async () => connections = await createTestingConnections({
        entities: [Post, Category, PostToCategory],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("save 1 item", () => Promise.all(connections.map(async connection => {
        Post.useConnection(connection);
        Category.useConnection(connection);

        const postToCategory = new PostToCategory()
        postToCategory.active = false;

        const category = new Category();
        category.name = 'foo';

        postToCategory.category = category;

        let post = new Post();
        post.title = "hello";
        post.content = "World"
        post.postToCategories = [postToCategory];
        await post.save();

        const postsVersions = await post.versions().list();
        const categoriesVersions = await category.versions().list();

        expect(postsVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(postsVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(postsVersions[0].itemId).to.equal(post.id.toString());
        expect(postsVersions[0].itemType).to.equal(post.constructor.name);

        expect(categoriesVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(categoriesVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(categoriesVersions[0].itemId).to.equal(category.id.toString());
        expect(categoriesVersions[0].itemType).to.equal(category.constructor.name);

    })));
    it("save 2 items", () => Promise.all(connections.map(async connection => {
        Post.useConnection(connection);
        Category.useConnection(connection);

        const postToCategory = new PostToCategory()
        postToCategory.active = false;

        const category = new Category();
        category.name = 'foo';

        postToCategory.category = category;

        let post = new Post();
        post.title = "hello";
        post.content = "World"
        post.postToCategories = [postToCategory];
        await post.save();

        let post2 = new Post();
        post2.title = "hello";
        post2.content = "again";
        post2.postToCategories = [postToCategory]
        await post2.save();

        const postsVersions = await post2.versions().list();
        const categoriesVersions = await category.versions().list();

        expect(postsVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(postsVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(postsVersions[0].itemId).to.equal(post2.id.toString());
        expect(postsVersions[0].itemType).to.equal(post2.constructor.name);

        expect(categoriesVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(categoriesVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(categoriesVersions[0].itemId).to.equal(category.id.toString());
        expect(categoriesVersions[0].itemType).to.equal(category.constructor.name);
    })));

    it("update item", () => Promise.all(connections.map(async connection => {
        Post.useConnection(connection);
        Category.useConnection(connection);

        const postToCategory = new PostToCategory()
        postToCategory.active = false;

        const category = new Category();
        category.name = 'foo';

        postToCategory.category = category;

        let post = new Post();
        post.title = "hello";
        post.content = "World"
        post.postToCategories = [postToCategory];
        await post.save();

        post.content = "there!";
        await post.save();

        const postsVersions = await post.versions().list();
        const categoriesVersions = await category.versions().list();

        expect(postsVersions.length).to.equal(2, `failed for ${connection.name}`);
        expect(postsVersions[0].event).to.equal(VersionEvent.UPDATE, `failed for ${connection.name}`);
        expect(postsVersions[0].itemId).to.equal(post.id.toString());
        expect(postsVersions[0].itemType).to.equal(post.constructor.name);

        expect(categoriesVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(categoriesVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(categoriesVersions[0].itemId).to.equal(category.id.toString());
        expect(categoriesVersions[0].itemType).to.equal(category.constructor.name);
    })));

    it("remove item", () => Promise.all(connections.map(async connection => {
        Post.useConnection(connection);
        Category.useConnection(connection);

        const postToCategory = new PostToCategory()
        postToCategory.active = false;

        const category = new Category();
        category.name = 'foo';

        postToCategory.category = category;

        let post = new Post();
        post.title = "hello";
        post.content = "World"
        post.postToCategories = [postToCategory];
        await post.save();

        const postId = post.id;

        await post.remove();

        post.id = postId; // object loses id after removal, add it back to fetch versions
        const postsVersions = await post.versions().list();
        const categoriesVersions = await category.versions().list();

        expect(postsVersions.length).to.equal(2, `failed for ${connection.name}`);
        expect(postsVersions[0].event).to.equal(VersionEvent.REMOVE, `failed for ${connection.name}`);
        expect(postsVersions[0].itemId).to.equal(post.id.toString());
        expect(postsVersions[0].itemType).to.equal(post.constructor.name);

        expect(categoriesVersions.length).to.equal(1, `failed for ${connection.name}`);
        expect(categoriesVersions[0].event).to.equal(VersionEvent.INSERT, `failed for ${connection.name}`);
        expect(categoriesVersions[0].itemId).to.equal(category.id.toString());
        expect(categoriesVersions[0].itemType).to.equal(category.constructor.name);
    })));

    it("version navigation", () => Promise.all(connections.map(async connection => {
        Post.useConnection(connection);
        Category.useConnection(connection);

        const postToCategory = new PostToCategory()
        postToCategory.active = false;

        const category = new Category();
        category.name = 'foo';

        postToCategory.category = category;

        let post = new Post();
        post.title = "hello";
        post.content = "World"
        post.postToCategories = [postToCategory];
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
