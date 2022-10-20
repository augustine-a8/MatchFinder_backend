import { config } from "dotenv";
config();
import graphQlTestClient from "./gql/gql-test-client";
import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";
import { request } from "express";

import { loginMutation, registerMutation, confirmAccountMutation } from "./gql/mutations/auth-mutations";
import { ContextObj, LoginArgs } from "../src/graphql/resolvers/auth-resolvers";
import connectDB, { dropDB } from "./model/test-connection";

let db: DataSource;

interface User {
    id: string;
    email: string;
    password: string;
    accountStatus: string;
    confirmationCode: string;
    token: string;
}

async function closeDB(db: DataSource) {
    return await db.destroy();
}

beforeAll(async () => {
    db = await connectDB();
    return db;
});

afterAll(async () => {
    return await closeDB(db);
});

describe("tests for auth resolvers: register & login", () => {
    test("register resolver should be defined", async () => {
        const input: LoginArgs = { email: "newuser@email.com", password: "newuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(registerMutation, input, context);

        expect(response).toBeDefined();
    });

    test("register resolver should return user object", async () => {
        const input: LoginArgs = { email: "testuser@email.com", password: "testuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(registerMutation, input, context);

        expect(response?.data?.register).toHaveProperty("email", input.email);
        expect(response?.data?.register).toHaveProperty("password");
        expect(response?.data?.register).toHaveProperty("id");
        expect(response?.data?.register).toHaveProperty("token");
        expect(response?.data?.register).toHaveProperty("accountStatus", "PENDING");
        expect(response?.data?.register).toHaveProperty("confirmationCode");
    });

    test("register resolver should return error if email has already been registered", async () => {
        const input: LoginArgs = { email: "testuser@email.com", password: "testuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(registerMutation, input, context);
        expect(response?.errors).toStrictEqual([new GraphQLError("Register: Email address already exists")]);
    });

    test("login resolver should return error if email does not exist", async () => {
        const input: LoginArgs = { email: "testuser1@email.com", password: "testuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(loginMutation, input, context);

        expect(response?.errors).toStrictEqual([new GraphQLError("Login: User with given email does not exist")]);
    });

    test("login resolver should return error if account has not been verified", async () => {
        const input: LoginArgs = { email: "testuser@email.com", password: "testuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(loginMutation, input, context);

        expect(response?.errors).toStrictEqual([new GraphQLError("Login: Account has not been verified")]);
    });
});
