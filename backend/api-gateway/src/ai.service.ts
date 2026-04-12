import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    // We use the OpenAI standard SDK because Nvidia Integration API follows the OpenAI spec!
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('NVIDIA_API_KEY'),
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }

  /**
   * Generates a streaming response using the GLM-5 model via Nvidia
   * This is a direct translation of the Python script you provided!
   */
  async generateStreamingChat(prompt: string) {
    const stream = await this.openai.chat.completions.create({
      model: 'z-ai/glm5',
      messages: [{ role: 'user', content: prompt }],
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      // @ts-ignore - Passing custom extra parameters for Nvidia reasoning model
      extra_body: { 
        chat_template_kwargs: { 
          enable_thinking: true, 
          clear_thinking: false 
        } 
      },
      stream: true,
    });

    return stream;
  }
}
