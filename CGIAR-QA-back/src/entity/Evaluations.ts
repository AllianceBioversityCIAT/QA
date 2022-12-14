import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Length, IsNotEmpty } from "class-validator";

import { QAComments } from "../entity/Comments";
import { QAUsers } from "../entity/User";
import { StatusHandler } from "../_helpers/StatusHandler";
import { EvaluationStatusHandler } from "../_helpers/EvaluationStatusHandler";

@Entity()
export class QAEvaluations {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    @IsNotEmpty({ message: 'Id by view is required' })
    indicator_view_id: number;

    @Column({
        type: "enum",
        enum: StatusHandler,
        default: StatusHandler.Pending
    })
    status: StatusHandler;

    @Column({
        type: "enum",
        enum: EvaluationStatusHandler,
        nullable: true
    })
    evaluation_status: EvaluationStatusHandler;


    @Column()
    @Length(2, 200)
    @IsNotEmpty({ message: 'The view name is required' })
    indicator_view_name: string;

    @Column({ default: "" })
    @Length(2, 200)
    @IsNotEmpty({ message: 'The CRP identifier is required' })
    crp_id: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(type => QAComments, comment => comment.evaluation)
    comments: QAComments;

    @Column("decimal", { precision: 10, scale: 0 })
    phase_year: number;

    @ManyToMany(() => QAUsers)
    @JoinTable()
    assessed_by: QAUsers[];

    @ManyToMany(() => QAUsers)
    @JoinTable()
    assessed_by_second_round: QAUsers[];

    @Column(
        {
            type: 'datetime',
            default: () => 'NOW()'
        }
    )
    batchDate: Date;

    @Column({default: false})
    require_second_assessment: boolean;
}
