import authResolvers from "./auth-resolvers";
import profileResolvers from "./profile-resolvers";

export default {
    Mutation: {
        ...authResolvers.Mutation,
        ...profileResolvers.Mutation,
    },
    Query: {
        ...profileResolvers.Query,
    },
};
