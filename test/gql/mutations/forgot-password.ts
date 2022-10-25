export const sendForgotPasswordCodeMutation = `
    mutation($email: String!) {
        sendForgotPasswordCode(email: $email) {
            code token
        }
    }
`;

export const verifyForgotPasswordCodeMutation = `
    mutation($code: String!) {
        verifyForgotPasswordCode(code: $code)
    }
`;
