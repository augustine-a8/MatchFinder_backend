import { gql } from "apollo-server-core/dist/gql";

export default gql`
    type User {
        id: ID!
        email: String!
        password: String!
        profile: Profile!
        confirmationCode: String!
        accountStatus: AccountStatus!
        token: String!
    }

    type Profile {
        id: ID!
        username: String!
        gender: String!
        age: Int!
        user: User!
    }

    enum AccountStatus {
        PENDING
        ACTIVE
    }

    type Query {
        getMe(id: ID!): User!
    }

    type Mutation {
        register(email: String!, password: String!): User!
        login(email: String!, password: String!): User!
        confirmAccount(confirmationCode: String!): User!
    }
`;
