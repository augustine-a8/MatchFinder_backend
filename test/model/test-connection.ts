import { DataSource } from "typeorm";
import { Profile, User, Match } from "../../src/model/entities";

const db_username = process.env.PG_USERNAME as string;
const db_name = process.env.PG_TESTDBNAME as string;
const db_password = process.env.PG_PASSWORD as string;

const TestDataSource = new DataSource({
    type: "postgres",
    database: db_name,
    username: db_username,
    password: db_password,
    host: "localhost",
    entities: [User, Profile, Match],
    synchronize: true,
});

export default async () => {
    const testDb: DataSource = await TestDataSource.initialize();
    return testDb;
};

export const dropDB = async (db: DataSource) => {
    return db.dropDatabase();
};
