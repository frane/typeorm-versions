import {
  Column,
  Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from './Post';
import { Category } from './Category';
import { VersionedBaseEntity, VersionedEntity } from '../../../../src';

@Entity()
@VersionedEntity()
export class PostToCategory extends VersionedBaseEntity {
  constructor() {
    super();

    this.active = true;
  }

  @PrimaryGeneratedColumn()
  public postToCategoryId!: number

  @Column()
  public active!: boolean;

  @Column()
  public postId!: number

  @ManyToOne(() => Post, post => post.postToCategories, { onDelete: 'CASCADE' })
  public post!: Post;

  @Column()
  public categoryId!: number

  @ManyToOne(() => Category, category => category.postToCategories, { cascade: true })
  public category!: Category;
}
