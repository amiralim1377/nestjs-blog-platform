import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role.enum.js';
import { Exclude } from 'class-transformer';
import { Post } from '../../posts/entities/post.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  password?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Exclude()
  googleId?: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  avatarId?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  @Exclude()
  deletedAt: Date;

  @OneToMany(() => Post, (post) => post.author)
  posts?: Relation<Post>[];
}
