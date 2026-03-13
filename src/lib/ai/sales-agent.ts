import { AiClient } from './client';
import { SALES_CONCIERGE_CONFIG } from './config';
import fs from 'fs';
import path from 'path';

export class SalesAgent {
  private client: AiClient;

  constructor() {
    this.client = new AiClient();
  }

  async handleRequest(messages: { role: string; content: string }[]) {
    // 0. Basic Input Sanitization
    const sanitizedMessages = messages.map(m => ({
      ...m,
      content: m.content.slice(0, 2000).replace(/[<>]/g, '') // Length limit + simple tag stripping
    }));

    // 1. Load context dynamically
    const knowledgeRoot = path.join(process.cwd(), 'brand/knowledge_base');
    const generalInfo = fs.readFileSync(path.join(knowledgeRoot, 'general.md'), 'utf8');
    const roomsData = fs.readFileSync(path.join(process.cwd(), 'src/data/rooms.ts'), 'utf8');
    
    // 2. Load Skill Instructions
    const skillPath = path.join(process.cwd(), 'agent/growth-engine/sub-skills/sales-concierge/SKILL.md');
    const skillInstructions = fs.readFileSync(skillPath, 'utf8');

    // 3. Inject everything into the conversation
    const sanitizedMessagesWithContext = [
      { 
        role: "system", 
        content: `
STRICT EVIDENCE PROTOCOL:
1. ONLY use information from the provided KNOWLEDGE BASE and ROOMS DATA.
2. If a guest asks for something NOT in the data (e.g. "Do you have a heliport?"), you MUST say: "Kozbeyli Konağı kayıtlarında bu yönde bir bilgi bulunmamaktadır, en güncel detaylar için sizi yetkilimize aktarabilirim."
3. NEVER make up prices, dates, or distances.

KNOWLEDGE BASE:
${generalInfo}

ROOMS DATA:
${roomsData}

SKILL INSTRUCTIONS:
${skillInstructions}
        `.trim()
      },
      ...sanitizedMessages
    ];

    // 4. Get AI Response
    return await this.client.chat(sanitizedMessagesWithContext, SALES_CONCIERGE_CONFIG);
  }
}
