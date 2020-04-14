import { BaseEntity, Connection } from "typeorm";
import { VersionRepository } from "../repository/VersionRepository";

class VersionHelperMethods<T extends BaseEntity> {
    private entity: T;

    constructor(entity: T) {
        this.entity = entity;
    }

    protected getConnection() : Connection {
        return (this.entity.constructor as any).usedConnection;
    }

    list() { 
        return this.getConnection().getCustomRepository(VersionRepository).allForEntity(this.entity);
    }

    async previousObject() { 
        return (await this.getConnection().getCustomRepository(VersionRepository).previousForEntity(this.entity))?.getObject<T>();
    }

    async nextObject() { 
        return (await this.getConnection().getCustomRepository(VersionRepository).nextForEntity(this.entity))?.getObject<T>(); 
    }
}

export class VersionedBaseEntity extends BaseEntity {
    versions() : VersionHelperMethods<this> {
        return new VersionHelperMethods(this);
    }
}