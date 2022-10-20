import authResolvers from "./auth-resolvers";

export default {
    Mutation: {
        ...authResolvers.Mutation,
    },
};
