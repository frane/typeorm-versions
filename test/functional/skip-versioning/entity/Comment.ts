import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { VersionedEntity } from '../../../../src';
import { Post } from './Post';

@Entity()
@VersionedEntity()
export class Comment {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    body!: string;

    @ManyToOne(() => Post, (post) => post.comments)
    post!: Post;
}
