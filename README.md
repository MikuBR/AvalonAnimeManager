# 🌌 Avalon - Anime Tracking Saga (v5.0.0 - The Feature Expansion Era)

Avalon é uma plataforma otaku completa que combina rastreamento de animes e mangás com mecânicas de RPG social, gamificação (conquistas, badges equipáveis e patentes), sistema de streaks, comunidade ativa e uma interface de alta fidelidade visual — tudo envolto em uma experiência moderna, responsiva e temática.

---

## 🔮 O que há de Novo na Versão v5.0.0 (The Feature Expansion Era)

Nesta expansão, o universo Avalon transborda de novas dimensões: a busca se Fragmenta em rotas especializadas, o gacha sobe de nível com cinco faces da fortuna, sua lista ganha consciência própria através de status clicáveis e um log inicial visível documenta cada atualização que você ainda não leu.

- **🔍 Busca Otimizada por Tipo**: Pesquisa unificada agora se divide em trilhas dedicadas e otimizadas — uma para Animes e outra para Mangás — explorando cada universo com paralelismo divino. Cache in-memory de 5 minutos evita refetch desnecessário ao alternar entre tipos. Enquanto uma trilha penetra as entradas do Jikan API, outra sobe as obras do MangaDex, carregando os resultados em sincronia perfeita para que você nunca mais espere pela revelação do próximo título.

- **🎲 Gacha de Recomendação Expandido**: O sistema de classificação sofre uma evolução reminiscente de um jogo de coleção de cartas! Cinco raridades agora regem o destino da sua prática: **SSR (≥9.0)**, **SR (≥8.0)**, **R (≥7.0)**, **N (≥6.0)** e **C (<6.0)** — cada uma com coloração e aura própria (amarelo, roxo, azul, verde, vermelho). O pool de sugestões foi ampliado com sabedoria onisciente: não apenas animes Top Rated, mas também Trending, Popular e Upcoming — tanto de animes quanto de mangás — garantindo que nenhuma gema do acervo escape ao seu olhar.

- **📋 Lista com Filtro por Status Clicável e Ordenação Estendida**: Sua lista pessoal ganha um novo nível de interatividade intuitiva. Clique no status de qualquer entrada da tabela (Watching, Planning, Completed, etc.) para filtrar instantaneamente sua coleção por essa categoria — com feedback visual de anel ativo. A ordenação foi ampliada para seis eixos supremos: **Title**, **Score**, **Progress**, **Status**, **Start Date** e **Updated** — todos com colunas clicáveis e indicadores ▲▼ visuais.

- **📖 Log Inicial de Versão (Release Notes)**: Ao atualizar ou acessar o site, um modal de release notes aparece mostrando as novidades acumuladas das versões que você ainda não viu (4.8.0 → 4.9.0 → 5.0.0). Cada versão tem tagline, ícone temático e lista de mudanças. O progresso é persistido no localStorage — na próxima visita, apenas as novidades aparecem.

- **🎨 Temas Visuais com Lore Profunda**: Os três temas da loja agora carregam identidade narrativa completa: **Sakura — Primavera Eterna** (rosa pêssego e pérola, contemplativo), **Cyberpunk — Neo-Tokyo Noturno** (ciano neon sobre preto, synthwave agressivo), e **Invencível — Poder Brutalista** (amarelo solar e azul marinho, tipografia heroica). Cada tema tem tagline, origem, vibe e paleta documentadas no README e mostradas nos cards da loja.

---

## 🏠 Home & Dashboard

A página inicial é o centro de comando da sua jornada otaku.

- **Streak Tracker**: Contador de dias consecutivos com registro de presença diária. Bônus de +10 PO por dia. Alerta de streak quebrado (com opção de chamar reforços Sociais) e timer de urgência de linha de frente quando o dia está acabando.
- **Gacha de Recomendação**: Botão "Rolar Gacha" (custo: 50 PO) sorteia uma obra aleatorizada entre animes e mangás, de quatro fontes diferentes (Top Rated / Trending / Popular / Upcoming), e exibe o resultado com classificação de raridade, tipo, fonte e score.
- **Quick Stats Rotativos**: Quatro cards (Trending, Popular, Upcoming, Favorites) com títulos que giram a cada 5 segundos, puxados da Jikan API em paralelo com `Promise.allSettled`.
- **Banner Anual**: Link visual "Animes por Ano" com design cinematográfico.
- **MediaGrids**: Grades de resultados de trending e popular com cards de mídia, paginação via Jikan API.
- **Activity Feed**: Feed lateral de atividades sociais da comunidade.

