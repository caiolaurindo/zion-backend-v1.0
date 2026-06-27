import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

interface HistoryContext {
  seen: string[];
  liked: string[];
  disliked: string[];
}

@Injectable()
export class GroqService {
  private readonly client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  async suggestRandom(context?: {
    seen: string[];
    liked: string[];
  }): Promise<string> {
    const seenBlock = context?.seen.length
      ? `Filmes já sugeridos (NÃO repita nenhum deles): ${context.seen.join(', ')}`
      : '';

    const likedBlock = context?.liked.length
      ? `Filmes que o usuário GOSTOU (sugira algo no mesmo estilo): ${context.liked.join(', ')}`
      : '';

    const prompt = `
    Sugira UM filme real de forma surpreendente.
    Responda APENAS com o título original do filme em inglês.
    Não invente filmes. Não traduza o título. Sem explicações, sem pontuação extra.
    Pode ser qualquer gênero, época ou origem — surpreenda.

    ${seenBlock}
    ${likedBlock}
  `;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 1.2,
    });

    return completion.choices[0].message.content?.trim() ?? '';
  }

  async suggestMovie(
    answers: Record<string, string>,
    context?: HistoryContext,
  ): Promise<string> {
    const extra = answers.extra
      ? `Observação do usuário: ${answers.extra}`
      : '';

    const seenBlock = context?.seen.length
      ? `Filmes já sugeridos (NÃO repita nenhum deles): ${context.seen.join(', ')}`
      : '';

    const likedBlock = context?.liked.length
      ? `Filmes que o usuário GOSTOU (sugira algo parecido): ${context.liked.join(', ')}`
      : '';

    const dislikedBlock = context?.disliked.length
      ? `Filmes que o usuário NÃO GOSTOU (evite esse estilo): ${context.disliked.join(', ')}`
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

      ${seenBlock}
      ${likedBlock}
      ${dislikedBlock}
    `;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() ?? '';
  }
}
