import { AgentConfig } from './config';

export class AiClient {
  private apiKey: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
  }

  async chat(messages: { role: string; content: string }[], config: AgentConfig) {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing");
    }

    const systemPrompt = `
You are ${config.name}, a ${config.role}. 
Persona: ${config.persona}
Current Focus/Stage: ${config.stages ? "Dynamic Stage Management Active" : "General Assistance"}

Core Instructions:
- Always be helpful and professional.
- Use a premium, welcoming tone.
- Respond in Turkish unless asked otherwise.
- Focus on conversion (booking, reservation, visit).
`;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://kozbeylikonagi.com.tr",
        "X-Title": "Kozbeyli Konagi AI Engine"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Cost-effective yet high-reasoning for concierge
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI API Error Details:', errorData);
      throw new Error(`AI API Engine Busy: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message;
  }
}
