import { config } from "dotenv";
config();
import graphQlTestClient from "./gql/gql-test-client";
import { GraphQLError } from "graphql";
import { DataSource } from "typeorm";

import { registerMutation, loginMutation } from "./gql/mutations/auth-mutations";
import { sendForgotPasswordCodeMutation, verifyForgotPasswordCodeMutation } from "./gql/mutations/forgot-password";
import { ContextObj, LoginArgs } from "../src/graphql/resolvers/auth-resolvers";
import connectDB, { dropDB } from "./model/test-connection";
import { request } from "express";

interface ForgotPassword {
    code: string;
    token: string;
}

let db: DataSource;

let _token: string;
let _code: string;

async function closeDB(db: DataSource) {
    return await db.destroy();
}

beforeAll(async () => {
    db = await connectDB();
    return db;
});

afterAll(async () => {
    return await dropDB(db);
});

describe("forgot password resolvers test", () => {
    test("sendForgotPasswordCode should return object with code", async () => {
        // register new user to get token
        const registerInput: LoginArgs = { email: "forgotPassword@email.com", password: "forgotPassword" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        console.log(registerResponse);

        const input = { email: "forgotPassword@email.com" };
        const response = await graphQlTestClient(sendForgotPasswordCodeMutation, input, registerContext);
        _code = (response?.data?.sendForgotPasswordCode as ForgotPassword).code;
        _token = (response?.data?.sendForgotPasswordCode as ForgotPassword).token;

        console.log(response);

        expect(response).toBeDefined();
        expect(response?.data?.sendForgotPasswordCode).toHaveProperty("code");
        expect(response?.data?.sendForgotPasswordCode).toHaveProperty("token");
    });

    test("verifyForgotPasswordCode should return confirmation string if successful", async () => {
        const input = { code: _code };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;

        const context: ContextObj = {
            db: db,
            req: myRequest,
        };

        const response = await graphQlTestClient(verifyForgotPasswordCodeMutation, input, context);
        console.log(response);

        expect(response?.data).toBeDefined();
        expect(response?.data?.verifyForgotPasswordCode).toBe(
            "Reset Password Code Validated, Please Reset Your Password"
        );
    });
});
