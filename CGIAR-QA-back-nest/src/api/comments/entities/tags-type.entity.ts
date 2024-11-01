import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tags } from './tags.entity';

@Entity('qa_tag_type')
export class TagType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  name: string;

  @OneToMany(() => Tags, (tag) => tag.obj_tag_type)
  tags: Tags[];
}
