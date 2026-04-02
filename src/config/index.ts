import { DataSourceOptions } from 'typeorm';
import { Version } from '../entity/Version';
import { VersionSubscriber } from '../subscriber/VersionSubscriber';

export function versionsConfig(databaseConfig: DataSourceOptions) : DataSourceOptions {
    // @ts-ignore
    if (!databaseConfig.entities) databaseConfig.entities = [];
    // @ts-ignore
    if (!databaseConfig.subscribers) databaseConfig.subscribers = [];

    // @ts-ignore
    databaseConfig.entities.push(Version);
    // @ts-ignore
    databaseConfig.subscribers.push(VersionSubscriber);

    return databaseConfig;
};
