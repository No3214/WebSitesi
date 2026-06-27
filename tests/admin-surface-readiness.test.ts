import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

const root = process.cwd();
const tmpDirs: string[] = [];

type AdminSurfaceModule = {
  evaluateAdminSurfaceSource: (args?: { baseDir?: string }) => {
    ready: boolean;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  };
  evaluateAdminSurfaceLive: (args?: {
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    ready: boolean;
    status: number;
    location: string;
    loginStatus?: number;
    checks: Array<{ id: string; ready: boolean; detail: string }>;
  }>;
  evaluateAdminSurfaceReadiness: (args?: {
    baseDir?: string;
    target?: string;
    fetchImpl?: typeof fetch;
  }) => Promise<{
    decision: string;
    blockers: string[];
  }>;
};

async function loadAdminSurfaceModule() {
  return (await import(
    pathToFileURL(path.join(root, "scripts/admin-surface-readiness.mjs")).href
  )) as AdminSurfaceModule;
}

const safeClientSource = `
  type RuntimeReadinessSnapshot = {
    status: string;
    ready: boolean;
    blockedGates: string[];
    configuredGates: string[];
    checks: Array<{ id: string; ready: boolean; configuredCount: number; requiredCount: number }>;
  };
  export function GrowthDashboardClient({ runtimeReadiness }: { runtimeReadiness: RuntimeReadinessSnapshot }) {
    return <div>Runtime readiness: {runtimeReadiness.status}<span>Blocked runtime gates</span></div>;
  }
`;

function makeTmpProject(source: string, clientSource = safeClientSource) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "kozbeyli-admin-surface-"));
  tmpDirs.push(dir);
  const sourceDir = path.join(dir, "src/app/admin/growth");
  const payloadAdminDir = path.join(dir, "src/app/(payload)/admin/[[...segments]]");
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.mkdirSync(payloadAdminDir, { recursive: true });
  fs.writeFileSync(path.join(sourceDir, "page.tsx"), source);
  fs.writeFileSync(path.join(sourceDir, "growth-client.tsx"), clientSource);
  fs.writeFileSync(
    path.join(payloadAdminDir, "page.tsx"),
    'import { getAdminDependencyStatus } from "@/lib/admin-runtime"; export default async function Page(){ await getAdminDependencyStatus(); return <main data-admin-dependency-status="database_dns_unresolved" />; }',
  );
  fs.writeFileSync(
    path.join(payloadAdminDir, "layout.tsx"),
    'import { getAdminDependencyStatus } from "@/lib/admin-runtime"; export default async function Layout({ children }){ await getAdminDependencyStatus(); return <>{children}</>; }',
  );
  return dir;
}

function mockFetch({
  status,
  location = "",
  body = "",
}: {
  status: number;
  location?: string;
  body?: string;
}): typeof fetch {
  return (async () =>
    ({
      status,
      headers: new Headers(location ? { location } : {}),
      text: async () => body,
    }) as Response) as typeof fetch;
}

function mockAdminFetch({
  growthStatus,
  growthLocation = "",
  growthBody = "",
  loginStatus = 200,
  loginLocation = "",
  loginBody = "<html><body>Payload admin login</body></html>",
}: {
  growthStatus: number;
  growthLocation?: string;
  growthBody?: string;
  loginStatus?: number;
  loginLocation?: string;
  loginBody?: string;
}): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = String(input);
    const isLogin = url.endsWith("/admin");
    return {
      status: isLogin ? loginStatus : growthStatus,
      headers: new Headers(
        isLogin
          ? loginLocation
            ? { location: loginLocation }
            : {}
          : growthLocation
            ? { location: growthLocation }
            : {},
      ),
      text: async () => (isLogin ? loginBody : growthBody),
    } as Response;
  }) as typeof fetch;
}

