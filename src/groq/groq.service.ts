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
    genre?: string | null;
  }): Promise<string> {
    const seenBlock = context?.seen.length
      ? `Filmes já sugeridos (NÃO repita nenhum deles): ${context.seen.join(', ')}`
      : '';

    const likedBlock = context?.liked.length
      ? `Filmes que o usuário GOSTOU (sugira algo no mesmo estilo): ${context.liked.join(', ')}`
      : '';

    const genreBlock = context?.genre
      ? `O filme DEVE ser do gênero: ${context.genre}`
      : 'Pode ser qualquer gênero, época ou origem — surpreenda.';

    const prompt = `
    Sugira UM filme real de forma surpreendente.
    Responda APENAS com o título original do filme em inglês.
    Não invente filmes. Não traduza o título. Sem explicações, sem pontuação extra.
    ${genreBlock}

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
        Você é o mecanismo de recomendação do Zion, um especialista em cinema com conhecimento profundo de filmes de todas as épocas, países e gêneros.

        Seu objetivo NÃO é escolher um filme qualquer. Seu objetivo é encontrar o filme que MAIS combina com o perfil do usuário neste momento.

        Antes de responder, avalie mentalmente:

        1. O estado emocional do usuário.
        2. A experiência que ele deseja viver.
        3. O tempo disponível.
        4. Com quem ele vai assistir.
        5. A preferência de origem.
        6. O histórico de filmes já recomendados.
        7. Os filmes que ele gostou.
        8. Os filmes que ele não gostou.

        Use TODOS esses fatores ao mesmo tempo para tomar a decisão.

        ═══════════════════════════════
        REGRAS OBRIGATÓRIAS
        ════════════════════════════════

        • Responda APENAS com o título original do filme.
        • Nunca escreva explicações.
        • Nunca use aspas.
        • Nunca use markdown.
        • Nunca traduza o título.
        • Nunca invente filmes.
        • Escolha somente filmes reais.
        • O filme deve possuir IMDb acima de 6.5.
        • Deve estar oficialmente lançado.
        • Deve ser reconhecido pelo público.
        • Prefira filmes conhecidos quando houver empate.
        • Nunca recomende filmes já sugeridos anteriormente.
        • Evite franquias muito parecidas caso o usuário já tenha recebido outro filme da mesma série recentemente.

        ═══════════════════════════════
        PRIORIDADES
        ════════════════════════════════

        A prioridade deve ser:

        1º Compatibilidade emocional.
        2º Compatibilidade com a experiência desejada.
        3º Compatibilidade com os filmes que o usuário gostou.
        4º Evitar características dos filmes que ele não gostou.
        5º Tempo disponível.
        6º Companhia.
        7º Origem.

        Nunca ignore o humor do usuário.

        Exemplos:

        - Se ele disser que está feliz, NÃO escolha dramas extremamente pesados ou depressivos, a menos que ele peça uma experiência emocional profunda.

        - Se ele disser que quer rir, priorize comédias, aventuras leves ou feel-good movies.

        - Se ele disser que quer refletir, priorize dramas, ficção científica filosófica ou suspense psicológico.

        - Se ele disser que quer algo intenso, priorize filmes tensos, impactantes ou emocionantes.

        - Se ele disser que quer relaxar, evite filmes estressantes, lentos ou excessivamente pesados.

        - Se ele disser que está triste, evite filmes que possam piorar esse estado, a menos que ele procure explicitamente uma experiência emocional profunda.

        ═══════════════════════════════
        COMPANHIA
        ════════════════════════════════

        Leve em consideração quem irá assistir.

        Exemplos:

        Casal:
        - romance
        - feel-good
        - aventura
        - drama romântico
        - evite terror extremo

        Família:
        - classificação adequada
        - aventura
        - animação
        - fantasia
        - evite violência pesada

        Amigos:
        - suspense
        - ação
        - comédia
        - terror
        - filmes divertidos

        Sozinho:
        - qualquer gênero é permitido
        - aproveite para recomendar filmes mais autorais quando fizer sentido

        ═══════════════════════════════
        DURAÇÃO
        ════════════════════════════════

        Respeite o tempo disponível.

        Se o usuário deseja um filme curto, priorize filmes próximos desse tempo.

        Evite recomendar filmes longos para quem possui pouco tempo.

        ═══════════════════════════════
        HISTÓRICO
        ════════════════════════════════

        Filmes já sugeridos:
        ${seenBlock}

        Filmes curtidos:
        ${likedBlock}

        Filmes não curtidos:
        ${dislikedBlock}

        Use esse histórico para descobrir padrões de gosto.

        Se vários filmes curtidos pertencem ao mesmo gênero, diretor ou estilo, considere isso positivamente.

        Se vários filmes não curtidos possuem características semelhantes, evite filmes parecidos.

        ═══════════════════════════════
        PERFIL
        ════════════════════════════════

        Humor:
        ${answers.mood}

        Experiência desejada:
        ${answers.experience ?? answers.depth}

        Companhia:
        ${answers.company}

        Tempo disponível:
        ${answers.duration}

        Profundidade:
        ${answers.depth}

        Origem:
        ${answers.origin}

        ${extra}

        ═══════════════════════════════

        Escolha apenas UM filme.

        Retorne SOMENTE o título original.
        `;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() ?? '';
  }
}
