import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Comments } from './comments.entity';

@Entity('qa_reply_type')
export class ReplyType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @OneToMany((type) => Comments, (comment) => comment.replyType)
  comments: Comments[];
}
