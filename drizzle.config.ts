import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_URL;
if (!dbUrl) {
  throw new Error("DATABASE_URL or SUPABASE_URL must be set to run drizzle migrations");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
