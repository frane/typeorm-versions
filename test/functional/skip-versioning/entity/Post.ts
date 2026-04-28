import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { VersionedEntity, VersionedBaseEntity } from '../../../../src';
import { Comment } from './Comment';

@Entity()
@VersionedEntity()
export class Post extends VersionedBaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    content!: string;

    @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
    comments!: Comment[];
}
