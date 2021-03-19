# TypeORM-Versions

A [paper_trail](https://github.com/paper-trail-gem/paper_trail) inspired versioning plugin for [TypeORM](https://typeorm.io/) to track changes in entities.

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
const postRepository = connection.getRepository(Post);

// Store a post
let post = new Post();
post.title = "hello";
post.content = "World";
post = await postRepository.save(post);

// Change the post and store the change
post.content = "there!";
post = await postRepository.save(post);

// Retrieve all stored versions for this post
const versionRepository = connection.getCustomRepository(VersionRepository);
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

// All navigaton options
const versionRepository = connection.getCustomRepository(VersionRepository);
const previousVersion = await versionRepository.previousForEntity(post);
const latestVersion = await versionRepository.latestForEntity(post)
```

TypeORM-Versions also works with the active record pattern

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { VersionedEntity, VersionedBaseEntity } from "typeorm-versions";

// Instead of TypeORM's BaseEntity, use VersionedBaseEntity
@Entity()
@VersionedEntity()
class Post extends VersionedBaseEntity{

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()    
    title!: string;

    @Column()
    content!: string;

}

// Which provides helper methods like...
let post = Post.find(1);
post.versions().list(); // List all all versions
post.versions().previous();
post.versions().latest();
post.versions().previousObject(); // Get the object instead of version
post.versions().latestObject();


```

## Installation

```
npm install typeorm-versions
```

You need to register TypeORM-Vsersions' own `Version` entity and `VersionSubscriber` within your connection.

In your ormconfig.json add

```json
{
    ...
    "entities": [
        "entity/*.js",
        "./node_modules/typeorm-version/dist/entity/Version.js" 
    ],
    "subscribers": [
        "subscriber/*.js",
        "./node_modules/typeorm-version/dist/subscribers/VersionSubscriber.js"
    ],
    ...
}
```

Alternatively, TypeORM-Versions provides a convenience function `versionsConfig`, which can be used in code and injects the settings:

```typescript
import { ConnectionOptions } from 'typeorm';
import { versionsConfig } from 'typeorm-versions';

const connectionOptions: ConnectionOptions = {
    ...
}

connectionOptions = versionsConfig(connctionOptions);
```

Lastly, create an empty migration in your migration directory and make sure it looks like:

```typescript
class Version1000000000001 extends AddVersionMigration { tableName = "Version1000000000001" }
// 1000000000001 should be a timestamp that fits your migration order
```

## Future To-Dos
- [ ] More tests
- [ ] More / improve docs
- [ ] More navigation and recovery features
- [ ] More examples
