import { ConnectionOptions } from 'typeorm';
import { AddVersionMigration } from '../migration/AddVersionMigration';
import { Version } from '../entity/Version';
import { VersionSubscriber } from '../subscriber/VersionSubscriber';

export function versionsConfig(databaseConfig: ConnectionOptions) : ConnectionOptions {
    databaseConfig.entities?.push(Version);
    databaseConfig.migrations?.push(AddVersionMigration);
    databaseConfig.subscribers?.push(VersionSubscriber);
    return databaseConfig;
};