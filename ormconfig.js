module.exports = {
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: ["server/database/models/**/*.js"],
  migrations: ["server/database/migrations/**/*.js"],
  cli: {
    migrationsDir: "server/database/migrations",
  },
};
