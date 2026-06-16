'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  new_connection: '⇕',
  new_rating: '★',
  new_comment: '💬',
  badge_earned: '✨',
  star_received: '⭐',
  mention: '@',
}

export default function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    const supabase = createClient()

    // Carica notifiche iniziali
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setNotifications(data ?? []))

    // Sottoscrizione realtime
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [] }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead() }}
        className="relative text-neutral-400 hover:text-lime-400 transition"
        aria-label="Notifiche"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-lime-400 text-[10px] font-bold text-black flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
            <h3 className="text-sm font-semibold text-white">Notifiche</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-neutral-500 hover:text-lime-400"
              >
                Segna tutte come lette
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-800">
            {notifications.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-neutral-500">
                Nessuna notifica
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 hover:bg-neutral-800 transition ${
                  !n.is_read ? 'bg-neutral-800/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0">{TYPE_ICON[n.type] ?? '📣'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                    {n.body && (
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-neutral-600 mt-1">
                      {new Date(n.created_at).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="h-2 w-2 rounded-full bg-lime-400 flex-shrink-0 mt-1" />
                  )}
                </div>
                {n.link && (
                  <Link
                    href={n.link}
                    className="mt-1 text-[10px] text-lime-400/70 hover:text-lime-400"
                    onClick={() => setOpen(false)}
                  >
                    Vai →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
