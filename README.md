# TypeORM-Versions

A [paper_trail](https://github.com/paper-trail-gem/paper_trail) inspired versioning plugin for [TypeORM](https://typeorm.io/) to track changes in entities.

**Compatible with TypeORM >= 0.3**

## Installation

```
npm install typeorm-versions
```

You need to register TypeORM-Versions' own `Version` entity and `VersionSubscriber` within your DataSource.

TypeORM-Versions provides a convenience function `versionsConfig`, which injects the required settings:

```typescript
import { DataSourceOptions } from 'typeorm';
import { versionsConfig } from 'typeorm-versions';

let dataSourceOptions: DataSourceOptions = {
    ...
}

dataSourceOptions = versionsConfig(dataSourceOptions);
```

Then create a migration in your migration directory to create the version table:

```typescript
import { AddVersionMigration } from "typeorm-versions";

// The timestamp should fit your migration order
export class AddVersion1700000000000 extends AddVersionMigration {}
// By default creates a table named "version". Override tableName to customize:
// export class AddVersion1700000000000 extends AddVersionMigration { tableName = "entity_versions" }
```

## Usage

### Data Mapper Pattern

Define your entity and annotate it with the `@VersionedEntity()` decorator.

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { VersionedEntity } from "typeorm-versions";

@Entity()
@VersionedEntity()
class Post {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

}
```

Then use it with the `VersionRepository`:

```typescript
import { VersionRepository, VersionEvent } from "typeorm-versions";

const postRepository = dataSource.getRepository(Post);
const versionRepository = VersionRepository(dataSource);

// Store a post
let post = new Post();
post.title = "hello";
post.content = "World";
post = await postRepository.save(post);

// Change the post and store the change
post.content = "there!";
post = await postRepository.save(post);

// Retrieve all stored versions for this post
const versions = await versionRepository.allForEntity(post);
console.log(versions);

// returns
[
  Version {
    id: 2,
    itemType: 'Post',
    itemId: '1',
    event: 'UPDATE',
    owner: 'system',
    object: { title: 'hello', content: 'there!', id: 1 },
    timestamp: 2021-03-18T16:56:49.996Z
  },
  Version {
    id: 1,
    itemType: 'Post',
    itemId: '1',
    event: 'INSERT',
    owner: 'system',
    object: { title: 'hello', content: 'World', id: 1 },
    timestamp: 2021-03-18T16:56:49.986Z
  }
]

// To recover a previous version
const previousVersion = await versionRepository.previousForEntity(post);
post = previousVersion!.getObject<Post>();
await postRepository.save(post);

// Other navigation options
const latestVersion = await versionRepository.latestForEntity(post);
const previousPost = await versionRepository.previousObjectForEntity(post); // Get the entity object directly
const latestPost = await versionRepository.latestObjectForEntity(post);

// Versions also support navigation
const next = await previousVersion!.next();
const prev = await latestVersion!.previous();
```

### Active Record Pattern

Use `VersionedBaseEntity` instead of TypeORM's `BaseEntity`:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { VersionedEntity, VersionedBaseEntity } from "typeorm-versions";

@Entity()
@VersionedEntity()
class Post extends VersionedBaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

}
```

Which provides helper methods directly on the entity:

```typescript
let post = new Post();
post.title = "Hello";
post.content = "World";
await post.save();

post.title = "Bye";
await post.save();

// List all versions
const versions = await post.versions().list();

// Navigate versions
const previousVersion = await post.versions().previous();
const latestVersion = await post.versions().latest();

// Get entity objects directly
const previousPost = await post.versions().previousObject();
await previousPost!.save(); // recover previous version
const latestPost = await post.versions().latestObject();
```

## Skipping Version Recording

Version rows are written via a TypeORM subscriber on every `save` / `remove` of a `@VersionedEntity`. For bulk operations (seeding, schema imports, batch upserts) the per-row JSON diffs can accumulate hundreds of MBs of heap and the per-row history is usually low value — the bulk op itself is the audit unit.

You can opt out of version recording per call. The flag rides on TypeORM's `SaveOptions.data` / `RemoveOptions.data`, so it propagates through cascades and stays scoped to the operation. Default behavior is unchanged.

### Data Mapper

```typescript
import { saveWithoutVersioning, removeWithoutVersioning } from 'typeorm-versions';

// Repository
await saveWithoutVersioning(postRepository, post);
await saveWithoutVersioning(postRepository, [a, b, c]);

// EntityManager (e.g. inside a transaction)
await dataSource.transaction(async (manager) => {
  for (const row of bigBatch) {
    await saveWithoutVersioning(manager, row);
  }
});

// DataSource (uses dataSource.manager)
await saveWithoutVersioning(dataSource, post);

// Removes work the same way
await removeWithoutVersioning(postRepository, post);
```

### Active Record

`VersionedBaseEntity` exposes matching instance methods:

```typescript
await post.saveWithoutVersioning();
await post.removeWithoutVersioning();
```

### Cascades

Cascaded child saves inherit the flag because TypeORM forwards `options.data` to all subscriber events under the same persistence operation. One call covers the full object graph.

### Raw escape hatch

If you can't reach the helpers (e.g. third-party code calls `save` on your behalf), pass the flag directly. This is the underlying contract:

```typescript
await postRepository.save(post, { data: { skipVersioning: true } });
```

Existing `data` fields are preserved — the helpers merge rather than replace.

## Future To-Dos
- [ ] More tests
- [ ] More / improve docs
- [ ] More navigation and recovery features
- [ ] More examples
