import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
import { isVersionedEntity } from "../decorator/VersionedEntity";
import { VersionEvent } from "../entity/Version";
import { VersionRepository } from "../repository/VersionRepository";

@EventSubscriber()
export class VersionSubscriber implements EntitySubscriberInterface {
    
    async afterInsert(event: InsertEvent<Object>) {
        if (isVersionedEntity(event.entity)) {
            await event.connection.getCustomRepository(VersionRepository).saveVersion(event.entity, VersionEvent.INSERT);
        }
    }

    async afterUpdate(event: UpdateEvent<Object>) {
        if (isVersionedEntity(event.entity)) {
            await event.connection.getCustomRepository(VersionRepository).saveVersion(event.entity, VersionEvent.UPDATE);
        }
    }

    async beforeRemove(event: RemoveEvent<Object>) {
        console.log('asadsda', event.entity);
        if (event.entity && isVersionedEntity(event.entity)) {
            await event.connection.getCustomRepository(VersionRepository).saveVersion(event.entity, VersionEvent.REMOVE);
        }
    }

}