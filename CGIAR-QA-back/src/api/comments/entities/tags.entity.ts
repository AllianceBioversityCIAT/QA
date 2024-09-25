import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../users/entities/user.entity';
import { Comments } from './comments.entity';
import { TagType } from './tags-type.entity';

@Entity('qa_tags') // Define el nombre de la tabl
export class Tags {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.tags)
  user: Users;

  @ManyToOne(() => TagType, (tagType) => tagType.tags)
  tagType: TagType;

  @ManyToOne(() => Comments, (comment) => comment.tags)
  comment: Comments;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
