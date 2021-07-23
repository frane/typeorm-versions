import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { VersionedBaseEntity } from '../../../../src/entity/VersionedBaseEntity';
import { Post } from './Post';
import { PostToCategory } from './PostToCategory';

@Entity()
@VersionedEntity()
export class Category extends VersionedBaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => PostToCategory, postToCategory => postToCategory.category)
    postToCategories!: PostToCategory[];
}
