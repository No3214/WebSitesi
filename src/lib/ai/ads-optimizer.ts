import { AiClient } from './client';
import { AgentConfig } from './config';

const ADS_MASTER_CONFIG: AgentConfig = {
  name: "Ads Master",
  role: "Ad-Copy Optimizer",
  persona: "High-conversion specialist with a focus on metrics and 3x Kill Rule."
};

export class AdsOptimizer {
  private client: AiClient;

  constructor() {
    this.client = new AiClient();
  }

  async generateCopy(platform: 'Google' | 'Meta', context: string) {
    const messages = [
      { 
        role: "system", 
        content: `Platform: ${platform}. Objective: High CTR and Quality Score. Remember 30/90 char limits for Google.` 
      },
      { 
        role: "user", 
        content: `Context: ${context}\n\nGenerate 3 variant headlines and 2 descriptions in Turkish.` 
      }
    ];

    return await this.client.chat(messages, ADS_MASTER_CONFIG);
  }
}
