import { EntityRepository, Repository, ObjectLiteral, Connection } from "typeorm";
import { Version, VersionEvent } from "../entity/Version";

@EntityRepository(Version)
export class VersionRepository extends Repository<Version> {

    private getConnection<Entity extends ObjectLiteral>(entity: Entity): Connection {
        return (entity.constructor as any).usedConnection || this.manager.connection;
    }

    private buildIdFromEntity<Entity extends ObjectLiteral>(entity: Entity) : string {
        const ids = [];
        for (const pColumn of this.manager.connection.getMetadata(entity.constructor.name).primaryColumns) {
            ids.push(pColumn.getEntityValue(entity));	
        }
        return ids.join('/');	
    }

    private buildId(originalId: any) : string | undefined {
        if (originalId === undefined) {
            return undefined;
        }

        if (originalId instanceof Array) {
            const ids = [];
            for (const idItem of originalId) {
                ids.push(this.buildId(idItem));
            }
            return ids.join('/');
        } else {
            return originalId as string;
        }
    }

    async saveVersion<Entity extends ObjectLiteral>(entity: Entity, event: VersionEvent, owner?: string) {
        Version.useConnection(this.getConnection(entity));
        const id = this.buildIdFromEntity(entity)
        if (id?.length < 1)
            return;

        const v = new Version();
        v.event = event;
        v.owner = owner || 'system';
        v.object = entity;
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

    async allForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: any, take?: number, skip?: number, order: ("ASC" | "DESC") = "DESC") {
        Version.useConnection(this.getConnection(entity));
        return await this.find({
            where: { itemType: entity.constructor.name, itemId: this.buildId(id) || this.buildIdFromEntity(entity) },
            order: { timestamp: order },
            take: take,
            skip: skip,
        });
    }

    async previousForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string) : Promise<Version | undefined> {
        const versions = await this.allForEntity(entity, id, 1, 1);
        return versions.shift();
    }

    async latestForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string) : Promise<Version | undefined> {
        const versions = await this.allForEntity(entity, id, 1);
        return versions.shift();
    }
}