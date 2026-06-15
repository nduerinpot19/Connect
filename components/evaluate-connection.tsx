'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const OPTIONS = [
  { value: 'positiva', label: '👍 Positiva', color: 'border-emerald-400 bg-emerald-400/10 text-emerald-300' },
  { value: 'neutra', label: '😐 Neutra', color: 'border-neutral-400 bg-neutral-400/10 text-neutral-300' },
  { value: 'negativa', label: '👎 Negativa', color: 'border-rose-400 bg-rose-400/10 text-rose-300' },
] as const

export default function EvaluateConnection({
  connectionId,
  myEvaluation,
}: {
  connectionId: string
  myEvaluation: string | null
}) {
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(myEvaluation)
  const router = useRouter()

  const handleEvaluate = async (value: string) => {
    setLoading(true)
    const res = await fetch('/api/connections/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId, value }),
    })
    if (res.ok) {
      setCurrent(value)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleEvaluate(opt.value)}
          disabled={loading}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
            current === opt.value ? opt.color : 'border-neutral-700 text-neutral-500 hover:text-neutral-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
