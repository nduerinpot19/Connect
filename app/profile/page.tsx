import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/logo'
import LogoutButton from '@/components/logout-button'

const BADGE_STYLES: Record<string, string> = {
  connector: 'bg-cyan-400/10 border-cyan-400/30 text-cyan-300',
  resonator: 'bg-violet-400/10 border-violet-400/30 text-violet-300',
  vip_luce: 'bg-lime-400/10 border-lime-400/30 text-lime-300',
}

const BADGE_LABELS: Record<string, string> = {
  connector: '🌐 Connector',
  resonator: '🎵 Resonator',
  vip_luce: '✨ VIP Luce',
}

const MOOD_ICON: Record<string, string> = {
  positivo: '😊',
  neutro: '😐',
  negativo: '😔',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: thoughts, count: thoughtsCount } = await supabase
    .from('thoughts')
    .select('id, content, mood, tags, created_at, is_public, connections_count, avg_connection_score, dimension_number, dimensions(icon, name)', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { count: connectionsCount } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .or(`thought_a_id.in.(${(thoughts ?? []).map(t => t.id).join(',')}),thought_b_id.in.(${(thoughts ?? []).map(t => t.id).join(',')})`)

  const avgScore = profile?.connection_score?.toFixed(1) ?? '—'

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/dimensions"><Logo size="sm" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/connections" className="text-sm text-neutral-400 hover:text-lime-400">
              ⇕ Connessioni
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Intestazione profilo */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-xl font-bold text-lime-400">
                {profile?.username?.charAt(0).toUpperCase() ?? user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  @{profile?.username ?? user.email?.split('@')[0]}
                </h1>
                <p className="text-sm text-neutral-500">{user.email}</p>
                {profile?.badge_level && (
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${BADGE_STYLES[profile.badge_level]}`}>
                    {BADGE_LABELS[profile.badge_level]}
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/onboarding"
              className="text-xs text-neutral-500 hover:text-lime-400 transition"
            >
              Come funziona?
            </Link>
          </div>

          {/* Statistiche */}
          <div className="mt-5 grid grid-cols-3 gap-3">
            <StatCard label="Pensieri" value={thoughtsCount ?? 0} />
            <StatCard label="Connessioni" value={connectionsCount ?? 0} />
            <StatCard label="Score medio" value={avgScore} />
          </div>

          {profile?.stars_received > 0 && (
            <div className="mt-3 text-xs text-neutral-500 text-center">
              ⭐ {profile.stars_received} stelle ricevute
            </div>
          )}
        </div>

        {/* Archivio pensieri */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            I miei pensieri
          </h2>
          <Link
            href="/dimensions"
            className="text-xs text-lime-400 hover:underline"
          >
            + Nuovo pensiero
          </Link>
        </div>

        {(!thoughts || thoughts.length === 0) && (
          <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
            Non hai ancora pubblicato nessun pensiero.
            <br />
            <Link href="/dimensions" className="mt-2 inline-block text-lime-400 hover:underline">
              Esplora le 93 dimensioni →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {thoughts?.map((t) => {
            const dim = Array.isArray(t.dimensions) ? t.dimensions[0] : t.dimensions
            return (
              <article
                key={t.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 hover:border-neutral-700 transition"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {dim && (
                      <span className="text-base">{dim.icon}</span>
                    )}
                    <span className="text-xs text-neutral-500">
                      {dim?.name ?? `Dimensione ${t.dimension_number}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-500">
                      {MOOD_ICON[t.mood] ?? '😐'}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${
                      t.is_public
                        ? 'border-lime-400/20 text-lime-400/60'
                        : 'border-neutral-700 text-neutral-600'
                    }`}>
                      {t.is_public ? 'pubblico' : 'privato'}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-neutral-100">{t.content}</p>

                {t.tags && t.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {t.tags.map((tag: string) => (
                      <span key={tag} className="text-xs text-lime-400/70">{tag}</span>
                    ))}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-600">
                  <span>⇕ {t.connections_count} connessioni</span>
                  {t.avg_connection_score > 0 && (
                    <span>★ {t.avg_connection_score.toFixed(1)}</span>
                  )}
                  <span className="ml-auto">
                    {new Date(t.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-800/40 p-3 text-center">
      <div className="text-xs text-neutral-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  )
}
