import {
    DataSource,
    EntityManager,
    Repository,
    RemoveOptions,
    SaveOptions,
} from 'typeorm';

export const SKIP_VERSIONING_KEY = 'skipVersioning';

export type SaveTarget = DataSource | EntityManager | Repository<any>;

function resolveManager(target: SaveTarget): EntityManager {
    if (target instanceof EntityManager) return target;
    if (target instanceof DataSource) return target.manager;
    return (target as Repository<any>).manager;
}

function withSkip(options: SaveOptions & RemoveOptions = {}): SaveOptions & RemoveOptions {
    return { ...options, data: { ...(options.data || {}), [SKIP_VERSIONING_KEY]: true } };
}

export function isVersioningSkipped(queryRunnerData: unknown): boolean {
    return !!(queryRunnerData && (queryRunnerData as any)[SKIP_VERSIONING_KEY]);
}

export function saveWithoutVersioning<Entity>(
    target: SaveTarget,
    entity: Entity,
    options?: SaveOptions,
): Promise<Entity>;
export function saveWithoutVersioning<Entity>(
    target: SaveTarget,
    entities: Entity[],
    options?: SaveOptions,
): Promise<Entity[]>;
export function saveWithoutVersioning<Entity extends object>(
    target: SaveTarget,
    entityOrEntities: Entity | Entity[],
    options?: SaveOptions,
): Promise<Entity | Entity[]> {
    const manager = resolveManager(target);
    return manager.save(entityOrEntities as any, withSkip(options));
}

export function removeWithoutVersioning<Entity>(
    target: SaveTarget,
    entity: Entity,
    options?: RemoveOptions,
): Promise<Entity>;
export function removeWithoutVersioning<Entity>(
    target: SaveTarget,
    entities: Entity[],
    options?: RemoveOptions,
): Promise<Entity[]>;
export function removeWithoutVersioning<Entity extends object>(
    target: SaveTarget,
    entityOrEntities: Entity | Entity[],
    options?: RemoveOptions,
): Promise<Entity | Entity[]> {
    const manager = resolveManager(target);
    return manager.remove(entityOrEntities as any, withSkip(options));
}
