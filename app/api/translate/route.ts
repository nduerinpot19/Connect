import { NextResponse } from 'next/server'

// LibreTranslate - API pubblica gratuita, nessun account richiesto
// Mirrors disponibili: libretranslate.com, translate.argosopentech.com
const LIBRE_TRANSLATE_URL = 'https://translate.argosopentech.com/translate'

export async function POST(request: Request) {
  const { text, source = 'auto', target } = await request.json()

  if (!text || !target) {
    return NextResponse.json({ error: 'text e target richiesti' }, { status: 400 })
  }

  // Se la lingua sorgente è già uguale al target, restituiamo il testo originale
  if (source === target) {
    return NextResponse.json({ translatedText: text })
  }

  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: 'text',
      }),
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json({ translatedText: data.translatedText })
  } catch (error) {
    // Fallback: restituiamo il testo originale se la traduzione fallisce
    console.error('Translation error:', error)
    return NextResponse.json({ translatedText: text, error: 'translation_failed' })
  }
}
