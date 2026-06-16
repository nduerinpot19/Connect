import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-lime-400 text-black'
  if (score >= 5) return 'bg-green-500 text-white'
  if (score >= 2) return 'bg-emerald-600 text-white'
  if (score >= 0) return 'bg-neutral-600 text-white'
  if (score >= -3) return 'bg-orange-600 text-white'
  if (score >= -6) return 'bg-red-600 text-white'
  return 'bg-red-900 text-white'
}

const BADGE_ICON: Record<string, string> = {
  connector: '🌐',
  resonator: '🎵',
  vip_luce: '✨',
}

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: thoughts } = await supabase
    .from('top_thoughts_global')
    .select('*')
    .limit(50)

  const { data: topUsers } = await supabase
    .from('top_connectors')
    .select('*')
    .limit(10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dimensions" className="text-xl font-bold text-lime-400">coNNect</Link>
          <span className="text-sm text-neutral-400">🏆 Classifica Globale</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Pensieri in classifica */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🧠 Top Pensieri
              <span className="text-xs text-neutral-500 font-normal">per punteggio medio</span>
            </h2>

            {(!thoughts || thoughts.length === 0) && (
              <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
                Nessun pensiero votato ancora.
                <br />
                <Link href="/dimensions" className="text-lime-400 hover:underline mt-2 inline-block">
                  Esplora le dimensioni e inizia a votare →
                </Link>
              </div>
            )}

            <div className="space-y-3">
              {thoughts?.map((t, i) => (
                <article
                  key={t.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 transition"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-neutral-700 w-8 text-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {t.dimension_icon && (
                          <span>{t.dimension_icon}</span>
                        )}
                        <span className="text-xs text-neutral-500">{t.dimension_name}</span>
                        <span className="text-xs text-neutral-500">·</span>
                        <span className="text-xs text-lime-400">@{t.username}</span>
                        {t.badge_level && (
                          <span>{BADGE_ICON[t.badge_level]}</span>
                        )}
                        {t.country && (
                          <span className="text-xs text-neutral-600">{t.country}</span>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed text-neutral-100 mb-3">
                        {t.content}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${getScoreColor(Math.round(t.avg_rating))}`}>
                          {t.avg_rating > 0 ? '+' : ''}{Number(t.avg_rating).toFixed(1)}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {t.ratings_count} vot{t.ratings_count === 1 ? 'o' : 'i'}
                        </span>
                        <span className="text-xs text-neutral-600">
                          ⇕ {t.connections_count}
                        </span>
                        {t.tags && t.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {t.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="text-xs text-lime-400/60">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Top connectors */}
          <div>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              🌐 Top Connectors
            </h2>
            <div className="space-y-2">
              {(!topUsers || topUsers.length === 0) && (
                <div className="text-sm text-neutral-500">Ancora nessun utente con badge.</div>
              )}
              {topUsers?.map((u, i) => (
                <div
                  key={u.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-3 flex items-center gap-3"
                >
                  <span className="text-lg font-bold text-neutral-700 w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-white truncate">@{u.username}</span>
                      {u.badge_level && <span>{BADGE_ICON[u.badge_level]}</span>}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">
                      {u.countries_reached} paesi · {u.languages_reached} lingue
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-lime-400">
                      {Number(u.connection_score).toFixed(1)}
                    </div>
                    <div className="text-[10px] text-neutral-600">score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
