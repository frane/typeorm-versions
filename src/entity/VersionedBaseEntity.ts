import { BaseEntity, Connection, getConnection } from "typeorm";
import { VersionRepository } from "../repository/VersionRepository";

class VersionHelperMethods<T extends BaseEntity> {
    private entity: T;

    constructor(entity: T) {
        this.entity = entity;
    }

    protected getConnection() : Connection {
        return (this.entity.constructor as any).usedConnection || getConnection();
    }

    async list() { 
        const x = await this.getConnection().getCustomRepository(VersionRepository).allForEntity(this.entity);
        console.log('a', x);
        return x;
    }

    async previous() { 
        return this.getConnection().getCustomRepository(VersionRepository).previousForEntity(this.entity);
    }

    async latest() { 
        return this.getConnection().getCustomRepository(VersionRepository).latestForEntity(this.entity); 
    }

    async previousObject() { 
        return (await this.previous())?.getObject<T>();
    }

    async latestObject() { 
        return (await this.latest())?.getObject<T>(); 
    }

}

export class VersionedBaseEntity extends BaseEntity {
    versions() : VersionHelperMethods<this> {
        return new VersionHelperMethods(this);
    }
}