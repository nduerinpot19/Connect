import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/notification-bell'
import LogoutButton from '@/components/logout-button'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Trova tutti gli utenti con cui ho connessioni attive
  const { data: myThoughts } = await supabase
    .from('thoughts')
    .select('id')
    .eq('user_id', user.id)

  const myThoughtIds = (myThoughts ?? []).map(t => t.id)

  let connectedUsers: Array<{
    id: string
    username: string
    badge_level: string | null
    country: string | null
    connections_count: number
    last_message?: string
    unread_count?: number
  }> = []

  if (myThoughtIds.length > 0) {
    const orFilter = myThoughtIds
      .map(id => `thought_a_id.eq.${id},thought_b_id.eq.${id}`)
      .join(',')

    const { data: connections } = await supabase
      .from('connections')
      .select('thought_a_id, thought_b_id, thoughts!connections_thought_a_id_fkey(user_id), thoughts!connections_thought_b_id_fkey(user_id)')
      .or(orFilter)
      .eq('is_active', true)

    // Estrai utenti unici dall'altro lato delle connessioni
    const otherUserIds = new Set<string>()
    connections?.forEach((c: Record<string, unknown>) => {
      const thA = Array.isArray(c.thoughts) ? (c.thoughts as Record<string,unknown>[])[0] : c.thoughts as Record<string,unknown>
      const uid = thA?.user_id as string
      if (uid && uid !== user.id) otherUserIds.add(uid)
    })

    if (otherUserIds.size > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, badge_level, country')
        .in('id', Array.from(otherUserIds))

      // Per ogni utente, conta messaggi non letti
      const enriched = await Promise.all(
        (users ?? []).map(async (u) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('sender_id', u.id)
            .eq('receiver_id', user.id)
            .eq('is_read', false)

          const { data: lastMsg } = await supabase
            .from('chat_messages')
            .select('content')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${u.id}),and(sender_id.eq.${u.id},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...u,
            connections_count: connections?.filter((c: Record<string, unknown>) => {
              const thA = Array.isArray(c.thoughts) ? (c.thoughts as Record<string,unknown>[])[0] : c.thoughts as Record<string,unknown>
              return (thA?.user_id as string) === u.id
            }).length ?? 0,
            last_message: lastMsg?.content,
            unread_count: count ?? 0,
          }
        })
      )
      connectedUsers = enriched
    }
  }

  const BADGE_ICON: Record<string, string> = {
    connector: '🌐',
    resonator: '🎵',
    vip_luce: '✨',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/dimensions" className="text-xl font-bold text-lime-400">coNNect</Link>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user.id} />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">💬 Chat</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Disponibile solo con utenti con cui hai connessioni attive
          </p>
        </div>

        {connectedUsers.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-500">
            Nessuna connessione attiva ancora.
            <br />
            <Link href="/feed" className="mt-2 inline-block text-lime-400 hover:underline">
              Esplora il feed e crea connessioni →
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {connectedUsers.map((u) => (
            <Link
              key={u.id}
              href={`/chat/${u.id}`}
              className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 hover:border-lime-400/30 transition"
            >
              <div className="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sm font-bold text-lime-400 flex-shrink-0">
                {u.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">@{u.username}</span>
                  {u.badge_level && <span>{BADGE_ICON[u.badge_level]}</span>}
                  {u.country && <span className="text-xs text-neutral-500">{u.country}</span>}
                </div>
                {u.last_message && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {u.last_message}
                  </p>
                )}
              </div>
              {(u.unread_count ?? 0) > 0 && (
                <span className="h-5 w-5 rounded-full bg-lime-400 text-xs font-bold text-black flex items-center justify-center flex-shrink-0">
                  {u.unread_count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
