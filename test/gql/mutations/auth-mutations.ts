export const loginMutation = `
    mutation ($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            id
            email
            password
            token
            accountStatus
            confirmationCode
        }
    }
`;

export const registerMutation = `
    mutation ($email: String!, $password: String!) {
        register(email: $email, password: $password) {
            id
            email
            password
            token
            accountStatus
            confirmationCode
        }
    }
`;
