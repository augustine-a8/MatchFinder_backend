import { totp } from "notp";
import { AuthenticationError } from "apollo-server-core";

import { User } from "../../model/entities";
import { signPayload, JWTData, verifyToken } from "../../util/jwt-utils";
import { sendPasswordResetCode } from "../../util/nodemailer-config.util";
import { ContextObj } from "./auth-resolvers";

export default {
    Mutation: {
        sendForgotPasswordCode: async (_: any, { email }: { email: string }, context: ContextObj) => {
            const { db } = context;
            const userRepository = db.getRepository(User);

            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                throw new Error("ForgotPassword: User with given email does not exist");
            }
            const token = signPayload({ id: user.id, email: user.email });

            const code = totp.gen(token, { time: 60 * 60 });

            sendPasswordResetCode(user.email, code);

            return { code, token };
        },
        verifyForgotPasswordCode: async (_: any, { code }: { code: string }, context: ContextObj) => {
            const { db, req } = context;
            const userRepository = db.getRepository(User);
            const token = req?.headers.authorization?.split("Bearer ")[1];

            if (!token) {
                throw new AuthenticationError("VerifyForgotPasswordCode: Authentication token should be provided");
            }

            const { id, email } = verifyToken(token);

            const user = await userRepository.findOne({ where: { id, email } });
            if (!user) {
                throw new Error("VerifyForgotPasswordCode: User cannot be found");
            }

            const verifyCode = totp.verify(code, token, { time: 60 * 60 });
            if (!verifyCode) {
                throw new Error("VerifyForgotPasswordCode: Invalid code provided");
            }

            if (verifyCode.delta < 0) {
                throw new Error("VerifyForgotPasswordCode: Provided code has expired");
            }

            return "Reset Password Code Validated, Please Reset Your Password";
        },
    },
};
