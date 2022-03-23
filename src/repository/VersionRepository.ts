import { DataSource, EntityManager, getConnectionManager, ObjectLiteral } from 'typeorm';
import { Version, VersionEvent } from '../entity/Version';
import { instanceToPlain } from 'class-transformer';

function buildIdFromEntity<Entity extends ObjectLiteral>(manager: EntityManager, entity: Entity): string {
  const ids = [];
  for (const pColumn of manager.connection.getMetadata(entity.constructor.name).primaryColumns) {
    ids.push(pColumn.getEntityValue(entity));
  }
  return ids.join('/');
}

function buildId(originalId: any): string | undefined {
  if (originalId === undefined) {
    return undefined;
  }

  if (originalId instanceof Array) {
    const ids = [];
    for (const idItem of originalId) {
      ids.push(buildId(idItem));
    }
    return ids.join('/');
  } else {
    return originalId as string;
  }
}

export const VersionRepository = (dataSource: DataSource) => {
  return dataSource
    .getRepository(Version)
    .extend({
      allForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: any, take?: number, skip?: number, order: ('ASC' | 'DESC') = 'DESC') {
        return this.find({
          where: { itemType: entity.constructor.name, itemId: buildId(id) || buildIdFromEntity(this.manager, entity) },
          order: { timestamp: order },
          take: take,
          skip: skip,
        });
      },

      async previousForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Version | undefined> {
        const versions = await this.allForEntity(entity, id, 1, 1);
        return Promise.resolve(versions.shift());
      },

      async latestForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Version | undefined> {
        const versions = await this.allForEntity(entity, id, 1);
        return Promise.resolve(versions.shift());
      },

      async previousObjectForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Entity | undefined> {
        return (await this.previousForEntity(entity, id))?.getObject<Entity>();
      },

      async latestObjectForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Entity | undefined> {
        return (await this.latestForEntity(entity, id))?.getObject<Entity>();
      },
      async saveVersion<Entity extends ObjectLiteral>(entity: Entity, event: VersionEvent, owner?: string) {
        Version.useDataSource(this.manager.connection)
        const id = buildIdFromEntity(this.manager, entity)
        if (id?.length < 1) {
          return;
        }

        const v = new Version();
        v.event = event;
        v.owner = owner || 'system';
        v.object = instanceToPlain(entity);
        v.itemId = id;
        v.itemType = entity.constructor.name;
        // timestamp shuould be defined via @CreateDateColumn, this shouldn't be necessary
        // because the value should awlays be set via the DB's default current date-time function.
        // However, the implementation accross DBs and drivers seems inconsistent, e.g.
        // SQLite cuts off milliseconds, PostgreSQL is to precise for JS's Date object,
        // MySQL differs in procision for a @CreateDateColumn and a simple Date @Column
        v.timestamp = new Date();
        return this.save(v);
      }
    })
}
