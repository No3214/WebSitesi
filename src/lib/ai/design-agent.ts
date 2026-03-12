import { AiClient } from './client';
import { DESIGN_AGENT_CONFIG } from './config';
import fs from 'fs';
import path from 'path';

export class DesignAgent {
  private client: AiClient;

  constructor() {
    this.client = new AiClient();
  }

  async suggestVisuals(topic: string, context: string) {
    const skillPath = path.join(process.cwd(), 'agent/growth-engine/sub-skills/design-agent/SKILL.md');
    let skillInstructions = '';
    
    try {
      skillInstructions = fs.readFileSync(skillPath, 'utf8');
    } catch {
      skillInstructions = 'You are a Design Intelligence Agent. Focus on Visual DNA and Leica M11 aesthetics.';
    }

    const messages = [
      { 
        role: "system", 
        content: skillInstructions 
      },
      { 
        role: "user", 
        content: `TOPIC: ${topic}\nCONTEXT: ${context}\n\nGÖREV: Bu içerik için 'Visual DNA' kurallarına uygun 3 adet görsel üretim promptu oluştur.` 
      }
    ];

    return await this.client.chat(messages, DESIGN_AGENT_CONFIG);
  }
}
