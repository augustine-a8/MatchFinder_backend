import authResolvers from "./auth-resolvers";
import profileResolvers from "./profile-resolvers";
import matchResolvers from "./match-resolvers";
import accountConfirmationResolvers from "./account-confirmation-resolvers";
import forgotPasswordResolvers from "./forgot-password-resolvers";

export default {
    Mutation: {
        ...authResolvers.Mutation,
        ...profileResolvers.Mutation,
        ...matchResolvers.Mutation,
        ...accountConfirmationResolvers.Mutation,
        ...forgotPasswordResolvers.Mutation,
    },
    Query: {
        ...profileResolvers.Query,
    },
};
