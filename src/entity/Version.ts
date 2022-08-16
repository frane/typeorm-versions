import { ClassConstructor, plainToClass } from 'class-transformer';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ObjectLiteral,
    getMetadataArgsStorage,
    LessThan,
    MoreThan,
    Raw,
    Not,
    DataSource,
} from 'typeorm';
import {SqliteDriver} from 'typeorm/driver/sqlite/SqliteDriver';

export enum VersionEvent {
    INSERT = 'INSERT',
    UPDATE = 'UPDATE',
    REMOVE = 'REMOVE',
}

@Entity()
export class Version {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    itemType!: string;

    @Column({ nullable: false })
    itemId!: string;

    @Column({ nullable: false })
    event!: VersionEvent;

    @Column()
    owner!: string;

    @Column({ type: "simple-json" })
    object!: ObjectLiteral;

    // Ensure all DBs have the same precision
    // -> important for solid comparison
    @Column({ precision: 6 })
    timestamp!: Date;

    // @ts-ignore: Unused variable which is actually used
    private static usedDataSource?: DataSource;

    /**
     * @deprecated in favor of useDataSource
     */
    static useConnection(dataSource: DataSource) {
        this.useDataSource(dataSource)
    }

    static useDataSource(dataSource: DataSource) {
        this.usedDataSource = dataSource;
    }

    /**
     * @deprecated in favor of getDataSource
     */
    protected getConnection() : DataSource {
        return this.getDataSource();
    }

    protected getDataSource() : DataSource {
        return (this.constructor as any).usedDataSource;
    }

    public getObject<T>() : T {
        for (const t of getMetadataArgsStorage().tables) {
            if ((t.target as Function)?.name === this.itemType) {
                return plainToClass(t.target as ClassConstructor<T>, this.object, { enableImplicitConversion: true });
            }
        }
        return {} as T;
    }

    public previous() : Promise<Version | null> {
        // Date comparison workaround for SQLite
        let timestampQuery = LessThan(this.timestamp);
        if (this.getDataSource().driver instanceof SqliteDriver) {
            timestampQuery = Raw(alias => `STRFTIME('%Y-%m-%d %H:%M:%f', ${alias}) < STRFTIME('%Y-%m-%d %H:%M:%f', '${this.timestamp.toISOString()}')`);
        }

        return this.getDataSource().getRepository(Version).findOne({
            where: {
                itemId: this.itemId,
                itemType: this.itemType,
                id: Not(this.id),
                timestamp: timestampQuery,

            },
            order: { timestamp: 'DESC' }
        });
    }
    public next() : Promise<Version | null> {
        // Date comparison workaround for SQLite
        let timestampQuery = MoreThan(this.timestamp);
        if (this.getDataSource().driver instanceof SqliteDriver) {
            timestampQuery = Raw(alias => `STRFTIME('%Y-%m-%d %H:%M:%f', ${alias}) > STRFTIME('%Y-%m-%d %H:%M:%f', '${this.timestamp.toISOString()}')`);
        }

        return this.getDataSource().getRepository(Version).findOne({
            where: {
                itemId: this.itemId,
                itemType: this.itemType,
                id: Not(this.id),
                timestamp: timestampQuery,
            },
            order: { timestamp: 'DESC' }
        });
    }

    public async index() : Promise<number | undefined> {
        const versions = await this.getDataSource().getRepository(Version).find({
            where: {
                itemId: this.itemId,
                itemType: this.itemType,
            },
            order: { timestamp: 'DESC' }
        });

        return versions.indexOf(this);
    }

};
