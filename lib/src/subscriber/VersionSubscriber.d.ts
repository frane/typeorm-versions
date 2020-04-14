import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from "typeorm";
export declare class VersionSubscriber implements EntitySubscriberInterface {
    afterInsert(event: InsertEvent<Object>): Promise<void>;
    afterUpdate(event: UpdateEvent<Object>): Promise<void>;
    beforeRemove(event: RemoveEvent<Object>): Promise<void>;
}
//# sourceMappingURL=VersionSubscriber.d.ts.map