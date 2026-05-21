import { DataSource } from "typeorm";

export const dbConnection = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "my_db",
  entities: ["src/**/infrastructure/entities/*.ts"],
  synchronize: true,
});