---

## 🔍 Busca & Pesquisa

- **Página `/search`**: Resultados paginados da Jikan API, com filtros por tipo (Animes / Mangás / Filmes / Séries TV). Cache in-memory por `(query, page, type)` com TTL de 5 minutos. Manga usa endpoint próprio; anime/movie/tv usam o endpoint anime com filtro local.
- **Placeholder da barra**: "Pesquisar animes ou mangás..."
- **Roteamento inteligente**: Mangás redirecionam para `/manga/:id`, animes para `/anime/:id`.

---

## 📋 Minha Lista (MyList)

Tabela completa com ordenação e filtragem avançada.

- **Ordenação por coluna clicável**: Title (asc/desc), Score (asc/desc), Progress (asc/desc), Status (ordem: Watching/Reading → Planning → Completed → Dropped), Start Date (asc/desc), Updated (asc/desc). Indicadores ▲▼ mostra a coluna e direção ativa.
- **Filtro de status na tabela**: Ao clicar no STATUS de uma linha, filtra a lista para aquele status. Clique novamente remove o filtro. Anel de destaque (ring-brand) quando a linha está no filtro ativo.
- **Filtro de busca na lista**: Campo de texto para filtrar por título.
- **Toggle Anime/Manga**: Alterna a view entre animes e mangás.
- **Infinite scroll**: Carrega chunks de 50 itens ao chegar no final.
- **Sync remoto**: Botão "Sync Remoto" dispara `syncWithTrackers()`. Sync automático de PO com debounce de 5s.
- **Sorteio "Me Surpreenda!"**: Roleta com slot machine animation, filtros de vibe (Qualquer / Curtos / Relíquias / Mundiais) e détection inteligente de sequências pendentes (não sorteia Temporada 2 se Temporada 1 ainda não foi finalizada).

---

## 🎬 Detalhes do Anime (`/anime/:id`)

Página de detalhes completa com:

- **Dados da Jikan API**: Título (formatado por preference de idioma), sinopse, gêneros, score, rank, members, episódios, capítulos, volumes, temporada e ano.
- **Próximo Episódio com Contagem Regressiva**: Integração com AniList GraphQL para exibir episódio seguinte, data/hora e contagem regressiva ao vivo.
- **Status Distribution & Score Distribution**: Gráficos de distribuição de status e score da comunidade (AniList).
- **Relações**: Cards de obras relacionadas (prelículas, sequências, mangá fonte) com deep links.
- **Elenco & Batalha (Character Grid)**: Grid de personagens com avatar, nome, role e botão de "Firmar Pacto Cósmico" (Soul Pact).
- **Soul Pact Ritual**: Modal de aliança cósmica com animação de constelação estelar em SVG, três fases (aligning / syncing / weaving / success) e recompensa de +55 Otaku Points + título honorífico + badge `PACTO_<id>`. Títulos gerados dinamicamente pelo `characterVoiceEngine`.
- **Adicionar à Lista / Status na Lista**: Select de status (Watching/Planning/Completed/Dropped), star rating 1-10 obrigatório ao completar, e deep links para o player e manga reader.

---

## 📺 Reprodutor de Vídeo (`/anime/:id/watch`)

Player de streaming com proteção anti-popups e mapeamento de IDs.

- **ReactPlayer**: Reprodução de streams com autoplay, HLS, next-episode automático ao finalizar.
- **Ad-Shield (3 níveis)**: Smart Guard (recomendado — compatibilidade máxima, evita 100% dos erros 404), Strict (bloqueio agressivo), Off (nativo). Controle dinâmico a qualquer momento.
- **Anti-Click Fall-Through**: Delay de 450ms no clique de iniciar transmissão para absorver event click vazamento para o iframe.
- **Source Selector**: Seletor de fontes instaladas (Betterflix e outras extensões). Modal com lista de extensões ativas.
- **TMDB ID Mapping**: Tradução automática MAL ID → TMDB ID via `mappingService`. Mapeamento manual com overrides (TMDB ID, temporada, offset) persistidos localmente. Sintonia fina manual no player.
- **Episode List**: Grid/list view alternável, busca de episódio, botões "+ 12 Eps" e "Grade 100" para bypass de limites oficiais.
- **Server Selector**: Números de server alternáveis dentro da fonte.
- **Watchdog de failover**: Timer de 12s que tenta servidor secundário automaticamente antes de error.
- **GoAnime Terminal**: Console administrativo interno (accaparável via botão).

