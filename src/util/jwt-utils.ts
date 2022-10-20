import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

export interface JWTData {
    id: string;
    email: string;
}

export const verifyToken = (token: string) => {
    try {
        const payload = jwt.verify(token, secret);
        return payload as JWTData;
    } catch (err) {
        throw new Error("JWT_VERIFICATION ERROR");
    }
};

export const signPayload = (payload: JWTData) => {
    const { id, email } = payload;
    const token = jwt.sign({ id, email }, secret);
    return token;
};
