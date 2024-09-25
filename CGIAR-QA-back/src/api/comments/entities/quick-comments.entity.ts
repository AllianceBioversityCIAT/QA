import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('qa_quick_comments')  
export class QuickComments {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',  
    nullable: false,
  })
  comment: string;
}
