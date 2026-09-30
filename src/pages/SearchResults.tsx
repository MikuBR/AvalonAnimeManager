import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { jikanService, JikanAnime } from '../services/jikanService';
import { Search, Loader2, Play, Star, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function SearchResults() {
  const { formatTitle } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // ── State separado por tipo ──────────────────────────────────────────
  const [animeResults, setAnimeResults] = useState<JikanAnime[]>([]);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeTotalPages, setAnimeTotalPages] = useState(1);

  const [mangaResults, setMangaResults] = useState<JikanAnime[]>([]);
  const [mangaLoading, setMangaLoading] = useState(false);
  const [mangaTotalPages, setMangaTotalPages] = useState(1);

  const [filterType, setFilterType] = useState('anime');
  const [error, setError] = useState<string | null>(null);

  // ── Cache in-memory (evita refetch quando se alterna entre tipos) ───
  const cacheRef = useRef<Map<string, { data: JikanAnime[]; totalPages: number; timestamp: number }>>(new Map());

  const getCached = useCallback((q: string, page: number, type: string) => {
    const key = `${q}:${page}:${type}`;
    const entry = cacheRef.current.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry;
    cacheRef.current.delete(key); // stale entry
    return null;
  }, []);

  const setCached = useCallback((q: string, page: number, type: string, data: JikanAnime[], totalPages: number) => {
    cacheRef.current.set(`${q}:${page}:${type}`, { data, totalPages, timestamp: Date.now() });
  }, []);

  // ── Função de busca genérica (cache-aware, type-aware) ───────────────
  const fetchMedia = useCallback(async (
    type: string,
    q: string,
    page: number,
    setResults: React.Dispatch<React.SetStateAction<JikanAnime[]>>,
    setTotalPages: React.Dispatch<React.SetStateAction<number>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!q) {
      setResults([]);
      setTotalPages(1);
      return;
    }

    // Hit de cache → não refetches
    const cached = getCached(q, page, type);
    if (cached) {
      setResults(cached.data);
      setTotalPages(cached.totalPages);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 'movie' e 'tv' são sub-filtros do endpoint anime; 'manga' usa endpoint próprio
      const isManga = type === 'manga';
      const apiType: 'anime' | 'manga' = isManga ? 'manga' : 'anime';

      const json = await jikanService.search(q, apiType, page);
      let data = json.data || [];

      // Filtro local para movie/TV (jikanService.search já filtra animes por tipo,
      // mas movie/TV precisam de um narrow adicional aqui)
      if (!isManga && type !== 'anime') {
        const target = type === 'movie' ? 'movie' : 'tv';
        data = data.filter((item: any) => item.type?.toLowerCase() === target);
      }

      // Deduplica por mal_id
      const unique: JikanAnime[] = [];
      const seen = new Set<number>();
      for (const item of data) {
        if (!seen.has(item.mal_id)) {
          unique.push(item);
          seen.add(item.mal_id);
        }
      }

      setResults(unique);
      const lastPage = json.pagination?.last_visible_page || 1;
      setTotalPages(lastPage);
      setCached(q, page, type, unique, lastPage);
    } catch (err) {
      console.error(`Search error [${type}]:`, err);
      setError('Erro ao buscar resultados. Tente novamente.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [getCached, setCached]);

  // ── Fetch para o tipo atual (escolhe endpoint e estado alvo) ─────────
  const fetchForCurrentType = useCallback(() => {
    if (filterType === 'manga') {
      fetchMedia('manga', query, pageParam, setMangaResults, setMangaTotalPages, setMangaLoading);
    } else {
      // anime | movie | tv → todos usam o endpoint anime do Jikan
      fetchMedia(filterType, query, pageParam, setAnimeResults, setAnimeTotalPages, setAnimeLoading);
    }
  }, [filterType, query, pageParam, fetchMedia]);

  // ── Efeito principal: reage a query, filterType e page ───────────────
  useEffect(() => {
    if (!query) {
      setAnimeResults([]);
      setMangaResults([]);
      setAnimeTotalPages(1);
      setMangaTotalPages(1);
      setError(null);
      return;
    }
    fetchForCurrentType();
  }, [query, filterType, pageParam, fetchForCurrentType]);

  // ── Paginação (só afeta o tipo ativo) ────────────────────────────────
  const handlePageChange = (newPage: number) => {
    const totalPages = filterType === 'manga' ? mangaTotalPages : animeTotalPages;
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ q: query, page: newPage.toString() });
  };

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', '1');
      return next;
    });
  };

  // ── Resolve o conjunto de resultados visível ─────────────────────────
  const isMangaView = filterType === 'manga';
  const currentResults = isMangaView ? mangaResults : animeResults;
  const currentLoading = isMangaView ? mangaLoading : animeLoading;
  const currentTotalPages = isMangaView ? mangaTotalPages : animeTotalPages;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-text-bright)] uppercase italic tracking-tighter flex items-center gap-3">
            <Search className="w-8 h-8 text-brand" />
            Resultados da Busca
          </h1>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-2">
            Mostrando resultados para <span className="text-brand">"{query}"</span>
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm self-stretch md:self-auto overflow-x-auto">
          {['anime', 'manga', 'movie', 'tv'].map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterType === type
                  ? 'bg-brand text-white shadow-md'
                  : 'text-gray-500 hover:text-[var(--color-text-bright)] hover:bg-[var(--color-bg)]'
              }`}
            >
              {type === 'anime' ? 'Animes' : type === 'manga' ? 'Mangás' : type === 'movie' ? 'Filmes' : 'Séries (TV)'}
            </button>
          ))}
        </div>
      </div>

      {currentLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="w-10 h-10 text-brand animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Buscando na base de dados...</p>
        </div>
      ) : currentResults.length === 0 && !currentLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-3xl">
          <Search className="w-16 h-16 text-gray-400" />
          <div className="text-center">
            <h3 className="text-lg font-black text-[var(--color-text-bright)] uppercase tracking-tight">Nenhum resultado</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Nenhuma obra encontrada para "{query}".</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {currentResults.map((item, idx) => {
              const itemYear = item.year || (item as any).published?.prop?.from?.year;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.mal_id}
                >
                  <Link to={`/${isMangaView ? 'manga' : 'anime'}/${item.mal_id}`} className="group flex flex-col gap-3">
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)]/50">
                      <img
                        src={item.images?.webp?.large_image_url || item.images?.webp?.image_url || 'https://via.placeholder.com/225x350'}
                        alt={formatTitle(item)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-brand/90 backdrop-blur-md flex items-center justify-center text-white scale-50 group-hover:scale-100 transition-transform duration-300 shadow-xl shadow-brand/30">
                          {isMangaView ? <BookOpen className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </div>
                      </div>

                      <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <span className="bg-black/80 backdrop-blur-md text-brand px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg border border-white/10">
                          <Star className="w-3 h-3 fill-current" />
                          {item.score || 'N/A'}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="bg-black/80 backdrop-blur-md text-white px-2 py-1 flex items-center justify-center rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/10 truncate">
                          {item.type || (isMangaView ? 'Manga' : 'TV')} {itemYear && `• ${itemYear}`}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-[12px] text-[var(--color-text-bright)] leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-brand transition-colors">
                        {formatTitle(item)}
                      </h3>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          {currentTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => handlePageChange(pageParam - 1)}
                disabled={pageParam === 1}
                className="px-4 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-bright)] hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                Anterior
              </button>

              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand">
                Página {pageParam} de {currentTotalPages}
              </div>

              <button
                onClick={() => handlePageChange(pageParam + 1)}
                disabled={pageParam === currentTotalPages}
                className="px-4 py-2 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] text-[10px] font-black uppercase tracking-widest text-[var(--color-text-bright)] hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
