import { config } from "dotenv";
config();
import { getProfile, createProfile, updateProfile } from "./gql/mutations/profile-mutations";
import graphQlTestClient from "./gql/gql-test-client";
import { request } from "express";
import { ContextObj, LoginArgs } from "../src/graphql/resolvers/auth-resolvers";
import connectDB, { dropDB } from "./model/test-connection";
import { DataSource } from "typeorm";
import { registerMutation } from "./gql/mutations/auth-mutations";
import { createMatch, updateMatch } from "./gql/mutations/match-mutations";
import { User } from "./confirm-account.test";
import { GraphQLError } from "graphql";

let db: DataSource;

let _token: string;
let _matchId: string;

beforeAll(async () => {
    db = await connectDB();
    return db;
});

afterAll(async () => {
    return await dropDB(db);
});

interface Match {
    id: string;
    ageL: number;
    ageH: number;
    gender: string;
}

describe("match resolvers test", () => {
    test("create match should return match object", async () => {
        const registerInput: LoginArgs = { email: "codeman@email.com", password: "codeman" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const token = (registerResponse?.data?.register as User).token;
        _token = token;

        const input = { createMatchInput: { ageL: 20, ageH: 30, gender: "F" } };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };
        const response = await graphQlTestClient(createMatch, input, context);
        console.log(response);
        _matchId = (response?.data?.createMatch as Match).id;
        expect(response?.data?.createMatch).toBeDefined();
        expect(response?.data?.createMatch).toHaveProperty("id");
        expect(response?.data?.createMatch).toHaveProperty("ageL", input.createMatchInput.ageL);
        expect(response?.data?.createMatch).toHaveProperty("ageH", input.createMatchInput.ageH);
        expect(response?.data?.createMatch).toHaveProperty("gender", input.createMatchInput.gender);
    });

    test("update match should return updated match object", async () => {
        const input = { matchId: _matchId, updateMatchInput: { ageL: 35, ageH: 45, gender: "F" } };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(updateMatch, input, context);
        console.log(response);
        expect(response?.data?.updateMatch).toBeDefined();
        expect(response?.data?.updateMatch).toHaveProperty("id");
        expect(response?.data?.updateMatch).toHaveProperty("ageL", input.updateMatchInput.ageL);
        expect(response?.data?.updateMatch).toHaveProperty("ageH", input.updateMatchInput.ageH);
        expect(response?.data?.updateMatch).toHaveProperty("gender", input.updateMatchInput.gender);
    });
});
