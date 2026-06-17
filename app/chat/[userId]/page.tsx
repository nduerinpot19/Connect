import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ChatWindow from '@/components/chat-window'

export default async function ChatUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId: otherUserId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verifica che esista una connessione attiva tra i due utenti
  const { data: myThoughts } = await supabase
    .from('thoughts')
    .select('id')
    .eq('user_id', user.id)

  const myIds = (myThoughts ?? []).map(t => t.id)

  if (myIds.length === 0) notFound()

  const orFilter = myIds
    .map(id => `thought_a_id.eq.${id},thought_b_id.eq.${id}`)
    .join(',')

  const { data: connections } = await supabase
    .from('connections')
    .select('id, thoughts!connections_thought_a_id_fkey(user_id), thoughts!connections_thought_b_id_fkey(user_id)')
    .or(orFilter)
    .eq('is_active', true)

  // Verifica che ci sia almeno una connessione con otherUserId
  const hasConnection = connections?.some((c: Record<string, unknown>) => {
    const thA = Array.isArray(c.thoughts) ? (c.thoughts as Record<string,unknown>[])[0] : c.thoughts as Record<string,unknown>
    const uid = thA?.user_id as string
    return uid === otherUserId
  })

  if (!hasConnection) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Chat non disponibile</p>
          <p className="text-sm text-neutral-500">
            Puoi chattare solo con utenti con cui hai connessioni attive.
          </p>
        </div>
      </div>
    )
  }

  // Dati dell'altro utente
  const { data: otherUser } = await supabase
    .from('users')
    .select('username, language, badge_level, country')
    .eq('id', otherUserId)
    .single()

  if (!otherUser) notFound()

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white flex flex-col overflow-hidden">
      <ChatWindow
        currentUserId={user.id}
        otherUserId={otherUserId}
        otherUsername={otherUser.username}
        otherLang={otherUser.language}
      />
    </div>
  )
}
