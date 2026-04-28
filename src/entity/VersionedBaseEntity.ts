import { BaseEntity, DataSource, RemoveOptions, SaveOptions } from 'typeorm';
import { VersionRepository } from "../repository/VersionRepository";
import { SKIP_VERSIONING_KEY } from "../skipVersioning";

class VersionHelperMethods<T extends BaseEntity> {
    private entity: T;

    constructor(entity: T) {
        this.entity = entity;
    }

    protected getDataSource(): DataSource {
        // @ts-ignore
        return (this.entity.constructor as typeof BaseEntity).target?.dataSource;
    }

    /**
     * @protected
     * @deprecated in favor of getDataSource
     */
    protected getConnection() : DataSource {
        return this.getDataSource()
    }

    async list() {
        return VersionRepository(this.getDataSource()).allForEntity(this.entity)
    }

    async previous() {
        return VersionRepository(this.getDataSource()).previousForEntity(this.entity)
    }

    async latest() {
        return VersionRepository(this.getDataSource()).latestForEntity(this.entity)
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

    saveWithoutVersioning(options?: SaveOptions): Promise<this> {
        return this.save({ ...options, data: { ...(options?.data || {}), [SKIP_VERSIONING_KEY]: true } });
    }

    removeWithoutVersioning(options?: RemoveOptions): Promise<this> {
        return this.remove({ ...options, data: { ...(options?.data || {}), [SKIP_VERSIONING_KEY]: true } });
    }
}
