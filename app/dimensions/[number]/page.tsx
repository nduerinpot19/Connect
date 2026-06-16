import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NewThoughtForm from '@/components/new-thought-form'
import ConnectButton from '@/components/connect-button'
import ThoughtRating from '@/components/thought-rating'
import TranslateButton from '@/components/translate-button'

const MOOD_STYLES: Record<string, string> = {
  positivo: 'border-emerald-400/30 text-emerald-300',
  neutro: 'border-neutral-500/30 text-neutral-400',
  negativo: 'border-rose-400/30 text-rose-300',
}

const MOOD_LABELS: Record<string, string> = {
  positivo: '😊',
  neutro: '😐',
  negativo: '😔',
}

export default async function DimensionDetailPage({
  params,
}: {
  params: Promise<{ number: string }>
}) {
  const { number } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dimension } = await supabase
    .from('dimensions')
    .select('*')
    .eq('number', Number(number))
    .single()

  if (!dimension) notFound()

  const { data: thoughts } = await supabase
    .from('thoughts')
    .select('id, user_id, content, mood, tags, created_at, connections_count, avg_connection_score, avg_rating, ratings_count, users(username, badge_level, country)')
    .eq('dimension_id', dimension.id)
    .eq('is_public', true)
    .order('avg_rating', { ascending: false })
    .limit(30)

  // Recupera i voti dell'utente corrente su questi pensieri
  const thoughtIds = (thoughts ?? []).map(t => t.id)
  const { data: myRatings } = await supabase
    .from('thought_ratings')
    .select('thought_id, score')
    .eq('user_id', user.id)
    .in('thought_id', thoughtIds.length > 0 ? thoughtIds : ['00000000-0000-0000-0000-000000000000'])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link href="/dimensions" className="text-neutral-400 hover:text-white">
            ←
          </Link>
          <span className="text-2xl">{dimension.icon}</span>
          <div>
            <h1 className="text-xl font-bold">{dimension.name}</h1>
            <p className="text-xs text-neutral-500">{dimension.area}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-6">
        <NewThoughtForm
          dimensionId={dimension.id}
          dimensionNumber={dimension.number}
          dimensionName={dimension.name}
        />

        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Pensieri della comunità
          </h2>

          {(!thoughts || thoughts.length === 0) && (
            <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
              Nessun pensiero ancora in questa dimensione.
              <br />
              Sii il primo a condividere qualcosa: ogni pensiero pubblico può generare una
              connessione con qualcuno, ovunque nel mondo.
            </div>
          )}

          {thoughts?.map((t) => {
            const author = Array.isArray(t.users) ? t.users[0] : t.users
            const myRating = myRatings?.find(r => r.thought_id === t.id)?.score ?? null
            return (
              <article
                key={t.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 transition hover:border-neutral-700"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-lime-400">
                      @{author?.username ?? 'anonimo'}
                    </span>
                    {author?.badge_level && (
                      <span className="rounded-full bg-lime-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-lime-400">
                        {author.badge_level}
                      </span>
                    )}
                    {author?.country && (
                      <span className="text-xs text-neutral-500">{author.country}</span>
                    )}
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${MOOD_STYLES[t.mood] ?? MOOD_STYLES.neutro}`}
                  >
                    {MOOD_LABELS[t.mood] ?? '😐'}
                  </span>
                </div>

                <p className="text-[15px] leading-relaxed text-neutral-100">{t.content}</p>

                {t.tags && t.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t.tags.map((tag: string) => (
                      <span key={tag} className="text-xs text-lime-400/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Traduzione */}
                <TranslateButton text={t.content} />

                {/* Rating e azioni */}
                <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-neutral-500">
                  <ThoughtRating
                    thoughtId={t.id}
                    currentScore={myRating}
                    avgRating={t.avg_rating ?? 0}
                    ratingsCount={t.ratings_count ?? 0}
                    isOwnThought={t.user_id === user.id}
                  />
                  <span>⇕ {t.connections_count}</span>
                  <span className="ml-auto">
                    {new Date(t.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                  <ConnectButton
                    targetThoughtId={t.id}
                    currentUserId={user.id}
                    targetUserId={t.user_id}
                  />
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
