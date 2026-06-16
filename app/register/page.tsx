'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/onboarding'), 2000)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 to-neutral-900 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-lime-400">coNNect</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Crea il tuo account e inizia a connettere idee
          </p>
        </div>

        {success ? (
          <div className="rounded-lg bg-lime-400/10 border border-lime-400/30 p-4 text-center text-lime-400">
            Registrazione completata! Controlla la tua email per confermare l&apos;account.
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">
                Nome utente
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                placeholder="il_tuo_nome"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                placeholder="nome@esempio.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-300">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                placeholder="Minimo 6 caratteri"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-lime-400 px-4 py-2.5 font-semibold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {loading ? 'Registrazione...' : 'Registrati'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-400">
          Hai già un account?{' '}
          <Link href="/login" className="font-medium text-lime-400 hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
