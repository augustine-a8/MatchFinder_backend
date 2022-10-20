import { config } from "dotenv";
config();
import { getProfile, createProfile, updateProfile } from "./gql/mutations/profile-mutations";
import graphQlTestClient from "./gql/gql-test-client";
import { request } from "express";
import { ContextObj, LoginArgs } from "../src/graphql/resolvers/auth-resolvers";
import connectDB, { dropDB } from "./model/test-connection";
import { DataSource } from "typeorm";
import { registerMutation } from "./gql/mutations/auth-mutations";
import { User } from "./confirm-account.test";
import { GraphQLError } from "graphql";

let db: DataSource;

beforeAll(async () => {
    db = await connectDB();
    return db;
});

afterAll(async () => {
    return await dropDB(db);
});

interface Profile {
    id: string;
    username: string;
    age: number;
    gender: string;
}

let _profileId: string;
let _token: string;

describe("tests for profile resolvers", () => {
    test("create profile resolver should return a profile object", async () => {
        const registerInput: LoginArgs = { email: "codeman@email.com", password: "codeman" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const token = (registerResponse?.data?.register as User).token;
        _token = token;

        const input = { createProfileInput: { username: "codeman", age: 22, gender: "M" } };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(createProfile, input, context);
        _profileId = (response?.data?.createProfile as Profile).id;

        expect(response?.data?.createProfile).toBeDefined();
        expect(response?.data?.createProfile).toHaveProperty("id");
        expect(response?.data?.createProfile).toHaveProperty("username", input.createProfileInput.username);
        expect(response?.data?.createProfile).toHaveProperty("age", input.createProfileInput.age);
        expect(response?.data?.createProfile).toHaveProperty("gender", input.createProfileInput.gender);
    });

    test("create profile resolver should return error for already existing username", async () => {
        const registerInput: LoginArgs = { email: "newbae@email.com", password: "newbae" };
        const registerContext: ContextObj = {
            req: undefined,
            db: db,
        };

        const registerResponse = await graphQlTestClient(registerMutation, registerInput, registerContext);
        const token = (registerResponse?.data?.register as User).token;

        const input = { createProfileInput: { username: "codeman", age: 25, gender: "F" } };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(createProfile, input, context);
        console.log(response);

        expect(response?.errors).toStrictEqual([new GraphQLError("CreateProfile: Username has already been taken")]);
    });

    test("update profile resolver should return updated profile object", async () => {
        const input = { profileId: _profileId, updateProfileInput: { username: "codeman2.0", age: 23, gender: "M" } };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };
        const response = await graphQlTestClient(updateProfile, input, context);
        expect(response?.data?.updateProfile).toBeDefined();
        expect(response?.data?.updateProfile).toHaveProperty("id", input.profileId);
        expect(response?.data?.updateProfile).toHaveProperty("age", input.updateProfileInput.age);
        expect(response?.data?.updateProfile).toHaveProperty("gender", input.updateProfileInput.gender);
        expect(response?.data?.updateProfile).toHaveProperty("username", input.updateProfileInput.username);
    });

    test("get profile query should return user profile", async () => {
        const input = { profileId: _profileId };
        const myRequest = request;
        myRequest.headers.authorization = `Bearer ${_token}`;
        const context: ContextObj = {
            req: myRequest,
            db: db,
        };

        const response = await graphQlTestClient(getProfile, input, context);
        expect(response?.data?.getProfile).toBeDefined();
    });
});
