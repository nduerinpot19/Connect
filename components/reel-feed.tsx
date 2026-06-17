'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState, useCallback } from 'react'
import ThoughtRating from '@/components/thought-rating'
import ConnectButton from '@/components/connect-button'

type Thought = {
  id: string
  user_id: string
  content: string
  mood: string
  tags: string[]
  avg_rating: number
  ratings_count: number
  connections_count: number
  avg_connection_score: number
  created_at: string
  username: string
  badge_level: string | null
  country: string | null
  language: string | null
  dimension_icon: string | null
  dimension_name: string | null
  minutes_ago?: number
  in_window?: boolean
}

const BADGE_ICON: Record<string, string> = {
  connector: '🌐',
  resonator: '🎵',
  vip_luce: '✨',
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-lime-400'
  if (score >= 5) return 'text-green-400'
  if (score >= 2) return 'text-emerald-400'
  if (score >= 0) return 'text-neutral-400'
  if (score >= -3) return 'text-orange-400'
  return 'text-red-400'
}

// Traduzione automatica
async function autoTranslate(text: string, targetLang: string): Promise<string> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source: 'auto', target: targetLang }),
    })
    const data = await res.json()
    return data.translatedText ?? text
  } catch {
    return text
  }
}

// Ottieni lingua del browser
function getBrowserLang(): string {
  const lang = navigator.language?.split('-')[0] ?? 'it'
  const supported = ['it','en','es','fr','de','pt','ru','zh','ar','ja','ko','hi','tr','pl','nl']
  return supported.includes(lang) ? lang : 'en'
}

// Timer per finestra 19 minuti
function WindowTimer({ createdAt }: { createdAt: string }) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const calc = () => {
      const elapsed = (Date.now() - new Date(createdAt).getTime()) / 1000 / 60
      const rem = 19 - elapsed
      setRemaining(rem > 0 ? rem : null)
    }
    calc()
    const interval = setInterval(calc, 10000)
    return () => clearInterval(interval)
  }, [createdAt])

  if (!remaining) return null

  const pct = (remaining / 19) * 100
  const color = pct > 50 ? 'bg-lime-400' : pct > 25 ? 'bg-amber-400' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 rounded-full bg-neutral-700 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-neutral-500">
        {Math.floor(remaining)}m {Math.round((remaining % 1) * 60)}s
      </span>
    </div>
  )
}

