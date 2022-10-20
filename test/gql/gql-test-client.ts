import { graphql } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typedefs from "../../src/graphql/typedefs/typedefs";
import resolvers from "../../src/graphql/resolvers";

import { ContextObj } from "../../src/graphql/resolvers/auth-resolvers";

const schema = makeExecutableSchema({ typeDefs: typedefs, resolvers });

const graphQlTestClient = async (query: any, variables: any, context: ContextObj) => {
    try {
        const response = await graphql({
            schema,
            source: query,
            variableValues: variables,
            contextValue: context,
        });
        return response;
    } catch (err) {
        console.log("GQL_TEST_CLIENT_ERR: ", err);
    }
};

export default graphQlTestClient;
