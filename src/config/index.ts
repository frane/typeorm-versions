import { DataSourceOptions } from 'typeorm';
import { Version } from '../entity/Version';
import { VersionSubscriber } from '../subscriber/VersionSubscriber';

export function versionsConfig(databaseConfig: DataSourceOptions) : DataSourceOptions {
    // @ts-ignore
    databaseConfig.entities?.push(Version);
    // @ts-ignore
    databaseConfig.subscribers?.push(VersionSubscriber);

    return databaseConfig;
};
