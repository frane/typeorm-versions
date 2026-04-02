# TypeORM-Versions

A [paper_trail](https://github.com/paper-trail-gem/paper_trail) inspired versioning plugin for [TypeORM](https://typeorm.io/) to track changes in entities.

**Compatible with TypeORM >= 0.3**

## Usage

Define your entity and annotate it with the `@VersionedEntity()` decorator.

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
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

At any other point in your code use it like

```typescript
// Repository pattern
const postRepository = dataSource.getRepository(Post);

// Store a post
let post = new Post();
post.title = "hello";
post.content = "World";
post = await postRepository.save(post);

// Change the post and store the change
post.content = "there!";
post = await postRepository.save(post);

// Retrieve all stored versions for this post

const versionRepository = VersionRepository(dataSource);
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

// All navigation options
const latestVersion = await versionRepository.latestForEntity(post);
const previousPost = await versionRepository.previousObjectForEntity(post); // Get the entity object directly instead of the version
const latestPost = await versionRepository.latestObjectForEntity(post);
```

TypeORM-Versions also works with the active record pattern

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { VersionedEntity, VersionedBaseEntity } from "typeorm-versions";

// Instead of TypeORM's BaseEntity, use VersionedBaseEntity
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

// Which provides helper methods like...
let post = await Post.findOneBy({ id: 1 });
await post.versions().list(); // List all versions
await post.versions().previous();
await post.versions().latest();
await post.versions().previousObject(); // Get the object instead of version
await post.versions().latestObject();


```

## Installation

```
npm install typeorm-versions
```

You need to register TypeORM-Versions' own `Version` entity and `VersionSubscriber` within your DataSource.

TypeORM-Versions provides a convenience function `versionsConfig`, which can be used in code and injects the settings:

```typescript
import { DataSourceOptions } from 'typeorm';
import { versionsConfig } from 'typeorm-versions';

let dataSourceOptions: DataSourceOptions = {
    ...
}

dataSourceOptions = versionsConfig(dataSourceOptions);
```

Lastly, create a migration in your migration directory to create the version table:

```typescript
import { AddVersionMigration } from "typeorm-versions";

// The timestamp should fit your migration order
export class AddVersion1700000000000 extends AddVersionMigration {}
// By default creates a table named "version". Override tableName to customize:
// export class AddVersion1700000000000 extends AddVersionMigration { tableName = "entity_versions" }
```

## Future To-Dos
- [ ] More tests
- [ ] More / improve docs
- [ ] More navigation and recovery features
- [ ] More examples
