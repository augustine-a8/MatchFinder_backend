import { Entity, BaseEntity, PrimaryColumn, Column, OneToOne, JoinColumn } from "typeorm";
import Match from "./match";
import Profile from "./profile";

@Entity("user")
export default class User extends BaseEntity {
    @PrimaryColumn({ type: "uuid" })
    id: string;

    @Column({ type: "varchar", length: 150, nullable: false, unique: true })
    email: string;

    @Column({ type: "text" })
    password: string;

    @Column({ type: "varchar", length: 6, nullable: false })
    confirmationCode: string;

    @Column({ type: "enum", enum: ["PENDING", "ACTIVE"], default: "PENDING", nullable: false })
    accountStatus: string;

    @OneToOne(() => Profile, (profile) => profile.user)
    @JoinColumn()
    profile: Profile;

    @OneToOne(() => Match, (match) => match.user)
    @JoinColumn()
    match: Match;
}
