import { DataSource } from "typeorm";
import { User, Profile, Match } from "./entities";

const db_username = process.env.PG_USERNAME as string;
const db_name = process.env.PG_DATABASENAME as string;
const db_password = process.env.PG_PASSWORD as string;

const AppDataSource: DataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    username: db_username,
    password: db_password,
    database: db_name,
    entities: [User, Profile, Match],
    logging: true,
    synchronize: true,
});

export default async () => {
    try {
        console.log("Connecting to db...");
        const db = await AppDataSource.initialize();
        return db;
    } catch (err) {
        console.log("DB_ERROR: ", err);
    }
};
