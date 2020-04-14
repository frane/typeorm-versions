import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ObjectLiteral, getMetadataArgsStorage, Connection, LessThan, MoreThan } from 'typeorm';
import { VersionRepository } from '../repository/VersionRepository';

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

    @CreateDateColumn()
    timestamp!: Date;

    protected getConnection() : Connection {
        return (this.constructor as any).usedConnection;
    }

    public getObject<T>() : T {
        for (const t of getMetadataArgsStorage().tables) {
            if ((t.target as Function)?.name === this.itemType) {
                return Object.assign(new (t.target as any)(), this.object);
            }
        }
        return {} as T;
    }

    public previous() : Promise<Version | undefined> {
        return this.getConnection().getRepository(Version).findOne({ 
            itemId: this.itemId, 
            itemType: this.itemType, 
            timestamp: LessThan(this.timestamp), 
        }, {
            order: { timestamp: 'DESC' }
        });
    }
    public next() : Promise<Version | undefined> {
        return this.getConnection().getRepository(Version).findOne({ 
            itemId: this.itemId, 
            itemType: this.itemType, 
            timestamp: MoreThan(this.timestamp), 
        }, {
            order: { timestamp: 'ASC' }
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