import React, { useState } from 'react';
import { Gift, Star, Sparkles, Loader2, Tv, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { jikanService } from '../../services/jikanService';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

type MediaType = 'anime' | 'manga';
type FetchMethod = 'topRated' | 'trending' | 'popular' | 'upcoming';

interface GachaResult {
  id: number;
  title: string;
  image: string;
  score: number;
  rarity: string;
  mediaType: MediaType;
  fetchMethod: FetchMethod;
}

export function GachaRecommendation({ mediaType: propMediaType }: { mediaType?: 'anime' | 'manga' }) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GachaResult | null>(null);
  const GACHA_COST = 50;

  // Determine active media type: prefer prop, fallback to user's preference via useAuth
  const activeMediaType: MediaType = propMediaType ?? (user ? (useAuth().mediaType as 'anime' | 'manga') : 'anime');

  const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
    anime: 'Anime',
    manga: 'Manga',
  };

  const MEDIA_TYPE_ICONS = {
    anime: Tv,
    manga: BookOpen,
  };

  const fetchMethodLabels: Record<FetchMethod, string> = {
    topRated: 'Top Rated',
    trending: 'Trending',
    popular: 'Popular',
    upcoming: 'Upcoming',
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR':
        return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
      case 'SR':
        return 'text-purple-400 border-purple-400/50 bg-purple-400/10 shadow-[0_0_15px_rgba(192,132,252,0.5)]';
      case 'R':
        return 'text-blue-400 border-blue-400/50 bg-blue-400/10 shadow-[0_0_15px_rgba(96,165,250,0.4)]';
      case 'N':
        return 'text-emerald-400 border-emerald-400/50 bg-emerald-400/10';
      default:
        // 'C'
        return 'text-red-400 border-red-400/50 bg-red-400/10';
    }
  };

  const getRarityFromScore = (score: number): string => {
    if (score >= 9.0) return 'SSR';
    if (score >= 8.0) return 'SR';
    if (score >= 7.0) return 'R';
    if (score >= 6.0) return 'N';
    return 'C';
  };

  const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const pullGacha = async () => {
    if (!user || profile.availablePoints < GACHA_COST || loading) return;

    setLoading(true);
    setResult(null);

    try {
      // Deduct points
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        availablePoints: increment(-GACHA_COST),
      });

      // Media type determined by activeMediaType (prop or user preference) — NO random
      const mediaType: MediaType = activeMediaType;
      const fetchMethod: FetchMethod = pickRandom(['topRated', 'trending', 'popular', 'upcoming']);

      // Fetch data from jikanService
      let data: any[];
      switch (fetchMethod) {
        case 'topRated':
          data = await jikanService.getTopRated(mediaType);
          break;
        case 'trending':
          data = await jikanService.getTrending(mediaType);
          break;
        case 'popular':
          data = await jikanService.getPopular(mediaType);
          break;
        case 'upcoming':
          data = await jikanService.getUpcoming(mediaType);
          break;
        default:
          data = await jikanService.getTopRated(mediaType);
      }

      if (!data || data.length === 0) {
        throw new Error('Empty data from jikanService');
      }

      const pick = pickRandom(data);
      const score = typeof pick.score === 'number' ? pick.score : 0;
      const rarity = getRarityFromScore(score);
      const image =
        pick.images?.webp?.large_image_url ||
        pick.images?.webp?.image_url ||
        pick.coverImage?.large ||
        '';

      const gachaResult: GachaResult = {
        id: pick.mal_id,
        title: pick.title || 'Untitled',
        image,
        score,
        rarity,
        mediaType,
        fetchMethod,
      };

      setResult(gachaResult);

      // Add to activity feed
      await addDoc(collection(db, 'activityFeed'), {
        userId: user.uid,
        username: profile.username,
        photoURL: profile.photoURL,
        type: 'ACHIEVEMENT',
        details: `Tirou um ${rarity} ${mediaType === 'manga' ? 'de Manga' : 'de Anime'} no Gacha (${fetchMethodLabels[fetchMethod]}): ${gachaResult.title}`,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Gacha pull failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] p-6 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Gift className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
        <div className="space-y-4 max-w-sm text-center md:text-left">
          <div>
            <h3 className="text-sm font-black text-brand uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4" /> Recomendação Gacha
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Gaste PO para rolar uma recomendação aleatória. Encontre sua próxima obra favorita!
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-[var(--color-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              Custo: <span className="text-brand">{GACHA_COST} PO</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-[var(--color-bg)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              Seu Saldo:{' '}
              <span
                className={profile.availablePoints >= GACHA_COST ? 'text-emerald-400' : 'text-red-400'}
              >
                {profile.availablePoints} PO
              </span>
            </span>
          </div>

          <button
            onClick={pullGacha}
            disabled={profile.availablePoints < GACHA_COST || loading}
            className="w-full md:w-auto px-6 py-3 bg-brand text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Gift className="w-4 h-4" />
            )}
            {loading ? 'Invocando...' : 'Rolar Gacha'}
          </button>
        </div>

        <div className="w-full md:w-1/2 min-h-[160px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border w-full max-w-sm',
                  getRarityColor(result.rarity),
                )}
              >
                <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 border-2 border-current/30 shadow-inner">
                  {result.image ? (
                    <img
                      src={result.image}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg)] text-gray-500">
                      {result.mediaType === 'anime' ? (
                        <Tv className="w-8 h-8" />
                      ) : (
                        <BookOpen className="w-8 h-8" />
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-current/20 border border-current/30">
                      {result.rarity}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-[var(--color-bg)] px-2 py-0.5 rounded-full border border-[var(--color-border)] flex items-center gap-1">
                      {result.mediaType === 'anime' ? (
                        <Tv className="w-3 h-3" />
                      ) : (
                        <BookOpen className="w-3 h-3" />
                      )}
                      {MEDIA_TYPE_LABELS[result.mediaType]}
                    </span>
                  </div>

                  <Link
                    to={`/${result.mediaType}/${result.id}`}
                    className="block text-sm font-black text-white hover:underline line-clamp-2"
                  >
                    {result.title}
                  </Link>

                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <span className="bg-[var(--color-bg)] px-2 py-0.5 rounded border border-[var(--color-border)]">
                      {fetchMethodLabels[result.fetchMethod]}
                    </span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-yellow-400">{result.score.toFixed(1)}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 border-2 border-dashed border-[var(--color-border)] rounded-2xl p-8 w-full max-w-sm flex flex-col items-center justify-center gap-3"
              >
                <Star className="w-8 h-8 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Aguardando sua invocação...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
