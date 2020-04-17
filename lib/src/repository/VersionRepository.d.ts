import { Repository, ObjectLiteral } from "typeorm";
import { Version, VersionEvent } from "../entity/Version";
export declare class VersionRepository extends Repository<Version> {
    private buildIdFromEntity;
    private buildId;
    saveVersion<Entity extends ObjectLiteral>(entity: Entity, event: VersionEvent, owner?: string): Promise<Version | undefined>;
    allForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: any, take?: number, skip?: number, order?: ("ASC" | "DESC")): Promise<Version[]>;
    previousForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Version | undefined>;
    latestForEntity<Entity extends ObjectLiteral>(entity: Entity, id?: string): Promise<Version | undefined>;
}
//# sourceMappingURL=VersionRepository.d.ts.map