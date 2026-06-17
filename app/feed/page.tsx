import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NotificationBell from '@/components/notification-bell'
import LogoutButton from '@/components/logout-button'
import ReelFeed from '@/components/reel-feed'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Recupera i voti dell'utente (passati al client per evitare flash)
  const { data: myRatingsData } = await supabase
    .from('thought_ratings')
    .select('thought_id, score')
    .eq('user_id', user.id)

  const myRatings: Record<string, number> = {}
  myRatingsData?.forEach(r => { myRatings[r.thought_id] = r.score })

  return (
    <div className="h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
          <Link href="/dimensions" className="text-xl font-bold text-lime-400">coNNect</Link>
          <div className="flex items-center gap-4">
            <Link href="/dimensions" className="text-xs text-neutral-500 hover:text-lime-400">
              🌌 Dimensioni
            </Link>
            <Link href="/chat" className="text-xs text-neutral-500 hover:text-lime-400">
              💬 Chat
            </Link>
            <Link href="/profile" className="text-xs text-neutral-500 hover:text-lime-400">
              👤
            </Link>
            <NotificationBell userId={user.id} />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ReelFeed
          currentUserId={user.id}
          currentUserRatings={myRatings}
        />
      </div>
    </div>
  )
}
