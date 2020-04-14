import { EntityRepository, Repository, ObjectLiteral } from "typeorm";
import { Version, VersionEvent } from "../entity/Version";

@EntityRepository(Version)
export class VersionRepository extends Repository<Version> {

    private buildId<Entity extends ObjectLiteral>(entity: Entity) : string {
        let id = '';
        for (const pColumn of this.manager.connection.getMetadata(entity.constructor.name).primaryColumns) {
            id = id + `${pColumn.getEntityValue(entity)}`;	
        }
        return id;	
    }

    async saveVersion<Entity extends ObjectLiteral>(entity: Entity, event: VersionEvent, owner?: string) {
        const id = this.buildId(entity)
        if (id?.length < 1)
            return;

        const v = new Version();
        v.event = event;
        v.owner = owner || 'system';
        v.object = entity;
        v.itemId = id;
        v.itemType = entity.constructor.name;
        return this.save(v);
    }

    async allForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string, take?: number, skip?: number, order: ("ASC" | "DESC") = "DESC") {
        return this.find({
            where: { itemType: entity.constructor.name, itemId: id || this.buildId(entity) },
            order: { timestamp: order },
            take: take,
            skip: skip,
        });
    }

    async previousForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string) : Promise<Version | undefined> {
        const versions = await this.allForEntity(entity, id, 1, 1);
        return versions.shift();
    }

    async nextForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string) : Promise<Version | undefined>{
        const versions = await this.allForEntity(entity, id, 1, 1, "ASC");
        return versions.shift();
    }

}