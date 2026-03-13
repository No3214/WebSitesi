import { AiClient } from './client';
import { CONTENT_ARCHITECT_CONFIG } from './config';
import fs from 'fs';
import path from 'path';

export class ContentArchitect {
  private client: AiClient;

  constructor() {
    this.client = new AiClient();
  }

  async optimizeContent(targetTopic: string, currentContent: string) {
    const skillPath = path.join(process.cwd(), 'agent/growth-engine/sub-skills/content-architect/SKILL.md');
    const skillInstructions = fs.readFileSync(skillPath, 'utf8');

    const messages = [
      { 
        role: "system", 
        content: `INSTRUCTIONS:\n${skillInstructions}` 
      },
      { 
        role: "user", 
        content: `TOPIC: ${targetTopic}\nCURRENT CONTENT: ${currentContent}\n\nGÖREV: Bu içeriği A-Grade Citability (134-167 kelime, yüksek veri yoğunluğu, düşük zamir) prensiplerine göre yeniden yaz.` 
      }
    ];

    return await this.client.chat(messages, CONTENT_ARCHITECT_CONFIG);
  }
}