afterAll(() => {
  for (const dir of tmpDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("admin surface readiness", () => {
  it("keeps the current growth dashboard protected by an admin role guard", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = adminSurface.evaluateAdminSurfaceSource();

    expect(result.ready).toBe(true);
    expect(result.checks.find((check) => check.id === "admin_role_guard")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "boolean_user_guard")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "runtime_readiness_source")).toMatchObject({
      ready: true,
    });
    expect(result.checks.find((check) => check.id === "runtime_secret_env_names")).toMatchObject({
      ready: true,
    });
  });

  it("accepts same-origin unauthenticated redirects to Payload admin login", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceLive({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockAdminFetch({
        growthStatus: 307,
        growthLocation: "/admin",
        loginStatus: 200,
      }),
    });

    expect(result.ready).toBe(true);
    expect(result.status).toBe(307);
    expect(result.location).toBe("/admin");
    expect(result.loginStatus).toBe(200);
  });

  it("blocks admin readiness when the Payload admin login route returns a server error", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockAdminFetch({
        growthStatus: 307,
        growthLocation: "/admin",
        loginStatus: 500,
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_payload_admin_login_reachable");
    expect(result.blockers.join("\n")).toContain("/admin: HTTP 500");
  });

  it("blocks admin readiness when the login route is a controlled dependency outage", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockAdminFetch({
        growthStatus: 307,
        growthLocation: "/admin",
        loginStatus: 200,
        loginBody: '<main data-admin-dependency-status="database_dns_unresolved">Admin unavailable</main>',
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_payload_admin_dependency_ready");
    expect(result.blockers.join("\n")).toContain("controlled dependency-unavailable");
  });

  it("blocks public dashboard body leakage", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      fetchImpl: mockFetch({
        status: 200,
        body: "<h1>Kozbeyli Commercial Launch Control</h1><p>docs/evidence</p>",
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_protected_status");
    expect(result.blockers.join("\n")).toContain("Kozbeyli Commercial Launch Control");
  });

  it("blocks plain authenticated-user guards without admin role enforcement", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(`
      import { redirect } from "next/navigation";
      export const dynamic = "force-dynamic";
      export const metadata = { robots: { index: false, follow: false } };
      export default async function GrowthDashboardPage() {
        const user = {};
        let authenticated = false;
        authenticated = Boolean(user);
        if (!authenticated) redirect("/admin");
        return <GrowthDashboardClient />;
      }
    `);

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "admin_role_guard")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "boolean_user_guard")).toMatchObject({
      ready: false,
    });
  });

  it("blocks admin dashboard source when runtime readiness is no longer wired through the auth guard", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(`
      import { redirect } from "next/navigation";
      import { GrowthDashboardClient } from "./growth-client";
      export const dynamic = "force-dynamic";
      export const metadata = { robots: { index: false, follow: false } };
      export default async function GrowthDashboardPage() {
        let authenticated = true;
        const requestHeaders = {};
        const payload = { auth: async () => ({ user: { role: "admin" } }) };
        const { user } = await payload.auth({ headers: requestHeaders });
        authenticated = user?.role === "admin";
        if (!authenticated) redirect("/admin");
        return <GrowthDashboardClient />;
      }
    `);

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "runtime_readiness_source")).toMatchObject({
      ready: false,
    });
    expect(result.checks.find((check) => check.id === "runtime_readiness_prop")).toMatchObject({
      ready: false,
    });
  });

  it("blocks admin dashboard source when the client renders secret env names", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const dir = makeTmpProject(
      `
        import { redirect } from "next/navigation";
        import { getRuntimeReadiness } from "@/lib/production-readiness";
        import { GrowthDashboardClient } from "./growth-client";
        export const dynamic = "force-dynamic";
        export const metadata = { robots: { index: false, follow: false } };
        export default async function GrowthDashboardPage() {
          let authenticated = true;
          const requestHeaders = {};
          const payload = { auth: async () => ({ user: { role: "admin" } }) };
          const { user } = await payload.auth({ headers: requestHeaders });
          authenticated = user?.role === "admin";
          if (!authenticated) redirect("/admin");
          return <GrowthDashboardClient runtimeReadiness={getRuntimeReadiness()} />;
        }
      `,
      `${safeClientSource}\nexport const leaked = "GA4_API_SECRET";`,
    );

    const result = adminSurface.evaluateAdminSurfaceSource({ baseDir: dir });

    expect(result.ready).toBe(false);
    expect(result.checks.find((check) => check.id === "runtime_secret_env_names")).toMatchObject({
      ready: false,
    });
  });

  it("blocks cross-origin redirects from admin growth", async () => {
    const adminSurface = await loadAdminSurfaceModule();
    const result = await adminSurface.evaluateAdminSurfaceReadiness({
      target: "https://www.kozbeylikonagi.com/admin/growth",
      fetchImpl: mockFetch({
        status: 302,
        location: "https://example.com/admin",
      }),
    });

    expect(result.decision).toBe("ADMIN SURFACE BLOCKED");
    expect(result.blockers.join("\n")).toContain("live_same_origin_admin_redirect");
  });
});
