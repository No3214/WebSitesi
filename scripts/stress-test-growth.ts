/**
 * Deterministic growth evidence smoke.
 * Keeps the legacy script entrypoint useful without simulating live traffic,
 * fake agents or synthetic conversion metrics.
 */

import { GrowthEngine } from "../src/lib/growth-engine";

function runGrowthEvidenceSmoke() {
  console.log("--- STARTING GROWTH EVIDENCE SMOKE ---");

  const health = GrowthEngine.checkHealth();
  console.log(`Status: ${health.status}`);
  console.log(`Commercial readiness: ${health.metrics.commercial_readiness}`);
  console.log(`Blocked points: ${health.metrics.blocked_points}`);
  console.log(`Release gate: ${health.metrics.release_gate}`);
  console.log(`Cutover plan: ${health.metrics.cutover_plan}`);

  for (const alert of health.alerts) {
    console.log(`Alert: ${alert}`);
  }

  const drift = GrowthEngine.runDriftCheck(
    "/admin/growth",
    "Kozbeyli Konağı taş otel, Antakya ve Ege mutfağıyla Foça çevresinde konumlanır.",
  );

  console.log(`Drift path: ${drift.currentPath}`);
  console.log(`Drift score: ${Math.round(drift.alignmentScore * 100)}%`);
  console.log(`Suggestion: ${drift.suggestion}`);

  if (drift.alignmentScore < 0.6) {
    process.exitCode = 1;
  }

  console.log("--- GROWTH EVIDENCE SMOKE COMPLETE ---");
}

runGrowthEvidenceSmoke();
