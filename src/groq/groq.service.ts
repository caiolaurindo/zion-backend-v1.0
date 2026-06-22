import { Injectable } from '@nestjs/common';
import { Groq } from 'groq-sdk';

@Injectable()
export class GroqService {
  private readonly client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async suggestMovie(answers: Record<string, string>): Promise<string> {
    const extra = answers.extra
      ? `Observação do usuário: ${answers.extra}`
      : '';

    const prompt = `
      Com base nas respostas abaixo, sugira UM filme real que combine perfeitamente.
  Responda APENAS com o título original do filme em inglês.
  Não invente filmes. Não traduza o título. Sem explicações, sem pontuação extra.

  Humor atual: ${answers.mood}
  Tempo disponível: ${answers.duration}
  Companhia: ${answers.company}
  Época preferida: ${answers.era}
  Tipo de experiência: ${answers.depth}
  Preferência de origem: ${answers.origin}
  ${extra}
    `;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() ?? '';
  }
}
