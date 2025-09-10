import { defineConfig } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function getLocalD1DB() {
    try {
        const basePath = path.resolve(".wrangler");
        const dbFile = fs
            .readdirSync(basePath, { encoding: "utf-8", recursive: true })
            .find(f => f.endsWith(".sqlite"));

        if (!dbFile) {
            throw new Error(`.sqlite file not found in ${basePath}`);
        }

        const url = path.resolve(basePath, dbFile);
        return url;
    } catch (err) {
        console.log(`Error  ${err}`);
    }
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/index.ts",
    out: "./drizzle",
    ...(process.env.NODE_ENV === "production"
        ? {
              dbCredentials: {
                  url: process.env.DATABASE_URL!,
              },
          }
        : {
              dbCredentials: {
                  url: process.env.DATABASE_URL!,
              },
          }),
});
