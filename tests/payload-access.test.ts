import { describe, expect, it } from "vitest";

import { OrganizationLeads } from "../payload/collections/OrganizationLeads";
import { WebhookEvents } from "../payload/collections/WebhookEvents";

type AccessMap = NonNullable<typeof OrganizationLeads.access>;
type AccessFn = NonNullable<AccessMap["read"]>;
type AccessArgs = Parameters<AccessFn>[0];

function accessArgs(role?: "admin" | "editor"): AccessArgs {
  return {
    req: {
      user: role ? { role } : undefined,
    },
  } as AccessArgs;
}

describe("Payload PII collection access", () => {
  it("limits organization leads to admins", () => {
    const access = OrganizationLeads.access!;

    expect(access.read!(accessArgs("admin"))).toBe(true);
    expect(access.create!(accessArgs("admin"))).toBe(true);
    expect(access.update!(accessArgs("admin"))).toBe(true);
    expect(access.delete!(accessArgs("admin"))).toBe(true);

    expect(access.read!(accessArgs("editor"))).toBe(false);
    expect(access.create!(accessArgs("editor"))).toBe(false);
    expect(access.update!(accessArgs("editor"))).toBe(false);
    expect(access.delete!(accessArgs("editor"))).toBe(false);
  });

  it("makes webhook audit logs admin-readable and append-only", () => {
    const access = WebhookEvents.access!;

    expect(access.read!(accessArgs("admin"))).toBe(true);
    expect(access.create!(accessArgs("admin"))).toBe(true);
    expect(access.update!(accessArgs("admin"))).toBe(false);
    expect(access.delete!(accessArgs("admin"))).toBe(false);

    expect(access.read!(accessArgs("editor"))).toBe(false);
    expect(access.create!(accessArgs("editor"))).toBe(false);
  });
});
