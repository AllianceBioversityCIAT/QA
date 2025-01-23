import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("ai_matcher")
export class AiHelper {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  result_code: number;

  @Column({ type: "int" })
  phase_year: number;

  @Column({ type: "float" })
  gender_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  gender_ai_tag: string;

  @Column({ type: "text" })
  gender_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  gender_ai_matching: string;

  @Column({ type: "float" })
  climate_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  climate_ai_tag: string;

  @Column({ type: "text" })
  climate_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  climate_ai_matching: string;

  @Column({ type: "float" })
  nutrition_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  nutrition_ai_tag: string;

  @Column({ type: "text" })
  nutrition_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  nutrition_ai_matching: string;

  @Column({ type: "float" })
  environmental_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  environmental_ai_tag: string;

  @Column({ type: "text" })
  environmental_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  environmental_ai_matching: string;

  @Column({ type: "float" })
  poverty_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  poverty_ai_tag: string;

  @Column({ type: "text" })
  poverty_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  poverty_ai_matching: string;

  @Column({ type: "float", nullable: true })
  innovation_ai_prediction: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  innovation_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  innovation_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_ai_matching: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
