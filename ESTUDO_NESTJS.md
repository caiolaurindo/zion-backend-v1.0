# 📚 Documentação Completa - Projeto Zion Backend NestJS

> **Objetivo**: Este projeto foi desenvolvido para estudar NestJS e suas ferramentas. Este documento mapeia toda a estrutura, explicando conceitos, decoradores, métodos e sintaxe utilizados.

---

## 📋 Índice

1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura e Estrutura](#arquitetura-e-estrutura)
3. [Conceitos Fundamentais do NestJS](#conceitos-fundamentais-do-nestjs)
4. [Decoradores Explicados](#decoradores-explicados)
5. [Módulos do Projeto](#módulos-do-projeto)
6. [Controllers e Services](#controllers-e-services)
7. [Sistema de Autenticação](#sistema-de-autenticação)
8. [Banco de Dados com Prisma](#banco-de-dados-com-prisma)
9. [Fluxo de Requisições](#fluxo-de-requisições)
10. [Best Practices Observadas](#best-practices-observadas)

---

## 🎯 Visão Geral do Projeto

### O que é o Zion?

O Zion é uma aplicação backend que oferece **recomendações personalizadas de filmes** usando inteligência artificial. O sistema:

- 🎬 Busca filmes no OMDB API
- 🤖 Gera recomendações inteligentes com Groq AI
- 👤 Gerencia perfil e histórico de usuários
- 💾 Persiste dados com PostgreSQL via Prisma
- 🔐 Autentica usuários com Supabase

### Stack Tecnológico

```json
{
  "framework": "NestJS 11.0.1",
  "banco": "PostgreSQL com Prisma",
  "auth": "Supabase JWT",
  "IA": "Groq AI (llama-3.1-8b-instant)",
  "api": "OMDB API",
  "http": "Axios",
  "segurança": "bcrypt, jsonwebtoken"
}
```

---

## 🏗️ Arquitetura e Estrutura

### Estrutura de Pastas

```
src/
├── main.ts                 # Ponto de entrada da aplicação
├── app.module.ts          # Módulo raiz que importa todos os outros
├── app.controller.ts      # Controller raiz (vazio)
├── app.service.ts         # Service raiz (vazio)
│
├── auth/                  # Módulo de autenticação
│   ├── auth.module.ts     # Importa PrismaModule
│   ├── auth.controller.ts # Vazio (Guards fazem o trabalho)
│   ├── auth.service.ts    # Vazio
│   ├── auth.guard.ts      # 🔒 Guard obrigatória com Supabase
│   └── auth-optional.guard.ts  # 🔓 Guard opcional
│
├── omdb/                  # Módulo de busca de filmes
│   ├── omdb.module.ts     # Exporta OmdbService
│   ├── omdb.controller.ts # GET /omdb/search?title=X
│   └── omdb.service.ts    # Integração com OMDB API
│
├── groq/                  # Módulo de IA para recomendações
│   ├── groq.module.ts     # Exporta GroqService
│   ├── groq.controller.ts # POST /groq/suggest
│   └── groq.service.ts    # Integração com Groq AI
│
├── quiz/                  # Módulo de recomendação (orquestra tudo)
│   ├── quiz.module.ts     # Importa: OmdbModule, GroqModule, PrismaModule
│   ├── quiz.controller.ts # POST /quiz/recommend (com AuthOptionalGuard)
│   └── quiz.service.ts    # Orquestra fluxo: Groq → OMDB → Prisma
│
├── history/               # Módulo de histórico do usuário
│   ├── history.module.ts  # Importa PrismaModule
│   ├── history.controller.ts  # GET, PATCH (com AuthGuard)
│   └── history.service.ts # CRUD do histórico
│
└── prisma/                # Módulo de banco de dados
    ├── prisma.module.ts   # Exporta PrismaService
    └── prisma.service.ts  # Conexão com PostgreSQL
```

### Diagrama de Dependências

```
AppModule (raiz)
├── ConfigModule        (variáveis de ambiente)
├── PrismaModule        (banco de dados)
├── OmdbModule          (usa: axios)
├── GroqModule          (usa: groq-sdk)
├── QuizModule          (usa: OmdbModule, GroqModule, PrismaModule)
├── AuthModule          (usa: PrismaModule)
└── HistoryModule       (usa: PrismaModule)
```

---

## 🧠 Conceitos Fundamentais do NestJS

### O que é NestJS?

NestJS é um framework progressivo para construir servidores Node.js eficientes e escaláveis. Ele combina:

- **Express ou Fastify** como adaptador HTTP
- **TypeScript** como linguagem principal
- **Programação Orientada a Objetos** (classes e decoradores)
- **Programação Reativa** (RxJS)
- **Injeção de Dependência** (IoC Container)

### Ciclo de Vida de uma Requisição no NestJS

```
1. HTTP Request chega ao servidor
        ↓
2. NestJS passa por Middleware (Express/Fastify)
        ↓
3. Guards são executados (verificam permissões)
        ↓
4. Interceptors (antes do handler)
        ↓
5. Pipes (transformam e validam dados)
        ↓
6. Controller Handler executa
        ↓
7. Service executa a lógica de negócio
        ↓
8. Interceptors (depois do handler)
        ↓
9. Response é enviada ao cliente
```

### Injeção de Dependência

NestJS usa injeção de dependência (DI) através do seu IoC Container:

```typescript
// Em vez de:
class MyService {
  private otherService = new OtherService(); // ❌ Acoplamento forte
}

// Usamos:
@Injectable()
class MyService {
  constructor(private otherService: OtherService) {} // ✅ Injeção
}
```

**Benefícios:**
- Desacoplamento
- Testabilidade
- Reutilização de código
- Facilita mocks em testes

---

## 🎨 Decoradores Explicados

Decoradores são funções especiais que modificam o comportamento de classes, métodos e propriedades.

### Decoradores de Classe

#### `@Module()`

Define um módulo NestJS:

```typescript
@Module({
  imports: [ConfigModule.forRoot()],  // Módulos que este módulo precisa
  controllers: [AppController],        // Controllers que pertencem a este módulo
  providers: [AppService],             // Services/Providers que este módulo oferece
  exports: [AppService],               // O que este módulo exporta para outros
})
export class AppModule {}
```

#### `@Controller()`

Define uma classe como controller que manipula rotas HTTP:

```typescript
@Controller('omdb')  // Prefixo das rotas: GET /omdb/search
export class OmdbController {
  // Todos os métodos daqui respondem a /omdb/*
}
```

#### `@Injectable()`

Define uma classe como um "provider" (serviço) que pode ser injetado em outras classes:

```typescript
@Injectable()
export class OmdbService {
  // Esta classe pode ser injetada em controllers/services
}
```

### Decoradores de Método HTTP

#### `@Get()`

Responde a requisições GET:

```typescript
@Get()                        // GET /omdb
@Get('search')                // GET /omdb/search
@Get('search/:id')            // GET /omdb/search/123
async getSearch(@Param('id') id: string) {
  return { id };
}
```

#### `@Post()`

Responde a requisições POST:

```typescript
@Post('suggest')              // POST /groq/suggest
async suggest(@Body() data: any) {
  return data;
}
```

#### `@Patch()`

Responde a requisições PATCH (atualização parcial):

```typescript
@Patch(':id/like')            // PATCH /history/123/like
async updateLike(@Param('id') id: string, @Body() body: any) {
  return { id, ...body };
}
```

#### `@Put()`, `@Delete()`, etc.

Outros métodos HTTP seguem o mesmo padrão.

### Decoradores de Parâmetros

#### `@Body()`

Extrai o corpo da requisição:

```typescript
@Post('recommend')
async recommend(@Body() answers: Record<string, string>) {
  // answers contém o JSON enviado no corpo
}
```

#### `@Param()`

Extrai parâmetros da URL:

```typescript
@Get(':id')
async getItem(@Param('id') id: string) {
  // id = valor extraído da URL
}
```

#### `@Query()`

Extrai parâmetros de query string:

```typescript
@Get('search')
async search(@Query('title') title: string) {
  // title vem de: GET /search?title=Avatar
}
```

#### `@Req()` e `@Res()`

Acesso ao objeto Request e Response do Express:

```typescript
@Get()
async getData(@Req() req: any, @Res() res: any) {
  // req = objeto Express Request
  // res = objeto Express Response
  res.send({ data: 'value' });
}
```

### Decoradores de Guard e Middleware

#### `@UseGuards()`

Aplica guards (validadores de acesso) a um controller ou método:

```typescript
@Controller('history')
@UseGuards(AuthGuard)  // Protege TODOS os métodos
export class HistoryController {
  @Get()
  getHistory() { }

  @Patch(':id/like')
  @UseGuards(AnotherGuard)  // Proteção adicional apenas para este método
  updateLike() { }
}
```

#### `@UseInterceptors()`

Aplica interceptors (processam request/response):

```typescript
@Get()
@UseInterceptors(LoggingInterceptor)
getData() { }
```

---

## 📦 Módulos do Projeto

### Conceito: O que é um Módulo?

Um módulo é um container que agrupa:
- **Controllers**: recebem requisições HTTP
- **Providers** (Services): contêm lógica de negócio
- **Imports**: módulos que este módulo precisa
- **Exports**: o que este módulo disponibiliza para outros

Módulos são a forma de organizar código em NestJS!

### Módulo 1: PrismaModule

**Arquivo**: `prisma/prisma.module.ts`

```typescript
@Module({
  providers: [PrismaService],
  exports: [PrismaService],  // Disponível para outros módulos
})
export class PrismaModule {}
```

**Responsabilidade**: Gerenciar conexão com PostgreSQL

**O que exporta**: `PrismaService` para outros módulos

---

### Módulo 2: AuthModule

**Arquivo**: `auth/auth.module.ts`

```typescript
@Module({
  imports: [PrismaModule],  // Precisa de PrismaService
})
export class AuthModule {}
```

**Responsabilidade**: Autenticação com Supabase

**O que oferece**: `AuthGuard` e `AuthOptionalGuard`

**Fluxo de autenticação**:

1. Cliente envia: `Authorization: Bearer <TOKEN_JWT>`
2. Guard intercepta a requisição
3. Guard valida token com Supabase
4. Se válido: `req.user = { sub: userId, email: userEmail }`
5. Se inválido: lança `UnauthorizedException`

---

### Módulo 3: OmdbModule

**Arquivo**: `omdb/omdb.module.ts`

```typescript
@Module({
  controllers: [OmdbController],
  providers: [OmdbService],
  exports: [OmdbService],  // Disponível para outros módulos
})
export class OmdbModule {}
```

**Responsabilidade**: Integração com OMDB API

**Endpoints**:
- `GET /omdb/search?title=Avatar` → Busca filme na API

**Exemplo de resposta**:
```json
{
  "title": "Avatar",
  "poster": "https://...",
  "year": "2009",
  "rating": "7.8",
  "director": "James Cameron",
  "runtime": "162 min",
  "plot": "A paraplegic Marine...",
  "actors": ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"]
}
```

---

### Módulo 4: GroqModule

**Arquivo**: `groq/groq.module.ts`

```typescript
@Module({
  controllers: [GroqController],
  providers: [GroqService],
  exports: [GroqService],
})
export class GroqModule {}
```

**Responsabilidade**: IA para recomendação de filmes

**Endpoints**:
- `POST /groq/suggest` → Retorna título de filme recomendado

**Funcionalidade especial**: Evita repetição de filmes já vistos

---

### Módulo 5: QuizModule

**Arquivo**: `quiz/quiz.module.ts`

```typescript
@Module({
  imports: [OmdbModule, GroqModule, PrismaModule],  // Reutiliza outros módulos
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
```

**Responsabilidade**: Orquestra o fluxo completo de recomendação

**Endpoints**:
- `POST /quiz/recommend` → Recomenda filme completo

**Fluxo**:
```
1. Recebe respostas do quiz do usuário
2. Busca histórico do usuário (se autenticado)
3. Envia para IA gerar título de filme
4. Busca dados do filme na OMDB
5. Salva no histórico do usuário
6. Retorna dados completos do filme
```

**Guard**: `AuthOptionalGuard` → Funciona com ou sem autenticação

---

### Módulo 6: HistoryModule

**Arquivo**: `history/history.module.ts`

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
```

**Responsabilidade**: Gerenciar histórico de filmes do usuário

**Endpoints**:
- `GET /history` → Lista histórico do usuário
- `PATCH /history/:id/like` → Marca se gostou/não gostou
- `PATCH /history/:id/watched` → Marca como assistido

**Guard**: `@UseGuards(AuthGuard)` → Requer autenticação

---

## 🛠️ Controllers e Services

### Padrão MVC em NestJS

```
HTTP Request
    ↓
Controller (recebe, valida, delega)
    ↓
Service (lógica de negócio)
    ↓
Repository/Database (persistência)
    ↓
Response
```

### Controller vs Service

| Aspecto | Controller | Service |
|--------|-----------|---------|
| **Responsabilidade** | Receber HTTP, validar, delegar | Lógica de negócio |
| **Decorador** | `@Controller()` | `@Injectable()` |
| **O que faz** | Mapeia rotas, extrai parâmetros | Interage com BD, APIs externas |
| **Testabilidade** | Mais difícil (envolve HTTP) | Mais fácil (apenas lógica) |

### Exemplo: Controller

**Arquivo**: `omdb/omdb.controller.ts`

```typescript
@Controller('omdb')  // Todas rotas começam com /omdb
export class OmdbController {
  // Injeção de dependência: OmdbService é injetado automaticamente
  constructor(private readonly omdbService: OmdbService) {}

  @Get('search')  // GET /omdb/search
  async search(@Query('title') title: string) {
    // @Query extrai parâmetro de query string
    return this.omdbService.searchMovie(title);
  }
}
```

**Como funciona**:
1. Cliente faz: `GET /omdb/search?title=Avatar`
2. NestJS reconhece a rota `@Get('search')`
3. Extrai `title` de query string
4. Chama `omdbService.searchMovie('Avatar')`
5. Retorna resposta

### Exemplo: Service

**Arquivo**: `omdb/omdb.service.ts`

```typescript
@Injectable()
export class OmdbService {
  private readonly apikey = process.env.OMDB_API_KEY;
  private readonly baseUrl = 'http://www.omdbapi.com';

  async searchMovie(title: string) {
    // Realiza chamada HTTP para API externa
    const response = await axios.get(this.baseUrl, {
      params: {
        t: title,
        apikey: this.apikey,
      },
    });

    const m = response.data;

    // Verifica se API retornou erro
    if (m.Response === 'False') {
      return { error: 'Filme não encontrado' };
    }

    // Transforma resposta da API no formato que queremos
    const actors = m.Actors
      ? m.Actors.split(',')
          .slice(0, 3)  // Pega apenas 3 primeiros
          .map((a: string) => a.trim())
      : [];

    return {
      title: m.Title,
      poster: m.Poster,
      year: m.Year,
      rating: m.imdbRating,
      director: m.Director,
      runtime: m.Runtime,
      plot: m.Plot,
      actors,
    };
  }
}
```

**O que aprendemos**:
- Service contém lógica de negócio
- Usa axios para chamadas HTTP
- Trata erros
- Transforma dados em formato útil
- Totalmente testável (sem envolvimento HTTP)

### Exemplo Complexo: Quiz Service (Orquestração)

**Arquivo**: `quiz/quiz.service.ts`

```typescript
@Injectable()
export class QuizService {
  // Injeção de 3 serviços diferentes
  constructor(
    private readonly groqService: GroqService,
    private readonly omdbService: OmdbService,
    private readonly prisma: PrismaService,
  ) {}

  async recommend(answers: Record<string, string>, userId: string | null) {
    let seen: string[] = [];
    let liked: string[] = [];
    let disliked: string[] = [];

    // Se usuário está autenticado, busca histórico
    if (userId) {
      // UPSERT: cria se não existe, atualiza se existe
      await this.prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId },
      });

      // Busca histórico do usuário
      const history = await this.prisma.history.findMany({
        where: { userId },
        include: { movie: true },  // Inclui dados do filme
      });

      // Mapeia filmes vistos, gostou, não gostou
      seen = history.map((h) => h.movie.title);
      liked = history
        .filter((h) => h.liked === true)
        .map((h) => h.movie.title);
      disliked = history
        .filter((h) => h.liked === false)
        .map((h) => h.movie.title);
    }

    // 1️⃣ IA gera recomendação
    const movieTitle = await this.groqService.suggestMovie(answers, {
      seen,
      liked,
      disliked,
    });

    // 2️⃣ Busca dados do filme
    const movie = await this.omdbService.searchMovie(movieTitle);

    if ('error' in movie) {
      return { error: movie.error };
    }

    // 3️⃣ Se autenticado, salva no banco
    if (userId) {
      // Verifica se filme já existe
      let savedMovie = await this.prisma.movie.findFirst({
        where: { title: movie.title },
      });

      // Se não existe, cria
      if (!savedMovie) {
        savedMovie = await this.prisma.movie.create({
          data: {
            title: movie.title,
            poster: movie.poster,
            year: movie.year,
            rating: movie.rating,
            director: movie.director,
            runtime: movie.runtime,
            plot: movie.plot,
            actors: movie.actors,
          },
        });
      }

      // Registra no histórico
      await this.prisma.history.create({
        data: { userId, movieId: savedMovie.id },
      });
    }

    // Retorna dados completos
    return {
      suggestedBy: movieTitle,
      ...movie,
    };
  }
}
```

**Padrões observados**:

1. **Orquestração**: Coordena múltiplos serviços
2. **Composição**: Usa serviços injetados
3. **Tratamento condicional**: Funciona com/sem usuário
4. **Persistência**: Salva dados se apropriado
5. **Transformação**: Combina dados de múltiplas fontes

---

## 🔐 Sistema de Autenticação

### Arquitetura de Autenticação

```
Cliente                    Servidor NestJS
   |                            |
   |-- POST /login             |
   |   (email, password)        |
   |                            |
   |                    Supabase Verifica
   |                            |
   |<-- JWT Token               |
   |                            |
   |-- GET /history             |
   |-- Authorization: Bearer JWT |
   |                            |
   |                    Guard Valida JWT
   |                            |
   |<-- Dados (se válido)        |
   |                            |
   |<-- 401 Unauthorized (se inválido)
```

### Guard: AuthGuard (Obrigatória)

**Arquivo**: `auth/auth.guard.ts`

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extrai objeto Request do ExecutionContext
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 2. Valida se header Authorization existe
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    // 3. Extrai token do header (formato: "Bearer TOKEN")
    const token = authHeader.split(' ')[1];

    // 4. Valida token com Supabase
    const { data, error } = await this.supabase.auth.getUser(token);

    // 5. Se inválido, lança exceção
    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // 6. Se válido, adiciona dados do usuário ao Request
    request.user = { sub: data.user.id, email: data.user.email };

    // 7. Retorna true para permitir acesso
    return true;
  }
}
```

**Conceitos**:

- **ExecutionContext**: Contexto de execução que dá acesso a Request/Response
- **CanActivate**: Interface que guards devem implementar
- **throw UnauthorizedException**: Rejeita requisição (retorna HTTP 401)

### Guard: AuthOptionalGuard (Opcional)

**Arquivo**: `auth/auth-optional.guard.ts`

```typescript
@Injectable()
export class AuthOptionalGuard implements CanActivate {
  // Mesmo que AuthGuard, mas...
  
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // ❌ NÃO lança erro se não existir token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = null;  // Apenas marca como sem autenticação
      return true;          // Permite acesso mesmo assim!
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await this.supabase.auth.getUser(token);

    // Se inválido, também não lança erro
    if (error || !data.user) {
      request.user = null;
      return true;
    }

    // Se válido, adiciona usuário
    request.user = { sub: data.user.id, email: data.user.email };
    return true;
  }
}
```

**Diferença**:
- `AuthGuard`: Força autenticação (401 se inválido)
- `AuthOptionalGuard`: Permite com/sem autenticação (usa `req.user === null` se não autenticado)

### Uso de Guards

```typescript
// Aplicado no Controller (protege TODOS os métodos)
@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController { }

// Aplicado em método específico
@Post('recommend')
@UseGuards(AuthOptionalGuard)
async recommend() { }

// Múltiplos guards (devem passar por TODOS)
@Get()
@UseGuards(AuthGuard, CustomGuard)
getData() { }
```

---

## 💾 Banco de Dados com Prisma

### O que é Prisma?

Prisma é um ORM (Object-Relational Mapping) que permite:
- Definir schema de forma declarativa
- Gerar client JavaScript type-safe
- Fazer migrations automáticas
- Consultar BD de forma intuitiva

### Schema Prisma

**Arquivo**: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
}

model User {
  id        String   @id              # ID como string (vem do Supabase)
  createdAt DateTime @default(now())  # Timestamp criação (padrão: agora)

  history   History[]  # Relação: 1 usuário → múltiplos históricos
}

model Movie {
  id        String   @id @default(uuid())  # ID automático (UUID)
  title     String                         # Título do filme
  poster    String                         # URL do poster
  year      String                         # Ano de lançamento
  rating    String                         # Rating IMDB
  director  String                         # Diretor
  runtime   String                         # Tempo de execução
  plot      String                         # Sinopse
  actors    String[]                       # Array de nomes de atores

  history   History[]  # Relação: 1 filme → múltiplos históricos
}

model History {
  id        String    @id @default(uuid())
  createdAt DateTime  @default(now())
  liked     Boolean?  # Null = não classificado, True = gostou, False = não gostou
  watched   Boolean   @default(false)

  # Relação com User (Foreign Key)
  userId    String
  user      User      @relation(fields: [userId], references: [id])

  # Relação com Movie (Foreign Key)
  movieId   String
  movie     Movie     @relation(fields: [movieId], references: [id])
}
```

**Tipos de relações**:

```
1:N (Um para Muitos)
User → múltiplos History

N:M (Muitos para Muitos) - não utilizado aqui
Product ← OrderItems → Order
```

### PrismaService (Singleton Pattern)

**Arquivo**: `prisma/prisma.service.ts`

```typescript
@Injectable()
export class PrismaService 
  extends PrismaClient 
  implements OnModuleInit, OnModuleDestroy 
{
  constructor() {
    // Configura adaptador PostgreSQL
    const adapter = new PrismaPg({ 
      connectionString: process.env.DATABASE_URL 
    });
    super({ adapter });
  }

  // Chamado quando módulo é inicializado
  async onModuleInit() {
    await this.$connect();  // Conecta ao banco
  }

  // Chamado quando módulo é destruído
  async onModuleDestroy() {
    await this.$disconnect();  // Desconecta do banco
  }
}
```

**Interfaces implementadas**:

- `OnModuleInit`: Hook do NestJS executado após módulo inicializar
- `OnModuleDestroy`: Hook do NestJS executado antes de desligar módulo

### Exemplos de Operações Prisma

#### CREATE (Criar)

```typescript
// Criar usuário
const user = await this.prisma.user.create({
  data: { id: userId }
});

// UPSERT: Criar ou atualizar
const user = await this.prisma.user.upsert({
  where: { id: userId },
  update: {},                    # Se existe, não muda nada
  create: { id: userId },        # Se não existe, cria
});

// Criar com relações
const movie = await this.prisma.movie.create({
  data: {
    title: 'Avatar',
    poster: '...',
    year: '2009',
    rating: '7.8',
    director: 'James Cameron',
    runtime: '162 min',
    plot: '...',
    actors: ['Sam Worthington'],
  },
});
```

#### READ (Ler)

```typescript
// Encontrar primeiro (com Where)
const movie = await this.prisma.movie.findFirst({
  where: { title: 'Avatar' }
});

// Encontrar por ID
const user = await this.prisma.user.findUnique({
  where: { id: userId }
});

// Encontrar múltiplos
const history = await this.prisma.history.findMany({
  where: { userId },
  include: { movie: true },         # Inclui dados relacionados
  orderBy: { createdAt: 'desc' },   # Ordena por criação
});
```

#### UPDATE (Atualizar)

```typescript
const history = await this.prisma.history.update({
  where: { id: historyId, userId },  # Identifica qual registro
  data: { liked: true },              # O que atualizar
});

const history = await this.prisma.history.update({
  where: { id: historyId, userId },
  data: { watched: true },
});
```

#### DELETE (Deletar)

```typescript
const history = await this.prisma.history.delete({
  where: { id: historyId },
});
```

### Migrations

Migrations registram mudanças no schema:

```bash
# Criar migration após alterar schema.prisma
npx prisma migrate dev --name init

# Ver status de migrations
npx prisma migrate status

# Aplicar migrations em produção
npx prisma migrate deploy
```

Migrations geradas ficam em: `prisma/migrations/`

---

## 🔄 Fluxo de Requisições

### Cenário 1: Buscar Filme no OMDB

```
Cliente
   ↓
GET /omdb/search?title=Avatar
   ↓
NestJS Router
   ↓
OmdbController.search()
   ├─ @Query() extrai title
   ├─ Chama OmdbService.searchMovie('Avatar')
   │
   └─ OmdbService.searchMovie()
       ├─ Faz axios.get('omdbapi.com?t=Avatar')
       ├─ Processa resposta (pega atores, formata)
       ├─ Retorna dados formatados
       │
   ├─ Controller retorna resultado
   └─ NestJS serializa JSON
      ↓
Cliente recebe JSON formatado
```

**Código completo**:

```typescript
// Cliente
const response = await fetch('/omdb/search?title=Avatar');
const data = await response.json();

// Controller
@Get('search')
async search(@Query('title') title: string) {
  return this.omdbService.searchMovie(title);
}

// Service
async searchMovie(title: string) {
  const response = await axios.get('http://www.omdbapi.com', {
    params: { t: title, apikey: this.apikey }
  });
  const m = response.data;
  return { title: m.Title, poster: m.Poster, ... };
}
```

---

### Cenário 2: Recomendar Filme (Fluxo Completo)

```
Cliente com UserID
   ↓
POST /quiz/recommend (com AuthOptionalGuard)
{
  mood: "triste",
  duration: "longo",
  company: "sozinho",
  era: "recente",
  depth: "simples",
  origin: "qualquer",
  extra: ""
}
   ↓
AuthOptionalGuard
├─ Valida JWT com Supabase
├─ Se válido: req.user = { sub: userId }
└─ Se inválido: req.user = null
   ↓
QuizController.recommend()
├─ Recebe answers (body) e userId (do guard)
└─ Chama QuizService.recommend(answers, userId)
   │
   └─ QuizService.recommend(answers, userId)
       ├─ Se userId existe:
       │  ├─ Cria/atualiza user no BD
       │  ├─ Busca histórico do usuário
       │  └─ Extrai: seen, liked, disliked
       │
       ├─ Chama GroqService.suggestMovie(answers, { seen, liked, disliked })
       │  └─ IA retorna título (ex: "Forrest Gump")
       │
       ├─ Chama OmdbService.searchMovie("Forrest Gump")
       │  └─ Retorna: { title, poster, rating, ... }
       │
       ├─ Se userId existe:
       │  ├─ Busca filme no BD (findFirst where title)
       │  ├─ Se não existe, cria filme
       │  └─ Cria registro em History ligando User → Movie
       │
       └─ Retorna dados completos do filme
   ↓
QuizController retorna resultado
   ↓
NestJS serializa JSON
   ↓
Cliente recebe
{
  suggestedBy: "Forrest Gump",
  title: "Forrest Gump",
  poster: "...",
  rating: "8.8",
  ...
}
```

---

### Cenário 3: Marcar Filme como Gostou

```
Cliente Autenticado
   ↓
PATCH /history/abc123/like
{
  liked: true
}
   ↓
AuthGuard
├─ Obrigatoriamente valida JWT
├─ Lança 401 se inválido
└─ req.user = { sub: userId }
   ↓
HistoryController.like()
├─ @Param('id') extrai abc123
├─ @Body() extrai { liked: true }
├─ @Req() acessa req.user.sub
└─ Chama HistoryService.setLike(abc123, userId, true)
   │
   └─ HistoryService.setLike()
       └─ prisma.history.update({
            where: { id: abc123, userId },  # Garante que pertence ao usuário
            data: { liked: true }
          })
   ↓
Retorna registro atualizado
   ↓
Cliente recebe 200 OK com dados
```

**Por que `where: { id: historyId, userId }`?**

Garante que o usuário só pode atualizar seu próprio histórico! Se tentar com ID de outro usuário, Prisma lança erro.

---

## 📚 Best Practices Observadas

### 1. **Organização por Módulos**

```
✅ Cada funcionalidade em seu próprio módulo
✅ Módulos reutilizáveis (importados por outros módulos)
✅ PrismaModule centralizado (importado por vários)
❌ Não: Um único módulo gigante com tudo
```

### 2. **Separação de Responsabilidades**

```
✅ Controller: Recebe HTTP, delega para service
✅ Service: Lógica de negócio
✅ Guard: Validação de acesso
✅ Prisma: Acesso a dados
❌ Não: Controller com lógica complexa
❌ Não: Service com lógica HTTP
```

### 3. **Injeção de Dependência**

```typescript
✅ constructor(private readonly service: MyService) { }
❌ Não: const service = new MyService()
```

**Benefícios**:
- Testabilidade (injetar mocks)
- Desacoplamento
- Reutilização

### 4. **Composição de Serviços**

```typescript
✅ QuizService usa GroqService + OmdbService + PrismaService
❌ Não: QuizService fazer tudo sozinho
```

### 5. **Type Safety com TypeScript**

```typescript
✅ async recommend(answers: Record<string, string>, userId: string | null)
❌ Não: async recommend(answers, userId)

✅ @Param('id') id: string
❌ Não: @Param('id') id (sem type)
```

### 6. **Validação de Segurança**

```typescript
// Garante que usuário só acessa seu próprio histórico
where: { id: historyId, userId }

// Valida JWT antes de executar qualquer lógica
@UseGuards(AuthGuard)

// Trata erro de API externa
if (m.Response === 'False') return { error: '...' }
```

### 7. **Reutilização de Dados**

```typescript
// Não cria movie duplicada
const savedMovie = await this.prisma.movie.findFirst({
  where: { title: movie.title }
});

if (!savedMovie) {
  // Cria apenas se não existe
  savedMovie = await this.prisma.movie.create({ ... });
}
```

### 8. **Configuração via Variáveis de Ambiente**

```typescript
✅ process.env.OMDB_API_KEY
✅ process.env.GROQ_API_KEY
✅ process.env.SUPABASE_URL
❌ Não: Hardcode de URLs/keys
```

---

## 🚀 Executando o Projeto

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

Crie `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zion"
OMDB_API_KEY="seu_api_key"
GROQ_API_KEY="seu_api_key"
SUPABASE_URL="https://seu_projeto.supabase.co"
SUPABASE_SERVICE_KEY="sua_service_key"
PORT=3000
```

### Rodar em Desenvolvimento

```bash
npm run start:dev      # Recarrega automaticamente
npm run start:debug    # Com debugger
```

### Build para Produção

```bash
npm run build          # Compila TypeScript
npm run start:prod     # Executa versão compilada
```

### Testes

```bash
npm test               # Executa testes
npm test:watch        # Testes em modo watch
npm test:cov          # Coverage report
npm test:e2e          # Testes end-to-end
```

---

## 📊 Resumo da Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Frontend)                   │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP
                  ↓
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ AppModule (Raiz)                                    │ │
│ │ ├─ ConfigModule                                    │ │
│ │ ├─ PrismaModule → PostgreSQL                      │ │
│ │ ├─ OmdbModule → OMDB API                          │ │
│ │ ├─ GroqModule → Groq AI                           │ │
│ │ ├─ QuizModule (Orquestra: Groq + OMDB + Prisma) │ │
│ │ ├─ AuthModule → Supabase JWT                      │ │
│ │ └─ HistoryModule                                  │ │
│ │                                                     │ │
│ │ Guards:                                            │ │
│ │ ├─ AuthGuard (obrigatória)                       │ │
│ │ └─ AuthOptionalGuard (opcional)                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
      ↓          ↓            ↓             ↓
    PostgreSQL  OMDB API   Groq API    Supabase Auth
```

---

## 🎓 Conceitos-Chave para Lembrar

| Conceito | O que é | Exemplo |
|----------|---------|---------|
| **Decorator** | Função que modifica classe/método | `@Controller()`, `@Get()` |
| **Module** | Container de features | `OmdbModule` contém `OmdbController` |
| **Controller** | Recebe HTTP, delega | `OmdbController` recebe GET /omdb/search |
| **Service** | Lógica de negócio | `OmdbService` integra com API |
| **Provider** | Coisa injetável | Services, Guards, Pipes |
| **Guard** | Validador de acesso | `AuthGuard` valida JWT |
| **Middleware** | Processa request antes de route | CORS, logging |
| **Interceptor** | Envolve request/response | Logging, transformação |
| **Pipe** | Valida/transforma parâmetros | Validação de tipo |
| **DTO** | Classe de validação | Request body |
| **ORM** | Abstração de BD | Prisma, TypeORM |
| **Dependency Injection** | Framework injeta dependências | `constructor(private service: MyService)` |

---

## 📖 Referências e Recursos

### Documentação Oficial

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js](https://expressjs.com)

### Conceitos

- **Padrão MVC**: Model-View-Controller
- **Padrão Repository**: Abstração de acesso a dados
- **Dependency Injection**: IoC (Inversion of Control)
- **Decorators**: Metaprogramming em TypeScript

### Tecnologias Externas

- **Supabase**: Backend as a Service com autenticação
- **OMDB API**: Banco de dados de filmes
- **Groq API**: IA/ML em tempo real
- **PostgreSQL**: Banco de dados relacional

---

## ✅ Checklist de Aprendizado

Após estudar este documento, você deveria entender:

- [ ] Como NestJS estrutura aplicações em módulos
- [ ] Diferença entre Controllers e Services
- [ ] O que são decoradores e como usá-los
- [ ] Como funcionam Guards e validação
- [ ] Como usar Prisma para comunicar com banco
- [ ] Fluxo completo de uma requisição HTTP
- [ ] Injeção de Dependência em NestJS
- [ ] Como integrar APIs externas
- [ ] Segurança com autenticação JWT
- [ ] Padrões de composição e reutilização

---

**Última atualização**: 25 de Junho de 2026

**Desenvolvido para fins educacionais de NestJS** 🎓
