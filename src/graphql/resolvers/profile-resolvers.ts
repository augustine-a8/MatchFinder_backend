import { AuthenticationError } from "apollo-server-core/dist/";
import { v4 as uuidv4 } from "uuid";

import { Profile, User } from "../../model/entities";
import { ContextObj } from "./auth-resolvers";
import { verifyToken, JWTData } from "../../util/jwt-utils";

interface ProfileInput {
    username: string;
    age: number;
    gender: string;
}

export default {
    Query: {
        getProfile: async (_: any, { profileId }: { profileId: string }, context: ContextObj) => {
            const { db, req } = context;
            const token = req?.headers.authorization?.split("Bearer ")[1];

            if (!token) {
                throw new AuthenticationError("CreateProfile: Authentication token should be provided");
            }

            verifyToken(token);

            const profileRepository = db.getRepository(Profile);

            const profile = await profileRepository.findOne({ where: { id: profileId } });

            // possibly never going to happen
            if (!profile) {
                throw new Error("GetProfile: Profile could not be found");
            }

            return profile;
        },
    },
    Mutation: {
        createProfile: async (
            _: any,
            { createProfileInput: { username, age, gender } }: { createProfileInput: ProfileInput },
            context: ContextObj
        ) => {
            const { db, req } = context;
            const token = req?.headers.authorization?.split("Bearer ")[1];

            if (!token) {
                throw new AuthenticationError("CreateProfile: Authentication token should be provided");
            }

            const jwtData = verifyToken(token);
            const { id, email } = jwtData as JWTData;

            const profileRepository = db.getRepository(Profile);
            const userRepository = db.getRepository(User);

            const usernameMatch = await profileRepository.findOne({ where: { username } });
            const user = await userRepository.findOne({ where: { id, email } });

            // possibly never going to happen
            if (!user) {
                throw new Error("CreateProfile: User could not be found");
            }

            if (usernameMatch) {
                throw new Error("CreateProfile: Username has already been taken");
            }

            const newProfile = new Profile();
            newProfile.id = uuidv4();
            newProfile.age = age;
            newProfile.username = username;
            newProfile.gender = gender;
            newProfile.user = user;

            user.profile = newProfile;

            const profile = await newProfile.save();
            await user.save();

            return profile;
        },
        updateProfile: async (
            _: any,
            {
                profileId,
                updateProfileInput: { username, age, gender },
            }: { profileId: string; updateProfileInput: ProfileInput },
            context: ContextObj
        ) => {
            const { db, req } = context;

            const token = req?.headers.authorization?.split("Bearer ")[1];

            if (!token) {
                throw new AuthenticationError("UpdateProfile: Authentication token should be provided");
            }

            const jwtData = verifyToken(token);
            const { id, email } = jwtData as JWTData;

            const profileRepository = db.getRepository(Profile);
            const userRepository = db.getRepository(User);

            const user = await userRepository.findOne({ where: { id, email } });
            const profile = await profileRepository.findOne({ where: { id: profileId } });

            // possibly never going to happen
            if (!user) {
                throw new Error("CreateProfile: User could not be found");
            }
            if (!profile) {
                throw new Error("UpdateProfile: Profile could not be found");
            }

            profile.username = username;
            profile.age = age;
            profile.gender = gender;

            user.profile = profile;

            const _profile = await profile.save();
            const _user = await user.save();

            return _profile;
        },
    },
};
