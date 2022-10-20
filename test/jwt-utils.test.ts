import { config } from "dotenv";
config();
import { verifyToken, signPayload, JWTData } from "../src/util/jwt-utils";

const jwtData: JWTData = {
    email: "testemail@email.com",
    id: "testid",
};

let token: string | undefined;

test("sign payload should return a valid jwt for given payload", () => {
    token = signPayload(jwtData);
    expect(token).toBeDefined();
});

test("verify token should return jwtData for a valid token", () => {
    const payload = verifyToken(token as string);
    expect(payload).toHaveProperty("email", jwtData.email);
    expect(payload).toHaveProperty("id", jwtData.id);
});

test("verify token should throw error for invalid token", () => {
    expect(() => {
        verifyToken("fake");
    }).toThrow();
});
