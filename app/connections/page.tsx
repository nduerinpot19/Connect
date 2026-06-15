import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EvaluateConnection from '@/components/evaluate-connection'

export default async function ConnectionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // pensieri dell'utente
  const { data: myThoughts } = await supabase
    .from('thoughts')
    .select('id')
    .eq('user_id', user.id)

  const myThoughtIds = (myThoughts ?? []).map((t) => t.id)

  let connections: Array<{
    id: string
    thought_a_id: string
    thought_b_id: string
    score_total: number
    score_rating: number
    score_distance: number
    score_depth: number
    score_language: number
    matched_tags: string[]
    country_a: string | null
    country_b: string | null
    language_a: string | null
    language_b: string | null
    created_at: string
    thought_a: { content: string; users: { username: string } | { username: string }[] | null } | { content: string; users: { username: string } | { username: string }[] | null }[] | null
    thought_b: { content: string; users: { username: string } | { username: string }[] | null } | { content: string; users: { username: string } | { username: string }[] | null }[] | null
  }> = []

  if (myThoughtIds.length > 0) {
    const orFilter = myThoughtIds
      .map((id) => `thought_a_id.eq.${id},thought_b_id.eq.${id}`)
      .join(',')

    const { data } = await supabase
      .from('connections')
      .select(
        `id, thought_a_id, thought_b_id, score_total, score_rating, score_distance, score_depth, score_language, matched_tags, country_a, country_b, language_a, language_b, created_at,
         thought_a:thoughts!connections_thought_a_id_fkey(content, users(username)),
         thought_b:thoughts!connections_thought_b_id_fkey(content, users(username))`
      )
      .or(orFilter)
      .order('created_at', { ascending: false })

    connections = (data ?? []) as typeof connections
  }

  // valutazioni già date dall'utente
  const connectionIds = connections.map((c) => c.id)
  const myEvaluations = new Map<string, string>()

  if (connectionIds.length > 0) {
    const { data: evals } = await supabase
      .from('evaluations')
      .select('connection_id, value')
      .eq('user_id', user.id)
      .in('connection_id', connectionIds)

    evals?.forEach((e) => myEvaluations.set(e.connection_id, e.value))
  }

  type ThoughtRel = { content: string; users: { username: string } | { username: string }[] | null }

  const normalize = (rel: ThoughtRel | ThoughtRel[] | null): ThoughtRel | null => {
    if (!rel) return null
    return Array.isArray(rel) ? rel[0] ?? null : rel
  }

  const getName = (rel: { username: string } | { username: string }[] | null) => {
    if (!rel) return 'anonimo'
    const u = Array.isArray(rel) ? rel[0] : rel
    return u?.username ?? 'anonimo'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link href="/dimensions" className="text-neutral-400 hover:text-white">
            ←
          </Link>
          <h1 className="text-xl font-bold">⇕ Le mie connessioni</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8 space-y-4">
        {connections.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
            Non hai ancora creato connessioni. Vai in una dimensione, trova un pensiero che
            risuona con uno dei tuoi, e premi <span className="text-lime-400">⇕ Connetti</span>.
          </div>
        )}

        {connections.map((c) => (
          <article
            key={c.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                Punteggio connessione
              </span>
              <span className="rounded-full bg-lime-400/10 px-3 py-1 text-sm font-bold text-lime-400">
                ★ {c.score_total.toFixed(1)}/10
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-neutral-800 bg-neutral-800/40 p-3">
                <p className="text-xs text-neutral-500">@{getName(normalize(c.thought_a)?.users ?? null)}</p>
                <p className="mt-1 text-sm text-neutral-100">{normalize(c.thought_a)?.content}</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-800/40 p-3">
                <p className="text-xs text-neutral-500">@{getName(normalize(c.thought_b)?.users ?? null)}</p>
                <p className="mt-1 text-sm text-neutral-100">{normalize(c.thought_b)?.content}</p>
              </div>
            </div>

            {c.matched_tags && c.matched_tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-neutral-500">Tag in comune:</span>
                {c.matched_tags.map((tag) => (
                  <span key={tag} className="text-xs text-lime-400/80">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <ScoreBadge label="Rating" value={c.score_rating} />
              <ScoreBadge label="Distanza" value={c.score_distance} />
              <ScoreBadge label="Profondità" value={c.score_depth} />
              <ScoreBadge label="Lingua" value={c.score_language} />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
              <span>
                {c.country_a ?? '—'} ↔ {c.country_b ?? '—'} · {c.language_a ?? '—'} /{' '}
                {c.language_b ?? '—'}
              </span>
              <span>
                {new Date(c.created_at).toLocaleDateString('it-IT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="mt-4 border-t border-neutral-800 pt-3">
              <p className="mb-2 text-xs text-neutral-500">La tua valutazione su questa connessione:</p>
              <EvaluateConnection
                connectionId={c.id}
                myEvaluation={myEvaluations.get(c.id) ?? null}
              />
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-800/40 p-2 text-center">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-sm font-semibold text-white">{value.toFixed(1)}</div>
    </div>
  )
}
