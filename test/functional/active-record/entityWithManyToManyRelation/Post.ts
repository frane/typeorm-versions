import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { VersionedBaseEntity } from '../../../../src/entity/VersionedBaseEntity';
import { Category } from './Category';

@Entity()
@VersionedEntity()
export class Post extends VersionedBaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @ManyToMany(() => Category, category => category.posts, { cascade: true })
    categories!: Category[];
}
