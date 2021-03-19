import { Entity, Column, PrimaryGeneratedColumn, ObjectLiteral, getMetadataArgsStorage, Connection, LessThan, MoreThan, Raw, Not } from 'typeorm';
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
    private static usedConnection?: Connection;

    static useConnection(connection: Connection) {
        this.usedConnection = connection;
    }

    protected getConnection() : Connection {
        return (this.constructor as any).usedConnection;
    }

    public getObject<T>() : T {
        for (const t of getMetadataArgsStorage().tables) {
            if ((t.target as Function)?.name === this.itemType) {
                return Object.assign<T, ObjectLiteral>(new (t.target as any)(), this.object);
            }
        }
        return {} as T;
    }

    public previous() : Promise<Version | undefined> {
        // Date comparison workaround for SQLite
        let timestampQuery = LessThan(this.timestamp);
        if (this.getConnection().driver instanceof SqliteDriver) {
            timestampQuery = Raw(alias => `STRFTIME('%Y-%m-%d %H:%M:%f', ${alias}) < STRFTIME('%Y-%m-%d %H:%M:%f', '${this.timestamp.toISOString()}')`);
        }

        return this.getConnection().getRepository(Version).findOne({ 
            itemId: this.itemId, 
            itemType: this.itemType, 
            id: Not(this.id),
            timestamp: timestampQuery, 
        }, {
            order: { timestamp: 'DESC' }
        });
    }
    public next() : Promise<Version | undefined> {
        // Date comparison workaround for SQLite
        let timestampQuery = MoreThan(this.timestamp);
        if (this.getConnection().driver instanceof SqliteDriver) {
            timestampQuery = Raw(alias => `STRFTIME('%Y-%m-%d %H:%M:%f', ${alias}) > STRFTIME('%Y-%m-%d %H:%M:%f', '${this.timestamp.toISOString()}')`);
        }

        return this.getConnection().getRepository(Version).findOne({ 
            itemId: this.itemId, 
            itemType: this.itemType, 
            id: Not(this.id),
            timestamp: timestampQuery,
        }, {
            order: { timestamp: 'DESC' }
        });
    }

    public async index() : Promise<number | undefined> {
        const versions = await this.getConnection().getRepository(Version).find({
            where: {
                itemId: this.itemId,
                itemType: this.itemType, 
            },
            order: { timestamp: 'DESC' }
        });

        return versions.indexOf(this);
    }

};