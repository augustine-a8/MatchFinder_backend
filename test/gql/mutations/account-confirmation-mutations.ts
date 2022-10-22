export const confirmAccountMutation = `
    mutation ($confirmationCode: String!) {
        confirmAccount(confirmationCode: $confirmationCode) {
            id email password accountStatus confirmationCode
        }
    }
`;

export const resendConfirmationCodeMutaiton = `
    mutation {
        resendConfirmationCode {
            id email password accountStatus confirmationCode token
        }
    }
`;

export const resetPasswordMutation = `
    mutation($newPassword: String!) {
        resetPassword(newPassword: $newPassword) 
    }
`;
