import { Entity, BaseEntity, PrimaryColumn, Column, OneToOne } from "typeorm";
import User from "./user";

@Entity("profile")
export default class Profile extends BaseEntity {
    @PrimaryColumn({ type: "uuid" })
    id: string;

    @Column({ type: "varchar", length: 150, nullable: false, unique: true })
    username: string;

    @Column({ type: "char", nullable: false })
    gender: string;

    @Column({ type: "int8" })
    age: number;

    @OneToOne(() => User, (user) => user.profile)
    user: User;
}
