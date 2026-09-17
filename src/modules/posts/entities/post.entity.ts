import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostType } from '../enums/post-type.enum.js';
import { PostStatus } from '../enums/post-status.enum.js';
import { User } from '../../users/entities/user.entity.js';
import type { Relation } from 'typeorm';
import { Tag } from '../../tags/entities/tag.entity.js';
import { Category } from '../../categories/entities/category.entity.js';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 512, nullable: false })
  title: string;

  @Column({
    type: 'enum',
    enum: PostType,
    nullable: false,
    default: PostType.POST,
  })
  postType: PostType;

  @Index()
  @Column({ type: 'varchar', length: 256, nullable: false, unique: true })
  slug: string;

  @Index()
  @Column({
    type: 'enum',
    enum: PostStatus,
    nullable: false,
    default: PostStatus.DRAFT,
  })
  status: PostStatus;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'json', nullable: true })
  schema?: string;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  coverImage?: string;

  @Column({ type: 'uuid', nullable: true })
  coverImageId?: string;

  @Index()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  publishOn?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({ name: 'posts_tags' })
  tags: Tag[];

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable()
  categories: Category[];
}
