import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Comments } from './comments.entity';
import { TagType } from './tags-type.entity';

@Entity('qa_tags') // Define el nombre de la tabl
export class Tags {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'userId',
    type: 'int',
  })
  userId: number;

  @ManyToOne(() => Users, (user) => user.tags)
  @JoinColumn({ name: 'userId' })
  obj_user: Users;

  @Column({
    name: 'tagTypeId',
    type: 'int',
  })
  tagTypeId: number;

  @ManyToOne(() => TagType, (tagType) => tagType.tags)
  @JoinColumn({ name: 'tagTypeId' })
  obj_tag_type: TagType;

  @Column({
    name: 'commentId',
    type: 'int',
  })
  commentId: number;

  @ManyToOne(() => Comments, (comment) => comment.tags)
  @JoinColumn({ name: 'commentId' })
  obj_comment: Comments;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
