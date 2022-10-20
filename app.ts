import { config } from "dotenv";
config();
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core/dist/plugin/drainHttpServer";
import express from "express";
import http from "http";

import DB from "./src/model/connection";
import typedefs from "./src/graphql/typedefs/typedefs";
import resolvers from "./src/graphql/resolvers";

const port = process.env.PORT || 8080;

const startServer = async (typedefs: any, resolvers: any) => {
    const app = express();
    const httpServer = http.createServer(app);

    const apolloServer = new ApolloServer({
        typeDefs: typedefs,
        resolvers,
        context: async ({ req }) => {
            return {
                req,
                db: await DB(),
            };
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    await new Promise((resolve) => httpServer.listen({ port }, resolve));
    console.log(`🚀 server ready at http://localhost:${port}:${apolloServer.graphqlPath}`);
};

startServer(typedefs, resolvers);
