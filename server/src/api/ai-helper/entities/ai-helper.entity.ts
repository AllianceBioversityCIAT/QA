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

  @Column({ type: "varchar", length: 255, nullable: true })
  gender_ai_component: string | null;

  @Column({ type: "text" })
  gender_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  gender_ai_matching: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  gender_ai_evidence_level: string | null;

  @Column({ type: "float" })
  climate_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  climate_ai_tag: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  climate_ai_component: string | null;

  @Column({ type: "text" })
  climate_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  climate_ai_matching: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  climate_ai_evidence_level: string | null;

  @Column({ type: "float" })
  nutrition_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  nutrition_ai_tag: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  nutrition_ai_component: string | null;

  @Column({ type: "text" })
  nutrition_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  nutrition_ai_matching: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  nutrition_ai_evidence_level: string | null;

  @Column({ type: "float" })
  environmental_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  environmental_ai_tag: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  environmental_ai_component: string | null;

  @Column({ type: "text" })
  environmental_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  environmental_ai_matching: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  environmental_ai_evidence_level: string | null;

  @Column({ type: "float" })
  poverty_ai_prediction: number;

  @Column({ type: "varchar", length: 255 })
  poverty_ai_tag: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  poverty_ai_component: string | null;

  @Column({ type: "text" })
  poverty_ai_description: string;

  @Column({ type: "varchar", length: 50 })
  poverty_ai_matching: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  poverty_ai_evidence_level: string | null;

  @Column({ type: "float", nullable: true })
  innovation_ai_prediction: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  innovation_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  innovation_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_ai_matching: string | null;

  // Is this an innovation result type
  @Column({ type: "float", nullable: true })
  is_this_an_innovation_ai_prediction: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  is_this_an_innovation_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  is_this_an_innovation_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  is_this_an_innovation_ai_matching: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  is_this_an_innovation_ai_evidence_level: string | null;

  // Innovation readiness level
  @Column({ type: "float", nullable: true })
  innovation_readiness_level_ai_prediction: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  innovation_readiness_level_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  innovation_readiness_level_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_readiness_level_ai_matching: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_readiness_level_ai_evidence_level: string | null;

  // Innovation use level
  @Column({ type: "float", nullable: true })
  innovation_use_level_ai_prediction: number | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  innovation_use_level_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  innovation_use_level_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_use_level_ai_matching: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_use_level_ai_evidence_level: string | null;

  // Innovation use number
  @Column({ type: "json", nullable: true })
  innovation_use_number_ai_tag: string | null;

  @Column({ type: "text", nullable: true })
  innovation_use_number_ai_description: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_use_number_ai_matching: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  innovation_use_number_ai_evidence_level: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
