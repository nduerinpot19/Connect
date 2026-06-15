'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const MOODS = [
  { value: 'positivo', label: '😊 Positivo', color: 'border-emerald-400 bg-emerald-400/10 text-emerald-300' },
  { value: 'neutro', label: '😐 Neutro', color: 'border-neutral-400 bg-neutral-400/10 text-neutral-300' },
  { value: 'negativo', label: '😔 Negativo', color: 'border-rose-400 bg-rose-400/10 text-rose-300' },
] as const

export default function NewThoughtForm({
  dimensionId,
  dimensionNumber,
  dimensionName,
}: {
  dimensionId: string
  dimensionNumber: number
  dimensionName: string
}) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<'positivo' | 'neutro' | 'negativo'>('neutro')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const remaining = 280 - content.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Devi accedere per pubblicare un pensiero.')
      setLoading(false)
      return
    }

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))

    const { error } = await supabase.from('thoughts').insert({
      user_id: user.id,
      dimension_id: dimensionId,
      dimension_number: dimensionNumber,
      content,
      mood,
      tags: tagList,
      is_public: isPublic,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setContent('')
    setTags('')
    setMood('neutro')
    setLoading(false)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-400">
          Nuovo pensiero in <span className="text-lime-400">{dimensionName}</span>
        </span>
        <span className={`text-xs ${remaining < 0 ? 'text-rose-400' : 'text-neutral-500'}`}>
          {remaining} caratteri
        </span>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        rows={4}
        required
        placeholder="Condividi un pensiero, una domanda, una riflessione... qualcuno nel mondo potrebbe avere qualcosa di sorprendente in risposta."
        className="w-full resize-none rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                mood === m.value ? m.color : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="tag1, tag2, tag3"
          className="flex-1 min-w-[140px] rounded-full border border-neutral-700 bg-neutral-800 px-4 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-lime-400"
        />

        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-lime-400 focus:ring-lime-400"
          />
          Pubblico
        </label>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || content.length === 0 || remaining < 0}
        className="mt-4 w-full rounded-xl bg-lime-400 px-4 py-2.5 font-semibold text-black transition hover:bg-lime-300 disabled:opacity-50"
      >
        {loading ? 'Pubblicazione...' : 'Connetti questo pensiero'}
      </button>
    </form>
  )
}
