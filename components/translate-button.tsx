'use client'

import { useState } from 'react'

const LANGUAGES: Record<string, string> = {
  it: '🇮🇹 Italiano',
  en: '🇬🇧 English',
  es: '🇪🇸 Español',
  fr: '🇫🇷 Français',
  de: '🇩🇪 Deutsch',
  pt: '🇵🇹 Português',
  ru: '🇷🇺 Русский',
  zh: '🇨🇳 中文',
  ar: '🇸🇦 العربية',
  ja: '🇯🇵 日本語',
  ko: '🇰🇷 한국어',
  hi: '🇮🇳 हिन्दी',
  tr: '🇹🇷 Türkçe',
  pl: '🇵🇱 Polski',
  nl: '🇳🇱 Nederlands',
  uk: '🇺🇦 Українська',
  sv: '🇸🇪 Svenska',
  cs: '🇨🇿 Čeština',
  ro: '🇷🇴 Română',
  fi: '🇫🇮 Suomi',
}

export default function TranslateButton({
  text,
  sourceLang = 'auto',
}: {
  text: string
  sourceLang?: string
}) {
  const [translated, setTranslated] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedLang, setSelectedLang] = useState<string | null>(null)

  const handleTranslate = async (targetLang: string) => {
    setLoading(true)
    setShowMenu(false)
    setSelectedLang(targetLang)

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: sourceLang, target: targetLang }),
      })
      const data = await res.json()
      setTranslated(data.translatedText)
    } catch {
      setTranslated(null)
    }
    setLoading(false)
  }

  return (
    <div className="mt-2">
      {translated && (
        <div className="rounded-lg border border-lime-400/20 bg-lime-400/5 p-3 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-lime-400/70">
              Tradotto in {LANGUAGES[selectedLang!] ?? selectedLang}
            </span>
            <button
              onClick={() => { setTranslated(null); setSelectedLang(null) }}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-neutral-200 leading-relaxed">{translated}</p>
        </div>
      )}

      <div className="relative inline-block">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={loading}
          className="text-xs text-neutral-500 hover:text-lime-400 transition flex items-center gap-1"
        >
          {loading ? '⏳ Traduzione...' : '🌐 Traduci'}
        </button>

        {showMenu && (
          <div className="absolute bottom-full mb-1 left-0 z-20 rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl p-2 grid grid-cols-2 gap-1 min-w-[260px] max-h-60 overflow-y-auto">
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <button
                key={code}
                onClick={() => handleTranslate(code)}
                className="text-left rounded-lg px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 hover:text-lime-400 transition"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
