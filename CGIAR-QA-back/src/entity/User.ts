import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ManyToMany, ManyToOne, JoinTable, OneToMany } from "typeorm";
import { Length, IsEmail, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";

import { QARoles } from "../entity/Roles";
import { QAIndicatorUser } from "../entity/IndicatorByUser";
import { QACrp } from "../entity/CRP";
import { QAComments } from "../entity/Comments";
import { QACommentsReplies } from "../entity/CommentsReplies";
import { QATags } from "./Tags";
// import { QARoles } from "@entity/Roles";
// import { QAIndicatorUser } from "@entity/IndicatorByUser";


@Entity()
@Unique(["name", "email"])
export class QAUsers {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(4, 200)
    username: string;

    @Column()
    @Length(4, 200)
    @IsNotEmpty({ message: 'The name is required' })
    name: string;

    @Column()
    @IsNotEmpty({ message: 'The email is required' })
    @IsEmail({}, { message: 'Incorrect email' })
    email: string;


    @Column({ nullable: true })
    // @Length(4, 20)
    password: string;

    @Column({ default: false })
    is_marlo: boolean;


    @ManyToMany(type => QARoles, {
        eager: true
    })
    @JoinTable({
        name: "qa_user_roles", // table name for the junction table of this relation
        joinColumn: {
            name: "qa_user",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "qa_role",
            referencedColumnName: "id"
        }
    })
    roles: QARoles[];

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(type => QAComments, comment => comment.user)
    comments: QAComments

    @OneToMany(type => QACommentsReplies, reply => reply.user)
    replies: QACommentsReplies

    @OneToMany(type => QATags, tag => tag.tagType)
    tags: QATags;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(type => QAIndicatorUser, indicators => indicators.user, {
        eager: true, cascade: true
    })
    indicators: QAIndicatorUser[];

    @ManyToOne(type => QACrp, crp => crp.id, { eager: true })
    crp: QACrp;


    @ManyToMany(type => QACrp, {
        eager: true
    })
    @JoinTable({
        name: "qa_user_crps", // table name for the junction table of this relation
        joinColumn: {
            name: "qa_user",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "qa_crp",
            referencedColumnName: "id"
        }
    })
    crps: QACrp[];

    // @ManyToOne(type => QACrp, crp => crp.id, { eager: true })
    // crp: QACrp;

    // @Column("simple-array", { nullable: true })
    // indicators: string[];

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        try {
            return bcrypt.compareSync(unencryptedPassword, this.password);
        } catch (error) {
            console.log(error)
            return false;
        }
    }
}