import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations need session-level locks that Neon's pooled (PgBouncer)
    // connection doesn't support — the CLI always uses the direct URL,
    // while the running app uses the pooled DATABASE_URL.
    url: env("DATABASE_URL_UNPOOLED"),
  },
});
