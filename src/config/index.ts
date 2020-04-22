import { ConnectionOptions } from 'typeorm';
import { Version } from '../entity/Version';
import { VersionSubscriber } from '../subscriber/VersionSubscriber';

export function versionsConfig(databaseConfig: ConnectionOptions) : ConnectionOptions {
    databaseConfig.entities?.push(Version);
    databaseConfig.subscribers?.push(VersionSubscriber);
    return databaseConfig;
};