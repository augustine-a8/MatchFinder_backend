import { DataSource } from "typeorm";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { totp } from "notp";

import { User } from "../../model/entities";
import { signPayload, JWTData } from "../../util/jwt-utils";
import sendMail from "../../util/nodemailer-config.util";

export interface LoginArgs {
    email: string;
    password: string;
}

export interface ContextObj {
    req: Request | undefined;
    db: DataSource;
}

export default {
    Mutation: {
        register: async (_: any, { email, password }: LoginArgs, context: ContextObj) => {
            const { db } = context;
            const userRepository = db.getRepository(User);

            // make sure no user exists in db with email
            const searchEmail = await userRepository.findOne({ where: { email } });
            if (searchEmail) {
                throw new Error("Register: Email address already exists");
            }

            // const hash user password
            password = await bcrypt.hash(password, 12);

            // create new User object
            const userId = uuidv4();
            const newUser = new User();
            newUser.id = userId;
            newUser.email = email;
            newUser.password = password;

            // generate json web token
            const jwtData: JWTData = { id: userId, email: email };
            const token = signPayload(jwtData);

            // const generate confirmation code using generated token
            const confirmationCode = totp.gen(token, { time: 60 * 60 * 3 });
            newUser.confirmationCode = confirmationCode;

            // save new User object in database
            const user = await newUser.save();

            await sendMail(user.email, user.confirmationCode);

            return {
                ...user,
                token,
            };
        },
        login: async (_: any, { email, password }: LoginArgs, context: ContextObj) => {
            const { db } = context;
            const userRepository = db.getRepository(User);

            // find user with email in db
            const user = await userRepository.findOne({ where: { email } });

            if (!user) {
                throw new Error("Login: User with given email does not exist");
            }

            if (user.accountStatus === "PENDING") {
                throw new Error("Login: Account has not been verified");
            }

            // match inputed password with hashed password in database
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error("Login: Password is incorrect");
            }

            // generate new token as part of login resolver return value
            const jwtData: JWTData = { id: user.id, email: user.email };
            const token = signPayload(jwtData);

            return {
                ...user,
                token,
            };
        },
    },
};
