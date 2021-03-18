import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { VersionedEntity } from '../../../../src';

@Entity()
@VersionedEntity()
export class Post {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()    
    title!: string;

    @Column()
    content!: string;

}