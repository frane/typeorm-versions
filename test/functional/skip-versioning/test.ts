import "reflect-metadata";
import { expect } from "chai";
import { DataSource } from "typeorm";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Post } from "./entity/Post";
import { Comment } from "./entity/Comment";
import { Version, VersionRepository, saveWithoutVersioning, removeWithoutVersioning } from "../../../src";

async function countVersions(connection: DataSource, type: string, id: number): Promise<number> {
    return connection.getRepository(Version).count({ where: { itemType: type, itemId: id.toString() } });
}

describe("Skip Versioning", () => {

    let connections: DataSource[] = [];
    before(async () => connections = await createTestingConnections({
        entities: [Post, Comment],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => connections && closeTestingConnections(connections));

    describe("baseline", () => {
        it("normal save writes one version", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await repo.save(Object.assign(new Post(), { title: "t", content: "c" }));
            expect(await countVersions(connection, "Post", post.id)).to.equal(1);
        })));
    });

    describe("saveWithoutVersioning helper", () => {
        it("Repository target writes zero versions on insert", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await saveWithoutVersioning(repo, Object.assign(new Post(), { title: "t", content: "c" }));
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));

        it("EntityManager target writes zero versions", () => Promise.all(connections.map(async connection => {
            const post = await saveWithoutVersioning(connection.manager, Object.assign(new Post(), { title: "t", content: "c" }));
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));

        it("DataSource target writes zero versions", () => Promise.all(connections.map(async connection => {
            const post = await saveWithoutVersioning(connection, Object.assign(new Post(), { title: "t", content: "c" }));
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));

        it("zero versions on update too", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await repo.save(Object.assign(new Post(), { title: "t", content: "c" }));
            // 1 baseline INSERT version
            expect(await countVersions(connection, "Post", post.id)).to.equal(1);
            post.content = "updated";
            await saveWithoutVersioning(repo, post);
            // still 1 — no UPDATE row
            expect(await countVersions(connection, "Post", post.id)).to.equal(1);
        })));

        it("array of entities", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const saved = await saveWithoutVersioning(repo, [
                Object.assign(new Post(), { title: "a", content: "1" }),
                Object.assign(new Post(), { title: "b", content: "2" }),
                Object.assign(new Post(), { title: "c", content: "3" }),
            ]);
            for (const p of saved) {
                expect(await countVersions(connection, "Post", p.id)).to.equal(0);
            }
        })));
    });

    describe("removeWithoutVersioning helper", () => {
        it("zero version rows on remove", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await repo.save(Object.assign(new Post(), { title: "t", content: "c" }));
            const id = post.id;
            // 1 INSERT row
            expect(await countVersions(connection, "Post", id)).to.equal(1);
            await removeWithoutVersioning(repo, post);
            // still 1 — no REMOVE row added
            expect(await countVersions(connection, "Post", id)).to.equal(1);
        })));
    });

    describe("Active Record methods", () => {
        it("entity.saveWithoutVersioning() writes zero versions", () => Promise.all(connections.map(async connection => {
            (Post as any).useDataSource(connection);
            const post = Object.assign(new Post(), { title: "t", content: "c" });
            await post.saveWithoutVersioning();
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));

        it("entity.removeWithoutVersioning() writes zero versions", () => Promise.all(connections.map(async connection => {
            (Post as any).useDataSource(connection);
            const post = Object.assign(new Post(), { title: "t", content: "c" });
            await post.save();
            const id = post.id;
            expect(await countVersions(connection, "Post", id)).to.equal(1);
            await post.removeWithoutVersioning();
            expect(await countVersions(connection, "Post", id)).to.equal(1);
        })));
    });

    describe("mixed batches", () => {
        it("only un-skipped saves write versions", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const tracked = await repo.save(Object.assign(new Post(), { title: "tracked", content: "c" }));
            const skipped = await saveWithoutVersioning(repo, Object.assign(new Post(), { title: "skipped", content: "c" }));
            expect(await countVersions(connection, "Post", tracked.id)).to.equal(1);
            expect(await countVersions(connection, "Post", skipped.id)).to.equal(0);
        })));
    });

    describe("transactions", () => {
        it("transaction with skipped saves writes zero versions", () => Promise.all(connections.map(async connection => {
            const ids: number[] = [];
            await connection.transaction(async (m) => {
                for (let i = 0; i < 5; i++) {
                    const p = await saveWithoutVersioning(m, Object.assign(new Post(), { title: `t${i}`, content: "c" }));
                    ids.push(p.id);
                }
            });
            const total = await connection.getRepository(Version).count({ where: { itemType: "Post" } });
            expect(total).to.equal(0);
            expect(ids.length).to.equal(5);
        })));

        it("flag does not leak past the transaction", () => Promise.all(connections.map(async connection => {
            await connection.transaction(async (m) => {
                await saveWithoutVersioning(m, Object.assign(new Post(), { title: "tx", content: "c" }));
            });
            const post = await connection.getRepository(Post).save(Object.assign(new Post(), { title: "after", content: "c" }));
            expect(await countVersions(connection, "Post", post.id)).to.equal(1);
        })));
    });

    describe("cascades", () => {
        it("cascaded children inherit the skip flag", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = Object.assign(new Post(), {
                title: "parent",
                content: "c",
                comments: [
                    Object.assign(new Comment(), { body: "first" }),
                    Object.assign(new Comment(), { body: "second" }),
                ],
            });
            const saved = await saveWithoutVersioning(repo, post);
            expect(await countVersions(connection, "Post", saved.id)).to.equal(0);
            expect(await connection.getRepository(Version).count({ where: { itemType: "Comment" } })).to.equal(0);
        })));

        it("cascaded children versioned normally without the helper", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = Object.assign(new Post(), {
                title: "parent",
                content: "c",
                comments: [
                    Object.assign(new Comment(), { body: "first" }),
                    Object.assign(new Comment(), { body: "second" }),
                ],
            });
            const saved = await repo.save(post);
            expect(await countVersions(connection, "Post", saved.id)).to.equal(1);
            expect(await connection.getRepository(Version).count({ where: { itemType: "Comment" } })).to.equal(2);
        })));
    });

    describe("concurrency", () => {
        // sqlite drivers share a single QueryRunner across "parallel" calls, so true
        // concurrency tests only make sense on multi-runner drivers like postgres/mysql.
        const isSqlite = (c: DataSource) => c.driver.options.type === 'sqlite' || c.driver.options.type === 'better-sqlite3';

        it("parallel skipped + non-skipped saves don't bleed", () => Promise.all(connections.filter(c => !isSqlite(c)).map(async connection => {
            const repo = connection.getRepository(Post);
            const [skipped, tracked] = await Promise.all([
                saveWithoutVersioning(repo, Object.assign(new Post(), { title: "s", content: "c" })),
                repo.save(Object.assign(new Post(), { title: "t", content: "c" })),
            ]);
            expect(await countVersions(connection, "Post", skipped.id)).to.equal(0);
            expect(await countVersions(connection, "Post", tracked.id)).to.equal(1);
        })));

        it("many parallel mixed saves stay isolated", () => Promise.all(connections.filter(c => !isSqlite(c)).map(async connection => {
            const repo = connection.getRepository(Post);
            const ops: Promise<{ id: number, skipped: boolean }>[] = [];
            // Keep the count below the default pg connection pool to avoid waits unrelated to what we are testing.
            for (let i = 0; i < 6; i++) {
                const skipped = i % 2 === 0;
                const op = (skipped
                    ? saveWithoutVersioning(repo, Object.assign(new Post(), { title: `p${i}`, content: "c" }))
                    : repo.save(Object.assign(new Post(), { title: `p${i}`, content: "c" }))
                ).then(p => ({ id: p.id, skipped }));
                ops.push(op);
            }
            const results = await Promise.all(ops);
            for (const r of results) {
                expect(await countVersions(connection, "Post", r.id)).to.equal(r.skipped ? 0 : 1);
            }
        })));
    });

    describe("raw data passthrough", () => {
        it("{ data: { skipVersioning: true } } directly works", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await repo.save(
                Object.assign(new Post(), { title: "t", content: "c" }),
                { data: { skipVersioning: true } },
            );
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));

        it("preserves other data fields alongside the flag", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await saveWithoutVersioning(
                repo,
                Object.assign(new Post(), { title: "t", content: "c" }),
                { data: { custom: "kept" } } as any,
            );
            expect(await countVersions(connection, "Post", post.id)).to.equal(0);
        })));
    });

    describe("VersionRepository extension", () => {
        it("uses VersionRepository normally for tracked items", () => Promise.all(connections.map(async connection => {
            const repo = connection.getRepository(Post);
            const post = await repo.save(Object.assign(new Post(), { title: "t", content: "c" }));
            const versions = await VersionRepository(connection).allForEntity(post);
            expect(versions.length).to.equal(1);
        })));
    });

});
