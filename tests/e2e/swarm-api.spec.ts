import { expect, test } from "@playwright/test";

test.describe("Swarm API publish contract", () => {
  test("GET allowed task list and governance mode", async ({ request }) => {
    const response = await request.get("/api/swarm");

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.mode).toBe("deterministic-advisory");
    expect(json.allowedTaskTypes).toContain("growth-engine");
    expect(json.productionNote).toContain("does not execute");
  });

  test("rejects unknown task with allowed task list", async ({ request }) => {
    const response = await request.post("/api/swarm", {
      data: { taskType: "unknown-agent", payload: {} },
    });

    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.allowedTaskTypes).toContain("sales-concierge");
  });

  test("growth-engine returns governed supporting agents", async ({ request }) => {
    const response = await request.post("/api/swarm", {
      data: {
        taskType: "growth-engine",
        payload: {
          context: "publish readiness",
          dates: "Haziran sonu",
          unsafe: "<script>alert(1)</script>",
        },
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.mode).toBe("deterministic-advisory");
    expect(json.governance.executesExternalActions).toBe(false);
    expect(json.payload.unsafe).not.toContain("<");
    expect(json.result.supportingAgents).toHaveLength(5);
    expect(json.result.supportingAgents.map((agent: { agent: string }) => agent.agent)).toContain(
      "ecc-check",
    );
  });
});
