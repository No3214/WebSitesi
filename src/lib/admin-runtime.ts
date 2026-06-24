import dns from "node:dns/promises";

type AdminDependencyCode =
  | "missing_payload_secret"
  | "missing_database_uri"
  | "invalid_database_uri"
  | "invalid_database_protocol"
  | "invalid_database_host"
  | "database_dns_unresolved";

export type AdminDependencyStatus =
  | {
      ready: true;
      code: "ready";
      message: "Admin dependencies are reachable.";
    }
  | {
      ready: false;
      code: AdminDependencyCode;
      message: string;
    };

type EnvLike = Partial<Record<"NODE_ENV" | "PAYLOAD_SECRET" | "DATABASE_URI", string>>;
type LookupHost = (hostname: string) => Promise<unknown>;

const cacheMs = 30_000;
let cachedStatus: { checkedAt: number; status: AdminDependencyStatus } | null = null;

function isLocalDatabaseHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function unavailable(code: AdminDependencyCode, message: string): AdminDependencyStatus {
  return {
    ready: false,
    code,
    message,
  };
}

export async function evaluateAdminDependencyStatus(
  env: EnvLike = process.env,
  lookupHost: LookupHost = (hostname) => dns.lookup(hostname),
): Promise<AdminDependencyStatus> {
  const isProduction = env.NODE_ENV === "production";
  const payloadSecret = env.PAYLOAD_SECRET?.trim() || "";
  const databaseUri = env.DATABASE_URI?.trim() || "";

  if (isProduction && !payloadSecret) {
    return unavailable(
      "missing_payload_secret",
      "Admin is unavailable until the production Payload secret is configured.",
    );
  }

  if (!databaseUri) {
    return unavailable(
      "missing_database_uri",
      "Admin is unavailable until the managed Postgres connection is configured.",
    );
  }

  let databaseUrl: URL;
  try {
    databaseUrl = new URL(databaseUri);
  } catch {
    return unavailable(
      "invalid_database_uri",
      "Admin is unavailable because the managed Postgres connection string is invalid.",
    );
  }

  if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) {
    return unavailable(
      "invalid_database_protocol",
      "Admin is unavailable because the database connection must use Postgres.",
    );
  }

  if (isProduction && isLocalDatabaseHost(databaseUrl.hostname)) {
    return unavailable(
      "invalid_database_host",
      "Admin is unavailable because production cannot use a local database host.",
    );
  }

  try {
    await lookupHost(databaseUrl.hostname);
  } catch {
    return unavailable(
      "database_dns_unresolved",
      "Admin is unavailable because the managed database host cannot be resolved from production.",
    );
  }

  return {
    ready: true,
    code: "ready",
    message: "Admin dependencies are reachable.",
  };
}

export async function getAdminDependencyStatus(): Promise<AdminDependencyStatus> {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.checkedAt < cacheMs) {
    return cachedStatus.status;
  }

  const status = await evaluateAdminDependencyStatus();
  cachedStatus = {
    checkedAt: now,
    status,
  };

  return status;
}