export default function ReelFeed({
  currentUserId,
  currentUserRatings,
}: {
  currentUserId: string
  currentUserRatings: Record<string, number>
}) {
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [current, setCurrent] = useState(0)
  const [translated, setTranslated] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const ratingsMap = useState<Record<string, number>>(currentUserRatings)[0]
  const containerRef = useRef<HTMLDivElement>(null)
  const targetLang = useRef(getBrowserLang())

  const loadThoughts = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('thoughts')
      .select(`
        id, user_id, content, mood, tags, avg_rating, ratings_count,
        connections_count, avg_connection_score, created_at,
        users(username, badge_level, country, language),
        dimensions(icon, name)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) {
      const normalized = data.map((t: Record<string, unknown>) => {
        const u = Array.isArray(t.users) ? (t.users as Record<string,unknown>[])[0] : t.users as Record<string,unknown>
        const d = Array.isArray(t.dimensions) ? (t.dimensions as Record<string,unknown>[])[0] : t.dimensions as Record<string,unknown>
        const minutesAgo = (Date.now() - new Date(t.created_at as string).getTime()) / 1000 / 60
        return {
          ...t,
          username: u?.username ?? 'anonimo',
          badge_level: u?.badge_level ?? null,
          country: u?.country ?? null,
          language: u?.language ?? null,
          dimension_icon: d?.icon ?? null,
          dimension_name: d?.name ?? null,
          minutes_ago: minutesAgo,
          in_window: minutesAgo < 19,
        } as Thought
      })
      // Mescola: priorità a pensieri nella finestra 19min, poi random
      const inWindow = normalized.filter(t => t.in_window)
      const rest = normalized.filter(t => !t.in_window).sort(() => Math.random() - 0.5)
      setThoughts([...inWindow, ...rest])
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadThoughts() }, [loadThoughts])

  // Traduzione automatica del pensiero corrente
  useEffect(() => {
    const t = thoughts[current]
    if (!t || translated[t.id]) return

    const userLang = t.language ?? 'it'
    if (userLang === targetLang.current) {
      setTranslated(prev => ({ ...prev, [t.id]: t.content }))
      return
    }

    autoTranslate(t.content, targetLang.current).then(text => {
      setTranslated(prev => ({ ...prev, [t.id]: text }))
    })
  }, [current, thoughts, translated])

  const goNext = () => setCurrent(c => Math.min(c + 1, thoughts.length - 1))
  const goPrev = () => setCurrent(c => Math.max(c - 1, 0))

  // Swipe touch
  const touchStart = useRef<number>(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientY
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientY
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Caricamento pensieri...
      </div>
    )
  }

  if (thoughts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Nessun pensiero disponibile.
      </div>
    )
  }

  const t = thoughts[current]
  const displayText = translated[t.id] ?? t.content
  const isTranslated = displayText !== t.content && translated[t.id] !== undefined
  const myRating = ratingsMap[t.id] ?? null

  return (
    <div
      ref={containerRef}
      className="relative h-full flex flex-col select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicatore progresso */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-800 z-10">
        <div
          className="h-full bg-lime-400 transition-all duration-300"
          style={{ width: `${((current + 1) / thoughts.length) * 100}%` }}
        />
      </div>

      {/* Card pensiero */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">{t.dimension_icon ?? '💭'}</span>
            <span className="text-xs text-neutral-500">{t.dimension_name}</span>
          </div>
          {t.in_window && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-lime-400 font-medium">🕐 Finestra attiva</span>
              <WindowTimer createdAt={t.created_at} />
            </div>
          )}
        </div>

        {/* Autore */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-lime-400">
            {t.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-semibold text-white">@{t.username}</span>
            {t.badge_level && <span className="ml-1">{BADGE_ICON[t.badge_level]}</span>}
            {t.country && <span className="ml-2 text-xs text-neutral-500">{t.country}</span>}
          </div>
        </div>

        {/* Testo pensiero */}
        <div className="mb-4">
          <p className="text-xl leading-relaxed text-white font-light">{displayText}</p>
          {isTranslated && (
            <p className="mt-2 text-xs text-neutral-600 italic">
              Tradotto automaticamente · Originale: &ldquo;{t.content.slice(0, 80)}{t.content.length > 80 ? '…' : ''}&rdquo;
            </p>
          )}
        </div>

        {/* Tag */}
        {t.tags && t.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {t.tags.map((tag: string) => (
              <span key={tag} className="text-xs text-lime-400/70">{tag}</span>
            ))}
          </div>
        )}

        {/* Azioni */}
        <div className="flex items-center gap-4 flex-wrap">
          <ThoughtRating
            thoughtId={t.id}
            currentScore={myRating}
            avgRating={t.avg_rating ?? 0}
            ratingsCount={t.ratings_count ?? 0}
            isOwnThought={t.user_id === currentUserId}
          />
          <ConnectButton
            targetThoughtId={t.id}
            currentUserId={currentUserId}
            targetUserId={t.user_id}
          />
          <span className={`text-sm font-semibold ${getScoreColor(Math.round(t.avg_rating ?? 0))}`}>
            {(t.avg_rating ?? 0) > 0 ? '+' : ''}{Number(t.avg_rating ?? 0).toFixed(1)}
          </span>
          <span className="text-xs text-neutral-600 ml-auto">
            {current + 1} / {thoughts.length}
          </span>
        </div>
      </div>

      {/* Navigazione */}
      <div className="flex justify-between items-center px-6 pb-8 max-w-2xl mx-auto w-full">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="rounded-full border border-neutral-700 p-3 text-neutral-400 hover:border-lime-400 hover:text-lime-400 disabled:opacity-30 transition"
        >
          ↑
        </button>
        <span className="text-xs text-neutral-600">Scorri o usa le frecce</span>
        <button
          onClick={goNext}
          disabled={current === thoughts.length - 1}
          className="rounded-full border border-neutral-700 p-3 text-neutral-400 hover:border-lime-400 hover:text-lime-400 disabled:opacity-30 transition"
        >
          ↓
        </button>
      </div>
    </div>
  )
}