---

## 🎲 Gacha de Recomendação

- **Custo**: 50 PO por sorteio.
- **Pool**: Top Rated, Trending, Popular e Upcoming de animes e mangás (escolha aleatória de tipo e fonte a cada pull).
- **Raridades**: SSR (≥9.0) — amarelo; SR (≥8.0) — roxo; R (≥7.0) — azul; N (≥6.0) — verde; C (<6.0) — vermelho.
- **Resultado**: Card com imagem, tag de raridade, ícone + label de tipo (Anime/Manga), label de fonte (Top Rated / Trending / etc.), score. Ao fechar, registra atividade no feed.
- **Localização no site**: Secção na Home e também disponível na MyList.

---

## 🎨 Temas Visuais — Guia Completo

Cada tema do Avalon não é apenas uma paleta de cores — é uma identidade, uma vibração, uma narrativa que se espalha por toda a interface (banner de corpo, cores de elementos, scrollbar, sombras).

### 🌸 Tema Sakura — Primavera Eterna
**Tagline:** *"A Paz de uma Flor em Pleno Caos"*

**Origem:** A cerejeira desabrocha por apenas uma semana antes de cair — no Japão, sua brevidade simboliza a beleza efêmera do momento. Seu ar é o do silêncio antes da chuva: contemplativo, sereno, completamente no presente.

**Vibe:** Romântico e contemplativo. Tons de rosa pêssego, pérola e branco arenoso. Calmo como o ar antes de uma chuva leve, com suavidade que derrite o ruído.

**Paleta:** Rosa Sakura (`#fb7185`) → Branco Pérola (`#fff1f2`) → Borda Rosa Muted

**Ideal para:** Quem busca calma visual no meio do torneio. Um jardim sereno em cada tela.

---

### ⚡ Tema Cyberpunk — Neo-Tokyo Noturno
**Tagline:** *"Neon Sangrento em Ruínas Digitais"*

**Origem:** Neo-Tokyo à meia-noite: arranha-céus dopados por hologramas, ralos de chuva refletindo anúncios, e você no cruzamento de tudo, conectado ao fluxo de dados que pulsa sob a cidade.

**Vibe:** Urbe noturna agressiva. Ciano elétrico cortando o preto absoluto. Tecido synthwave, cyberdeck quente e a adrenalina do vazamento de informações.

**Paleta:** Ciano Neon (`#06b6d4`) → Azul Petrol (`#0891b2`) → Preto Profundo (`#030712`)

**Ideal para:** Quem vive na velocidade do futuro. Visual sintwave agressivo para conectar-se ao fluxo.

---

### 💥 Tema Invencível — Poder Brutalista
**Tagline:** *"Herói sem Medo, Herança sem Fim"*

**Origem:** Um homem com poderes godlike carregando o peso de um mundo inteiro. O invencível não é sobre nunca cair — é sobre levantar com força maior depois de cada queda. Inspiração em quadrinhos de impacto visceral.

**Vibe:** Brutalista, heroico e visceral. Amarelo solar de super-herói, azul marinho de golpe e tipografia de paneleira dinâmica. Impacto visual que marca.

**Paleta:** Amarelo Solar (`#ffee00`) → Azul Céleste (`#00aeef`) → Azul Marinho Escuro (`#002b4d`)

**Ideal para:** Quem carrega peso e não recua. Tipografia heroica para quem enfrenta o mundo.

---

*Qual tema comandará o próximo capítulo da sua saga otaku?*

---

## 🛍️ Loja & Inventário

- **Loja Cyberpunk Retro**: HUD holográfico estilo Neo-Tokyo (`[ AVALON_MARKET_v4.7 ]`), grid scanline, botões com glow néon, fundo obsidian (`#07090e`).
- **Categorias**: Cosméticos (banners temáticos), Emblemas (badges), Amplificadores (boosts de PO x2 por 24h), Blindagens (penas de streak).
- **Raridades**: Common, Rare, Epic, Legendary — cada uma com coloração e aura própria no card.
- **Inventário Decifrado**: Aba "Seu Inventário" com sistema `SYS//DECRYPTED`, separando badges, banners e boosters. Badges equipáveis (máx. 3), banners aplicados globalmente, boosters ativados com timer ao vivo.

