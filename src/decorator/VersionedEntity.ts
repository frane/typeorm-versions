import 'reflect-metadata';

const versionedEntityMetadataKey = Symbol("VersionedEntity");

export function VersionedEntity() {
    return Reflect.metadata(versionedEntityMetadataKey, true);
}

// Target is null when interacting with a manytomany relation
export function isVersionedEntity(target?: Object) {
  if (!target) {
    return false;
  }

  return Reflect.getMetadata(versionedEntityMetadataKey, target.constructor) === true;
}
