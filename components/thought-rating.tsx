'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Colori basati sul valore del punteggio
function getScoreColor(score: number): string {
  if (score >= 8) return 'bg-lime-400 text-black'
  if (score >= 5) return 'bg-green-500 text-white'
  if (score >= 2) return 'bg-emerald-600 text-white'
  if (score >= 0) return 'bg-neutral-600 text-white'
  if (score >= -3) return 'bg-orange-600 text-white'
  if (score >= -6) return 'bg-red-600 text-white'
  return 'bg-red-900 text-white'
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Straordinario'
  if (score >= 5) return 'Molto positivo'
  if (score >= 2) return 'Positivo'
  if (score >= 0) return 'Neutro'
  if (score >= -3) return 'Negativo'
  if (score >= -6) return 'Molto negativo'
  return 'Irrilevante'
}

const SCORES = [10, 8, 6, 4, 2, 0, -2, -4, -6, -8]

export default function ThoughtRating({
  thoughtId,
  currentScore,
  avgRating,
  ratingsCount,
  isOwnThought,
}: {
  thoughtId: string
  currentScore: number | null
  avgRating: number
  ratingsCount: number
  isOwnThought: boolean
}) {
  const [selected, setSelected] = useState<number | null>(currentScore)
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const router = useRouter()

  const handleRate = async (score: number) => {
    if (isOwnThought || loading) return
    setLoading(true)

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thought_id: thoughtId, score }),
    })

    if (res.ok) {
      setSelected(score)
      setShowPicker(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Media voti */}
      {ratingsCount > 0 && (
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getScoreColor(Math.round(avgRating))}`}>
          {avgRating > 0 ? '+' : ''}{avgRating.toFixed(1)}
          <span className="ml-1 opacity-70">({ratingsCount})</span>
        </span>
      )}

      {/* Voto dell'utente corrente */}
      {!isOwnThought && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            disabled={loading}
            className={`rounded-full border px-3 py-0.5 text-xs font-medium transition ${
              selected !== null
                ? getScoreColor(selected)
                : 'border-neutral-700 text-neutral-400 hover:border-lime-400 hover:text-lime-400'
            }`}
          >
            {selected !== null
              ? `Il tuo voto: ${selected > 0 ? '+' : ''}${selected}`
              : '★ Vota'}
          </button>

          {showPicker && (
            <div className="absolute bottom-full mb-2 left-0 z-20 rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-2xl min-w-[200px]">
              <p className="text-xs text-neutral-500 mb-2">Quanto vale questo pensiero?</p>
              <div className="grid grid-cols-5 gap-1">
                {SCORES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleRate(s)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition hover:scale-110 ${getScoreColor(s)} ${
                      selected === s ? 'ring-2 ring-white scale-110' : ''
                    }`}
                  >
                    {s > 0 ? '+' : ''}{s}
                  </button>
                ))}
              </div>
              {selected !== null && (
                <p className="mt-2 text-xs text-center text-neutral-400">
                  {getScoreLabel(selected)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