Temas disponíveis:
- **Sakura** (RARE — 500 PO): Banner sereno de primavera com flores de cerejeira.
- **Cyberpunk** (EPIC — 1500 PO): Visual futurista de Neo-Tokyo em alta definição.
- **Invincível** (LEGENDARY — 2500 PO): Visual brutalista e heróico inspirado na saga Invincible.

---

## 🎮 Gamificação Otaku RPG

- **Sistema de Conquistas (Achievements)**: Notificações animadas que reagem dinamicamente quando você joga, assiste, avalia ou interage na comunidade. Baseado em níveis de raridade (Comum, Raro, Épico, Lendário, Divino).
- **Badges Equipáveis no Perfil**: Ganhe badges através de tarefas secretas e equipe-as na sua página de perfil para exibir o seu progresso. Cada badge mostra nome, descrição, ícone dedicado (Coroa para Lendárias, Estrela para Épicas, Troféu para Comuns).
- **Soul Pact — Pacto de Alma Cósmico**: Aliança eterna com personagens favoritos. Portal interativo com constelações estreladas, recompensa de +55 PO e título honorífico.
- **Voice Lines**: Frases de personagens icônicos faladas em japonês via Web Speech API, com legenda sincronizada (traduzido / Kana / Romaji).
- **Despertar de Aura / Nível de Ki**: 5 patamares de aura que banham o card do personagem com molduras de fótons coloridos e animações pulsantes.

---

## 💬 Comunidade & Social

- **AniChat**: Chat em tempo real com canais globais para debater obras.
- **Feed de Atividades**: Feed contínuo atualizado em tempo real exibindo conquistas coletadas pela comunidade e progresso dos amigos.
- **Perfis Públicos**: Página de perfil com banner temático, badges equipadas, stats de horas assistidas, títulos concluídos, distribuição de notas.

---

## ⚙️ Configurações

- **Tema de Cores**: Avalon Gold (padrão), Crunchyroll (laranja), Netflix (vermelho).
- **Idioma do Título**: Romaji, Inglês ou Nativo (japonês original) — aplicado em toda a UI.
- **Dark Mode**: Toggle global.
- **Tracker Sync**: Import/export AniList e MyAnimeList. Tradução de nota para smileys do AniList (😊 ≥6, 😐 =5, 😢 ≤4).
- **Player Settings**: Seletor de fontes, nível do Ad-Shield.
- **Console de Admin (CodeShell)**: `avalon.auth("avalonDev2026")` no console do navegador autentica e libera comandos: `addPoints`, `setStreak`, `addBadge`, `setRank`, `addBoost`, `status`, `clearInventory`.

---

## 📱 Install como PWA

Avalon é um **Progressive Web App**. Adicione à tela inicial do celular ou instale no computador via Chrome/Safari clicando em **"Adicionar à tela de início"** / **"Instalar App"**.

---

## 🛠️ Como Rodar Localmente

O projeto executa 100% offline usando Firebase Emulator Suite — zero custo de nuvem.

### Pré-requisitos
- **Node.js** v18+
- **Java JRE/JDK** (Firebase Emulator Suite)

### 1. Configurar ambiente
```bash
cp .env.example .env
```

### 2. Instalar dependências
```bash
npm install
npm run build
```

### 3. Executar (3 terminais)

**Terminal 1 — Firebase Emulator:**
```bash
npx firebase-tools emulators:start --only auth,firestore --config firebase.emulator.json
```

**Terminal 2 — Frontend dev:**
```bash
VITE_USE_FIREBASE_EMULATOR=true VITE_JIKAN_API_URL=https://api.jikan.moe/v4 npm run dev
```

**Terminal 3 — Seed de dados:**
```bash
VITE_USE_FIREBASE_EMULATOR=true npx tsx scripts/seed.ts
```

---

## 📚 Tech Stack

- **Frontend**: React 19, Next.js (Vite), TypeScript, Tailwind CSS v4, Framer Motion (`motion`), React Router v7
- **Estado**: Context API (Auth, Theme, Language, Profile, AnimeList, Favorites, Social) + Zustand
- **Backend**: Node.js + Express (`server.ts`) — proxy/scraper server
- **Banco**: Firebase Firestore (cloud) ou Emulator (local)
- **Auth**: Firebase Authentication (Google Sign-In + email/password)
- **APIs externas**: Jikan API (MyAnimeList v4), AniList GraphQL, MangaDex, Comick
- **Scraper services**: `jikanService`, `aniListService`, `mangaDexScrapingService`, `comickService`, `consumetService`, `kitsuService`, `mangaLivreService`, `betterflixService`, `stremioExtension`
- **Utilitários**: PapaParse (CSV), Zod (validação), date-fns, lucide-react, recharts, React Player

