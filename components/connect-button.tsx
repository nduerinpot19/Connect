'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type MyThought = {
  id: string
  content: string
  dimension_number: number | null
}

export default function ConnectButton({
  targetThoughtId,
  currentUserId,
  targetUserId,
}: {
  targetThoughtId: string
  currentUserId: string | null
  targetUserId: string | null
}) {
  const [open, setOpen] = useState(false)
  const [myThoughts, setMyThoughts] = useState<MyThought[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const isOwnThought = currentUserId === targetUserId

  const openModal = async () => {
    setOpen(true)
    setError(null)
    setSuccess(false)
    if (!currentUserId) return

    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('thoughts')
      .select('id, content, dimension_number')
      .eq('user_id', currentUserId)
      .neq('id', targetThoughtId)
      .order('created_at', { ascending: false })
      .limit(20)

    setMyThoughts(data ?? [])
    setLoading(false)
  }

  const handleConnect = async (myThoughtId: string) => {
    setLoading(true)
    setError(null)

    const res = await fetch('/api/connections/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought_a_id: myThoughtId, thought_b_id: targetThoughtId }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Errore durante la connessione')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      setOpen(false)
      router.refresh()
    }, 1200)
  }

  if (isOwnThought) return null

  return (
    <>
      <button
        onClick={openModal}
        className="rounded-full border border-lime-400/40 px-3 py-1 text-xs font-medium text-lime-400 transition hover:bg-lime-400/10"
      >
        ⇕ Connetti
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Scegli un tuo pensiero da connettere
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            {!currentUserId && (
              <p className="text-sm text-neutral-400">Devi accedere per creare connessioni.</p>
            )}

            {loading && <p className="text-sm text-neutral-500">Caricamento...</p>}

            {success && (
              <div className="rounded-lg bg-lime-400/10 border border-lime-400/30 p-3 text-sm text-lime-400">
                Connessione creata! ⇕
              </div>
            )}

            {error && (
              <div className="mb-2 rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {!loading && !success && currentUserId && myThoughts.length === 0 && (
              <p className="text-sm text-neutral-500">
                Non hai ancora pubblicato pensieri. Crea prima un pensiero per poterlo connettere
                ad altri.
              </p>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {myThoughts.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleConnect(t.id)}
                  disabled={loading}
                  className="block w-full rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-left text-sm text-neutral-200 transition hover:border-lime-400 hover:bg-neutral-800/80 disabled:opacity-50"
                >
                  {t.content.length > 100 ? t.content.slice(0, 100) + '…' : t.content}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
