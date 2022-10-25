import { createTransport } from "nodemailer";

const user = process.env.NODEMAILER_USER as string;
const pass = process.env.NODEMAILER_PASS as string;

const transport = createTransport({
    service: "Gmail",
    auth: {
        user,
        pass,
    },
});

const sendMail = async (receiverAddress: string, confirmationCode: string) => {
    try {
        await transport.sendMail({
            from: user,
            to: receiverAddress,
            subject: "Confirm your account",
            html: `<div>
            <h1>Email Confirmation</h1>
            <h2>Hello ${receiverAddress.split("@")[0]}</h2>
            <p>Thank you for joining Gql App</p>
            <p>Your confirmation code is <b>${confirmationCode}</b></p>
            <h2>Note: Confirmation code will expire in 3 hours</h2>
            </div>`,
        });
    } catch (err) {
        console.log("NodemailerConfirmationCodeErr: ", err);
    }
};

export const sendPasswordResetCode = async (receiverAddress: string, code: string) => {
    try {
        await transport.sendMail({
            from: user,
            to: receiverAddress,
            subject: "Reset your password",
            html: `<div>
            <h1>Gql Account Password Reset</h1>
            <h2>Hello ${receiverAddress.split("@")[0]}</h2>
            <p>Forgot your password?</p>
            <p>Enter the code: ${code} to create new password</p>
            <h2>Note: Password reset code will expire after 1 hour</h2>
            </div>`,
        });
    } catch (err) {
        console.log("NodemailerPasswordResetErr: ", err);
    }
};

export default sendMail;