---

## 📜 Changelog Resumido

### v5.0.0 — The Feature Expansion Era
Busca otimizada por tipo com cache; Gacha com 5 raridades e pool expandido; Lista com filtro de status clicável e ordenação estendida (6 colunas); Log inicial de versão com release notes acumuladas; Temas com lore profunda.

### v4.9.0 — The Clean Slate Era
Purificação da loja; Manga Reader robustez (busca paralela MangaDex); Definitive Image Loading (quíntuplo fallback); Tema Invencível; Content Ratings (suggestive/erotica) na busca e feed.

### v4.8.0 — Cosmic Cleanse & Purged Voices
Otimização de servidores Betterflix; Escudo de Transmissão (click-shield); Novas conquistas de mangá (Leitor de Avião, Bibliotecário).

### v4.7.2 — CodeShell Command & Retro Cyberpunk Shop
Interface retro lo-fi cyberpunk na loja; Console administrativo CodeShell; Baú de Equipamentos Decifrado (`SYS//DECRYPTED`).

### v4.7.1 — Sovereign Marketplace & Styled Badges
Loja & Inventário Soberanos com auras por raridade; Toasts anti-iFrame com Framer Motion; Badges com cartões ricos (Coroa/Estrela/Troféu); Temporizador de Boosts.

### v4.7.0 — Soul Pact & Astral Vocalizations
Pacto de Alma Cósmico (+55 PO + título + badge); Voice Lines em japonês com legenda sincronizada; Despertar de Aura e Nível de Ki (5 patamares); Escudo anti-mistura de vozes.

### v4.6.0 — Universal Title Localization
Preferência de idioma do título (Romaji/Inglês/Nativo); propagação dinâmica em toda a UI.

### v4.5.0–v4.5.1 — Design & Manga Search
Luxury Design com paleta contrastada e transições cinéticas; Busca unificada de mangás corrigida; Placeholder "Pesquisar animes ou mangás...".

### v4.4.0 — Theme Integration
Harmonização de cores com temas dinâmicos; Cards e botões adaptáveis; Contraste aperfeiçoado.

### v4.3.0–v4.3.6 — Identity Tuning & Streaming
Sintonizador de Identidades de Mídia (TMDB ID translator); Compensador dinâmico de episódios (offset); Escudo Anti-Anúncios Smart Guard; Barra de servidores compacta; Contagem regressiva de próximo episódio (AniList + Jikan).

### v4.3.4 — Otaku Roulette
Roleta gamificada com slot machine animation; Filtros de vibe (Curtos/Relíquias/Mundiais/Qualquer); Deep links "Assistir!" / "Ler Saga!".

### v4.3.3 — Smart Discovery
Algoritmo de descoberta inteligente que evita sortear sequências/prenaltes; Fallback de resiliência.

### v4.3.2 — Sync Alignment Era
Alinhamento de IDs AniList Import (idMal unificado); Migração automática de duplicados.

### v4.3.1 — Kimetsu Resolution
Correção Kimetsu vs Arcane (ID 85937 para Demon Slayer).

### v4.2.0–v4.2.6 — Shield Era & Precision
Ad-Shield com sandbox cirúrgico; Anti-Click Fall-Through (450ms); Anti-Leak Shield; Legendary Mapping Dictionary; Year Triangulation; Instant-Load Engine v2; Dynamic Episode Paging; Failover Watchdog; Global Signal Bypass v2.

### v4.1.0 — The Precision Era
Mapeamento manual de franquias (Naruto/Bleach/DB/One Piece/HxH); Year Triangulation; Cultural Origin Filtering; Instant-Load Engine v2.

---

## 📱 Instalação como App (PWA)

O Avalon é um **Progressive Web App**. Você pode adicioná-lo à tela inicial do celular ou instalá-lo no computador através do navegador Chrome ou Safari clicando em **"Adicionar à tela de início"** / **"Instalar App"**.

---

*Avalon é desenvolvido com dedicação artística e engenharia limpa. Que sua jornada otaku seja lendária! 🌌*
