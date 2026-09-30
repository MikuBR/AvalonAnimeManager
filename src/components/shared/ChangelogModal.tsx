import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Zap, BookOpen, Search, TrendingUp, Filter, Star } from 'lucide-react';

// ── Dados de todas as versões ──────────────────────────────────────────────
const CHANGELOG: Record<string, { version: string; items: Array<{ icon: React.ReactNode; text: string }> }> = {
  '5.0.0': {
    version: '5.0.0 — The Feature Expansion Era',
    items: [
      { icon: <Search className="text-brand shrink-0 mt-0.5"/>, text: 'Busca otimizada por tipo: animes e mangás agora carregam em rotas separadas com cache in-memory de 5 minutos — nunca mais espere pela revelação do próximo título.' },
      { icon: <TrendingUp className="text-brand shrink-0 mt-0.5"/>, text: 'Gacha de Recomendação Expandido: 5 raridades agora regem o destino — SSR (≥9.0), SR (≥8.0), R (≥7.0), N (≥6.0) e C (<6.0). O pool inclui animes e mangás de Top Rated, Trending, Popular e Upcoming.' },
      { icon: <Filter className="text-brand shrink-0 mt-0.5"/>, text: 'Lista com Filtro por Status Clicável: clique no status de qualquer linha da tabela para filtrar sua coleção por aquela categoria. Ordenação estendida para Progresso, Status e Data de Adição.' },
      { icon: <Star className="text-brand shrink-0 mt-0.5"/>, text: 'Ordenação avançada na lista: TITLE, SCORE, PROGRESS, STATUS, START DATE e UPDATED — todos com colunas clicáveis e indicadores ▼▲ visuais.' },
    ],
  },
  '4.9.0': {
    version: '4.9.0 — The Clean Slate Era',
    items: [
      { icon: <Sparkles className="text-brand shrink-0 mt-0.5"/>, text: 'Purificação Total da Loja: todos os itens da Loja de Avalon retirados temporariamente do sistema, aguardando novas decisões mecânicas.' },
      { icon: <BookOpen className="text-brand shrink-0 mt-0.5"/>, text: 'Manga Reader Robustness: buscas paralelas no MangaDex para todos os títulos conhecidos, verificando capítulos dos top 10 candidatos.' },
      { icon: <TrendingUp className="text-brand shrink-0 mt-0.5"/>, text: 'Definitive Image Loading: auto-recuperação de imagens com quíntuplo fallback (Direto + Weserv + Jetpack + Proxy Local + AllOrigins) e Eager Loading para experiência instantânea.' },
      { icon: <Zap className="text-brand shrink-0 mt-0.5"/>, text: 'Novo Tema "Invencível": tipografia brutalista, cores vibrantes (Amarelo e Azul Celeste) e banner panorâmico estilo HQ.' },
      { icon: <Star className="text-brand shrink-0 mt-0.5"/>, text: 'Content Ratings: suporte total a classificações de conteúdo ("suggestive", "erotica") na busca e no feed, permitindo leitura de obras Seinen e adultas.' },
    ],
  },
  '4.8.0': {
    version: '4.8.0 — Cosmic Cleanse & Purged Voices',
    items: [
      { icon: <TrendingUp className="text-brand shrink-0 mt-0.5"/>, text: 'Otimização de Servidores de Streaming: refinamento da seleção no Betterflix mantendo apenas fontes estáveis, reduzindo erros de carregamento.' },
      { icon: <Sparkles className="text-brand shrink-0 mt-0.5"/>, text: 'Escudo de Transmissão (Protetor de Cliques): click-shield do player garante interação infalível com o iframe, bloqueando popups e estabilizando reprodução.' },
      { icon: <BookOpen className="text-brand shrink-0 mt-0.5"/>, text: 'Novas Conquistas de Mangá: incentivos para leitores que completam 10 e 50 obras.' },
    ],
  },
};

const CURRENT_VERSION = '5.0.0';

export const ChangelogModal: React.FC = () => {
  const [visibleVersions, setVisibleVersions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Lê quais versões o usuário já viu
    const seen = localStorage.getItem('seenChangelogVersions');
    const seenArr = seen ? JSON.parse(seen) as string[] : [];

    // Versões não vistas que existem no changelog
    const unseen = Object.keys(CHANGELOG).filter(v => !seenArr.includes(v));

    if (unseen.length > 0) {
      // Ordena da mais antiga para a mais nova
      unseen.sort((a, b) => {
        const compareVersions = (x: string, y: string) => {
          const [xa, xb] = x.split('.').map(Number);
          const [ya, yb] = y.split('.').map(Number);
          if (xa !== ya) return xa - ya;
          return (xb || 0) - (yb || 0);
        };
        return compareVersions(a, b);
      });
      setVisibleVersions(unseen);
      setIsOpen(true);
    }
  }, []);

  const close = () => {
    const seen = localStorage.getItem('seenChangelogVersions');
    const seenArr = seen ? JSON.parse(seen) as string[] : [];
    const newSeen = [...seenArr, ...visibleVersions];
    localStorage.setItem('seenChangelogVersions', JSON.stringify(newSeen));
    setIsOpen(false);
  };

  if (!isOpen || visibleVersions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[var(--color-card)] border border-brand/30 rounded-[32px] p-8 max-w-xl w-full shadow-2xl shadow-brand/20 relative max-h-[85vh] overflow-y-auto"
        >
          <button onClick={close} className="absolute top-6 right-6 text-gray-500 hover:text-[var(--color-text-bright)] transition-colors z-10">
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-6 mt-2">
            <div className="w-14 h-14 bg-gradient-to-br from-brand/30 to-brand-dark/30 rounded-2xl flex items-center justify-center border border-brand/50">
              <Sparkles className="text-brand" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--color-text-bright)] uppercase italic tracking-tighter">
                O que há de novo?
              </h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic mt-1">
                Atualizações acumuladas
              </p>
            </div>
          </div>

          {visibleVersions.map(versionKey => {
            const data = CHANGELOG[versionKey];
            return (
              <div key={versionKey} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-2 w-24 rounded-full bg-gradient-to-r from-brand/40 to-brand-dark/40"/>
                  <span className="text-xs font-black uppercase tracking-widest text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
                    v{versionKey}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-bright)] font-black uppercase tracking-tighter italic mb-3">
                  {data.version}
                </p>
                <ul className="space-y-3">
                  {data.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      {item.icon}
                      <span className="text-sm text-gray-400 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <button
            onClick={close}
            className="w-full bg-brand hover:bg-brand-dark text-black font-black uppercase text-sm py-3.5 rounded-xl transition-colors mt-2 border border-brand/20 shadow-lg shadow-brand/10"
          >
            Perfeito, vou explorar!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
