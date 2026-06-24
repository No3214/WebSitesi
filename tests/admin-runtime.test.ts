import { describe, expect, it } from "vitest";

import { evaluateAdminDependencyStatus } from "../src/lib/admin-runtime";

describe("admin runtime dependency guard", () => {
  const baseEnv = {
    NODE_ENV: "production",
    PAYLOAD_SECRET: "strong-payload-secret",
    DATABASE_URI: "postgresql://postgres:secret@db.supabase.co:5432/postgres",
  };

  it("accepts a reachable production Postgres dependency", async () => {
    const status = await evaluateAdminDependencyStatus(baseEnv, async () => ({ address: "127.0.0.1" }));

    expect(status).toMatchObject({
      ready: true,
      code: "ready",
    });
  });

  it("blocks missing production Payload secret before loading the admin bundle", async () => {
    const status = await evaluateAdminDependencyStatus(
      { ...baseEnv, PAYLOAD_SECRET: "" },
      async () => ({ address: "127.0.0.1" }),
    );

    expect(status).toMatchObject({
      ready: false,
      code: "missing_payload_secret",
    });
  });

  it("blocks localhost databases in production", async () => {
    const status = await evaluateAdminDependencyStatus(
      { ...baseEnv, DATABASE_URI: "postgresql://postgres:secret@localhost:5432/postgres" },
      async () => ({ address: "127.0.0.1" }),
    );

    expect(status).toMatchObject({
      ready: false,
      code: "invalid_database_host",
    });
  });

  it("blocks unresolved managed database hosts without exposing the host or secret", async () => {
    const status = await evaluateAdminDependencyStatus(baseEnv, async () => {
      throw new Error("getaddrinfo ENOTFOUND db.supabase.co");
    });

    expect(status).toMatchObject({
      ready: false,
      code: "database_dns_unresolved",
    });
    expect(status.message).not.toContain("db.supabase.co");
    expect(status.message).not.toContain("secret");
  });
});
