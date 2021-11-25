import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { VersionedBaseEntity } from '../../../../src/entity/VersionedBaseEntity';
import { Post } from './Post';

@Entity()
@VersionedEntity()
export class Category extends VersionedBaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToMany(() => Post, post => post.categories, { onDelete: 'CASCADE' })
    @JoinTable()
    posts!: Post[];
}
