import { config } from "dotenv";
config();
import graphQlTestClient from "./gql/gql-test-client";
import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { registerMutation, loginMutation } from "./gql/mutations/auth-mutations";
import {
    confirmAccountMutation,
    resendConfirmationCodeMutaiton,
    resetPasswordMutation,
} from "./gql/mutations/account-confirmation-mutations";
import { ContextObj, LoginArgs } from "../src/graphql/resolvers/auth-resolvers";
import connectDB, { dropDB } from "./model/test-connection";
import { request } from "express";

let db: DataSource;

let _token: string;

export interface User {
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
    return await dropDB(db);
    // return dropDB(db);
});

describe("tests for auth resolvers: confirmAccount & login", () => {
    test("confirm account resolver should return user object with activated account", async () => {
        // register new user to get token
        const registerInput: LoginArgs = { email: "codeman@email.com", password: "codeman" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const token = (registerResponse?.data?.register as User).token;
        const confirmationCode = (registerResponse?.data?.register as User).confirmationCode;

        const input = { confirmationCode: confirmationCode };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(confirmAccountMutation, input, context);
        console.log(response);
        expect(response?.data?.confirmAccount).toHaveProperty("accountStatus", "ACTIVE");
    });

    test("confirm account resolver should return error if token is not provided", async () => {
        // register new user to get token
        const registerInput: LoginArgs = { email: "notoken@email.com", password: "notoken" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const confirmationCode = (registerResponse?.data?.register as User).confirmationCode;

        const input = { confirmationCode: confirmationCode };
        const myRequest = request;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(confirmAccountMutation, input, context);
        expect(response?.errors).toStrictEqual([new GraphQLError("ConfirmAccount: Invalid confirmation code")]);
    });

    test("confirm account resolver should return error if wrong confirmation code is provided", async () => {
        // register new user to get token
        const registerInput: LoginArgs = { email: "wrongcode@email.com", password: "wrongcode" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const token = (registerResponse?.data?.register as User).token;

        const input = { confirmationCode: "670213" };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(confirmAccountMutation, input, context);
        expect(response?.errors).toStrictEqual([new GraphQLError("ConfirmAccount: Invalid confirmation code")]);
    });

    test("login resolver should return error if password is incorrect", async () => {
        const input: LoginArgs = { email: "codeman@email.com", password: "testuser" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(loginMutation, input, context);

        expect(response?.errors).toStrictEqual([new GraphQLError("Login: Password is incorrect")]);
    });

    test("login resolver should return user object if successful", async () => {
        const input: LoginArgs = { email: "codeman@email.com", password: "codeman" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(loginMutation, input, context);
        console.log(response);

        _token = (response?.data?.login as User).token;

        expect(response?.data).toBeDefined();
        expect(response?.data?.login).toHaveProperty("id");
        expect(response?.data?.login).toHaveProperty("email");
        expect(response?.data?.login).toHaveProperty("password");
        expect(response?.data?.login).toHaveProperty("accountStatus");
        expect(response?.data?.login).toHaveProperty("confirmationCode");
        expect(response?.data?.login).toHaveProperty("token");
    });

    test("resend confirmation code resolver should return new user object with new confirmation code", async () => {
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(resendConfirmationCodeMutaiton, null, context);
        console.log(response);

        expect(response?.data?.resendConfirmationCode).toBeDefined();
        expect(response?.data?.resendConfirmationCode).toHaveProperty("id");
        expect(response?.data?.resendConfirmationCode).toHaveProperty("email");
        expect(response?.data?.resendConfirmationCode).toHaveProperty("password");
        expect(response?.data?.resendConfirmationCode).toHaveProperty("accountStatus");
        expect(response?.data?.resendConfirmationCode).toHaveProperty("confirmationCode");
    });

    test("reset password resolver should return string with success message", async () => {
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };
        const input = { newPassword: "new_password" };

        const response = await graphQlTestClient(resetPasswordMutation, input, context);
        console.log(response);
        expect(response?.data?.resetPassword).toBeDefined();
    });

    test("login resolver should return error if old password is used after password reset", async () => {
        const input: LoginArgs = { email: "codeman@email.com", password: "codeman" };
        const context: ContextObj = {
            req: undefined,
            db: db,
        };

        const response = await graphQlTestClient(loginMutation, input, context);

        expect(response?.errors).toStrictEqual([new GraphQLError("Login: Password is incorrect")]);
    });

    test("login resolver should work with new password after password reset", async () => {
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };
        const input: LoginArgs = { email: "codeman@email.com", password: "new_password" };

        const response = await graphQlTestClient(loginMutation, input, context);
        console.log(response);

        expect(response?.data).toBeDefined();
        expect(response?.data?.login).toHaveProperty("id");
        expect(response?.data?.login).toHaveProperty("email");
        expect(response?.data?.login).toHaveProperty("password");
        expect(response?.data?.login).toHaveProperty("accountStatus");
        expect(response?.data?.login).toHaveProperty("confirmationCode");
        expect(response?.data?.login).toHaveProperty("token");
    });
});
