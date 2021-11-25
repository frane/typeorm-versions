import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { VersionedBaseEntity } from '../../../../src/entity/VersionedBaseEntity';
import { Category } from './Category';
import { PostToCategory } from './PostToCategory';

@Entity()
@VersionedEntity()
export class Post extends VersionedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @OneToMany(() => PostToCategory, postToCategory => postToCategory.post, { cascade: true })
    postToCategories!: PostToCategory[];
}
