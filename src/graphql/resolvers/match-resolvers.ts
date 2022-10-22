import { AuthenticationError } from "apollo-server-core";
import { Match, User } from "../../model/entities";
import { verifyToken } from "../../util/jwt-utils";
import { ContextObj } from "./auth-resolvers";
import { v4 as uuidv4 } from "uuid";

interface MatchInput {
    ageL: number;
    ageH: number;
    gender: string;
}

export default {
    Mutation: {
        createMatch: async (
            _: any,
            { createMatchInput: { ageL, ageH, gender } }: { createMatchInput: MatchInput },
            context: ContextObj
        ) => {
            const { db, req } = context;

            const token = req?.headers.authorization?.split("Bearer ")[1];
            if (!token) {
                throw new AuthenticationError("CreateMatch: Authentication token should be provided");
            }

            const { id, email } = verifyToken(token);

            const userRepository = db.getRepository(User);

            const user = await userRepository.findOne({ where: { id, email } });
            if (!user) {
                throw new Error("CreateSpec: User cannot be found");
            }

            const newMatch = new Match();
            newMatch.id = uuidv4();
            newMatch.ageH = ageH;
            newMatch.ageL = ageL;
            newMatch.gender = gender;
            newMatch.user = user;

            user.match = newMatch;

            const _match = await newMatch.save();
            await user.save();

            return _match;
        },
        updateMatch: async (
            _: any,
            { matchId, updateMatchInput: { ageH, ageL, gender } }: { matchId: string; updateMatchInput: MatchInput },
            context: ContextObj
        ) => {
            const { db, req } = context;

            const token = req?.headers.authorization?.split("Bearer ")[1];
            if (!token) {
                throw new AuthenticationError("UpdateMatch: Authentication token should be provided");
            }

            const { id, email } = verifyToken(token);

            const userRepository = db.getRepository(User);
            const matchRepository = db.getRepository(Match);

            const user = await userRepository.findOne({ where: { id, email } });
            if (!user) {
                throw new Error("UpdateMatch: User cannot be found");
            }

            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new Error("UpdateMatch: Match cannot be found");
            }

            match.gender = gender;
            match.ageH = ageH;
            match.ageL = ageL;

            user.match = match;

            const _match = await match.save();
            await user.save();

            return _match;
        },
    },
};
