import { Entity, BaseEntity, PrimaryColumn, Column, OneToOne } from "typeorm";
import User from "./user";

@Entity("match")
export default class Match extends BaseEntity {
    @PrimaryColumn({ type: "uuid" })
    id: string;

    @Column({ type: "char", nullable: false })
    gender: string;

    @Column({ type: "int8" })
    ageL: number;

    @Column({ type: "int8" })
    ageH: number;

    @OneToOne(() => User, (user) => user.match)
    user: User;
}
