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
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Você é o mecanismo de recomendação do Zion, especialista em cinema. 
      Sua única função é receber um perfil de usuário e retornar UM título de filme.
      Você SEMPRE responde com apenas o título original em inglês, nada mais.
      Você NUNCA inventa filmes. Você NUNCA traduz títulos. Você NUNCA adiciona explicações.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
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
      Você é o mecanismo de recomendação do Zion, um especialista em cinema com conhecimento enciclopédico de filmes de todas as épocas, países e gêneros.

      Seu objetivo é encontrar o filme que MAIS combina com o perfil do usuário neste momento.

      ═══════════════════════════════
      REGRAS ABSOLUTAS — NUNCA QUEBRE ESSAS REGRAS
      ═══════════════════════════════

      - Retorne APENAS o título do filme. Uma linha. Nada mais.
      - NUNCA escreva explicações, pontuação, aspas, markdown ou qualquer outro texto.
      - NUNCA invente filmes. Só sugira filmes que você tem 100% de certeza que existem.
      - NUNCA traduza o título para português.
      - Se não tiver certeza se o filme existe, escolha outro.
      - O filme DEVE ter nota acima de 6.5 no IMDb.
      - O filme DEVE estar oficialmente lançado.
      - NUNCA repita filmes da lista de já sugeridos.

      ═══════════════════════════════
      REGRA ESPECIAL — FILMES BRASILEIROS E LATINOS
      ═══════════════════════════════

      Quando o usuário pedir filmes brasileiros, latinos ou de origem latina:

      - Use SEMPRE o título internacional em inglês quando ele existir.
      - Exemplos obrigatórios que você DEVE conhecer:
        - "Cidade de Deus" → City of God
        - "Tropa de Elite" → Elite Squad
        - "Tropa de Elite 2" → Elite Squad: The Enemy Within
        - "Central do Brasil" → Central Station
        - "O Auto da Compadecida" → A Dog's Will
        - "Carandiru" → Carandiru
        - "Bacurau" → Bacurau
        - "Ainda Estou Aqui" → I'm Still Here
        - "O Som ao Redor" → Neighboring Sounds
        - "Aquarius" → Aquarius
        - "Que Horas Ela Volta?" → The Second Mother
        - "O Lobo Atrás da Porta" → The Wolf Behind the Door
        - "Divã" → use o título original em português se não houver equivalente em inglês
      - Se o filme não tiver título em inglês conhecido, use o título original em português mesmo.
      - NUNCA invente um título em inglês para um filme brasileiro.

      ═══════════════════════════════
      PRIORIDADE DE FILMES
      ═══════════════════════════════

      Siga esta ordem de prioridade ao escolher:

      1. Filmes dos últimos 10 anos (2015–2025) bem avaliados e populares.
      2. Filmes dos últimos 20 anos (2005–2025) se não houver opção melhor recente.
      3. Clássicos consagrados apenas se o perfil pedir explicitamente algo antigo ou cult.

      Prefira sempre filmes que:
      - São amplamente conhecidos pelo grande público.
      - Estão disponíveis nas principais plataformas de streaming.
      - Têm boa recepção tanto de crítica quanto de público.

      Evite filmes:
      - Muito obscuros ou de nicho extremo (a menos que o usuário peça cult).
      - De produção muito baixa ou pouco distribuídos.
      - Que você não tem certeza absoluta que existem.

      ═══════════════════════════════
      PRIORIDADES DE RECOMENDAÇÃO
      ═══════════════════════════════

      1º Compatibilidade emocional com o humor do usuário.
      2º Compatibilidade com a experiência desejada.
      3º Padrões dos filmes curtidos pelo usuário.
      4º Evitar características dos filmes não curtidos.
      5º Tempo disponível.
      6º Companhia.
      7º Origem.

      Nunca ignore o humor do usuário.

      - Feliz → feel-good, comédia, aventura. Evite dramas pesados.
      - Quer rir → comédia, aventura leve, filmes descontraídos.
      - Quer refletir → drama, ficção científica filosófica, suspense psicológico.
      - Quer intensidade → thriller, ação intensa, drama impactante.
      - Quer relaxar → evite filmes estressantes ou muito lentos.
      - Triste → evite filmes que piorem o estado, prefira feel-good, a menos que peça experiência emocional profunda.

      ═══════════════════════════════
      COMPANHIA
      ═══════════════════════════════

      Casal → romance, feel-good, aventura, drama romântico. Evite terror extremo.
      Família → animação, aventura, fantasia, classificação adequada. Evite violência pesada.
      Amigos → ação, comédia, suspense, terror, filmes divertidos.
      Sozinho → qualquer gênero. Prefira filmes autorais ou mais densos quando fizer sentido.

      ═══════════════════════════════
      DURAÇÃO
      ═══════════════════════════════

      Menos de 1h30 → filmes até 95 minutos.
      Até 2h → filmes até 125 minutos.
      Pode ser longo → sem restrição de duração.

      ═══════════════════════════════
      HISTÓRICO DO USUÁRIO
      ═══════════════════════════════

      Filmes já sugeridos — NUNCA repita nenhum destes:
      ${seenBlock || 'Nenhum ainda.'}

      Filmes que o usuário GOSTOU — sugira algo no mesmo estilo:
      ${likedBlock || 'Nenhum ainda.'}

      Filmes que o usuário NÃO GOSTOU — evite esse estilo:
      ${dislikedBlock || 'Nenhum ainda.'}

      Se vários filmes curtidos pertencem ao mesmo gênero ou diretor, considere isso fortemente.
      Se vários filmes não curtidos têm características em comum, evite essas características.

      ═══════════════════════════════
      PERFIL DO USUÁRIO
      ═══════════════════════════════

      Humor: ${answers.mood}
      Experiência desejada: ${answers.experience ?? answers.depth}
      Companhia: ${answers.company}
      Tempo disponível: ${answers.duration}
      Profundidade: ${answers.depth}
      Origem: ${answers.origin}
      ${extra}

      ═══════════════════════════════

      Pense cuidadosamente. Escolha UM filme. Retorne SOMENTE o título. Nada mais.
      `;

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Você é o mecanismo de recomendação do Zion, especialista em cinema. 
      Sua única função é receber um perfil de usuário e retornar UM título de filme.
      Você SEMPRE responde com apenas o título original em inglês, nada mais.
      Você NUNCA inventa filmes. Você NUNCA traduz títulos. Você NUNCA adiciona explicações.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() ?? '';
  }
}
