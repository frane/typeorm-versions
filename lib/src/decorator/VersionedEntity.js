"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var versionedEntityMetadataKey = Symbol("VersionedEntity");
function VersionedEntity() {
    return Reflect.metadata(versionedEntityMetadataKey, true);
}
exports.VersionedEntity = VersionedEntity;
function isVersionedEntity(target) {
    return Reflect.getMetadata(versionedEntityMetadataKey, target.constructor) === true;
}
exports.isVersionedEntity = isVersionedEntity;
//# sourceMappingURL=VersionedEntity.js.map