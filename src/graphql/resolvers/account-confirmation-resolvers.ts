import { totp } from "notp";

import { User } from "../../model/entities";
import { signPayload, JWTData, verifyToken } from "../../util/jwt-utils";
import sendMail from "../../util/nodemailer-config.util";
import { ContextObj } from "./auth-resolvers";

export default {
    Mutation: {
        confirmAccount: async (_: any, { confirmationCode }: { confirmationCode: string }, context: ContextObj) => {
            const { req, db } = context;
            const userRepository = db.getRepository(User);

            // get token from request header
            const authHeader = req?.headers.authorization;
            const token = authHeader?.split("Bearer ")[1];

            if (!token) {
                throw new Error("ConfirmAccount: JWT should be provided");
            }

            const { id, email } = verifyToken(token);

            // find user in db with details obtainede from verifying jwt
            const user = await userRepository.findOne({ where: { id, email } });

            if (!user) {
                throw new Error("ConfirmAccount: Incorrect token provided");
            }

            // verify notp code
            const notpResult = totp.verify(confirmationCode, token, { time: 60 * 60 * 3 });

            if (!notpResult) {
                throw new Error("ConfirmAccount: Invalid confirmation code");
            }

            if (notpResult.delta < 0) {
                throw new Error("ConfirmAccount: Confirmation code expired, please request new one");
            }

            // activate account
            user.accountStatus = "ACTIVE";

            const _user = await user.save();

            return _user;
        },
        resendConfirmationCode: async (_: any, __: any, context: ContextObj) => {
            const { db, req } = context;

            const userRepository = db.getRepository(User);

            // get token from request header
            const authHeader = req?.headers.authorization;
            const token = authHeader?.split("Bearer ")[1];

            if (!token) {
                throw new Error("ResendConfirmationCode: JWT should be provided");
            }

            const { id, email } = verifyToken(token);

            // find user in db with details obtainede from verifying jwt
            const user = await userRepository.findOne({ where: { id, email } });

            if (!user) {
                throw new Error("ResendConfirmationCode: Incorrect token provided");
            }

            const newToken = signPayload({ id: user.id, email: user.email });
            const newConfirmationCode = totp.gen(newToken, { time: 60 * 60 * 3 });

            user.confirmationCode = newConfirmationCode;

            const _user = await user.save();

            sendMail(_user.email, _user.confirmationCode);

            return {
                ..._user,
                token: newToken,
            };
        },
    },
};
