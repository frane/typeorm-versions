import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { VersionedBaseEntity } from '../../../../src';

@Entity()
@VersionedEntity()
export class Post extends VersionedBaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

}
