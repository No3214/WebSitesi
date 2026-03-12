import { ContentArchitect } from '../src/lib/ai/content-architect';
import fs from 'fs';
import path from 'path';

/**
 * GEO Integration Script
 * Automatically refactors site content for AI citability.
 */

async function runGeoRefactor() {
  const architect = new ContentArchitect();
  
  const sections = [
    { name: "About", topic: "Kozbeyli Konağı Tarihçesi ve Mimari Yapısı", content: "Kozbeyli Konağı 19. yüzyılda inşa edilmiş tarihi bir taş oteldir. Foça'da yer alır." },
    { name: "Gastronomy", topic: "Antakya Mutfağı ve Dibek Kahvesi Deneyimi", content: "Antakyalı İnci Hanım'ın elinden çıkan lezzetler ve taş dibek kahvesi sunuyoruz." }
  ];

  console.log("🛠️ Starting GEO-SEO Refactor...");

  for (const section of sections) {
    console.log(`Processing: ${section.name}...`);
    const optimized = await architect.optimizeContent(section.topic, section.content);
    
    // Save to deep knowledge base
    const outputPath = path.join(process.cwd(), `brand/knowledge_base/optimized_${section.name.toLowerCase()}.md`);
    fs.writeFileSync(outputPath, optimized.content);
    console.log(`✅ Saved optimized ${section.name} to knowledge base.`);
  }

  console.log("🚀 GEO Refactor Complete.");
}

if (require.main === module) {
  runGeoRefactor().catch(console.error);
}
