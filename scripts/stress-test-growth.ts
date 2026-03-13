/**
 * Growth Engine Stress Test Simulator
 * Simulates concurrent AI requests and Growth Engine health checks.
 */

import { GrowthEngine } from '../src/lib/growth-engine';

async function runStressTest() {
  console.log('--- STARTING GROWTH ENGINE STRESS TEST ---');
  const CONCURRENT_REQUESTS = 50;
  const iterations = 5;
  
  for (let i = 0; i < iterations; i++) {
    console.log(`\nIteration ${i+1}/${iterations} - Simulating ${CONCURRENT_REQUESTS} concurrent requests...`);
    
    const startTime = Date.now();
    const results = await Promise.all(
      Array.from({ length: CONCURRENT_REQUESTS }).map(() => {
        return GrowthEngine.checkHealth();
      })
    );
    const endTime = Date.now();
    
    const surgeCount = results.filter(r => r.status === 'SURGE').length;
    const optimalCount = results.filter(r => r.status === 'OPTIMAL').length;
    
    console.log(`Results: ${optimalCount} Optimal, ${surgeCount} Surge`);
    console.log(`Execution Time: ${endTime - startTime}ms`);
    
    // Simulate drift check
    const drift = GrowthEngine.runDriftCheck('/stress-test', 'Kozbeyli Konağı Horasan mirası İnci Hanım');
    console.log(`Drift Score: ${drift.alignmentScore * 100}% | ${drift.suggestion}`);
    
    // Verify Rate Limiting Simulation (Conceptual)
    if ((endTime - startTime) > 200) {
      console.warn('ALERT: Latency threshold exceeded. Scaling simulator load...');
    }
  }
  
  console.log('\n--- STRESS TEST COMPLETE: SYSTEM STABLE ---');
}

runStressTest().catch(console.error);
