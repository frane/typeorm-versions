import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
import { isVersionedEntity } from "../decorator/VersionedEntity";
import { VersionEvent } from "../entity/Version";
import { VersionRepository } from "../repository/VersionRepository";
import { isVersioningSkipped } from "../skipVersioning";

@EventSubscriber()
export class VersionSubscriber implements EntitySubscriberInterface {

    async afterInsert(event: InsertEvent<Object>) {
        if (isVersioningSkipped(event.queryRunner?.data)) return;
        if (isVersionedEntity(event.entity)) {
            await VersionRepository(event.connection).saveVersion(event.entity, VersionEvent.INSERT)
        }
    }

    async afterUpdate(event: UpdateEvent<Object>) {
        if (isVersioningSkipped(event.queryRunner?.data)) return;
        if (event.entity && isVersionedEntity(event.entity)) {
            await VersionRepository(event.connection).saveVersion(event.entity, VersionEvent.UPDATE)
        }
    }

    async beforeRemove(event: RemoveEvent<Object>) {
        if (isVersioningSkipped(event.queryRunner?.data)) return;
        if (event.entity && isVersionedEntity(event.entity)) {
            await VersionRepository(event.connection).saveVersion(event.entity, VersionEvent.REMOVE)
        }
    }

}
