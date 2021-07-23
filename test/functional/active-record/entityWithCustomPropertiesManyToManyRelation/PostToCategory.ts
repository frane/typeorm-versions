import {
  Column,
  Entity, ManyToOne,
} from 'typeorm';
import { Post } from './Post';
import { Category } from './Category';
import { VersionedBaseEntity, VersionedEntity } from '../../../../dist';

@Entity()
@VersionedEntity()
export class PostToCategory extends VersionedBaseEntity {
  constructor() {
    super();

    this.active = true;
  }

  @Column()
  public active!: boolean;

  @ManyToOne(() => Post, post => post.postToCategories, { primary: true, onDelete: 'CASCADE' })
  public post!: Post;

  @ManyToOne(() => Category, category => category.postToCategories, { primary: true, cascade: true })
  public category!: Category;
}
