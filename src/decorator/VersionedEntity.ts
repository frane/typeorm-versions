import 'reflect-metadata';

const versionedEntityMetadataKey = Symbol("VersionedEntity");

export function VersionedEntity() {
    return Reflect.metadata(versionedEntityMetadataKey, true);
}

export function isVersionedEntity(target: Object) {
    return Reflect.getMetadata(versionedEntityMetadataKey, target.constructor) === true;
}