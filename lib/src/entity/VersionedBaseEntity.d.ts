import { BaseEntity, Connection } from "typeorm";
declare class VersionHelperMethods<T extends BaseEntity> {
    private entity;
    constructor(entity: T);
    protected getConnection(): Connection;
    list(): Promise<import("./Version").Version[]>;
    previousObject(): Promise<T | undefined>;
    nextObject(): Promise<T | undefined>;
}
export declare class VersionedBaseEntity extends BaseEntity {
    versions(): VersionHelperMethods<this>;
}
export {};
//# sourceMappingURL=VersionedBaseEntity.d.ts.map