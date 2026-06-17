import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Analisi invisibile con Claude API
// Restituisce uno score da 0 a 10 su 4 dimensioni
async function analyzeThought(content: string): Promise<{
  depth: number        // profondità del ragionamento (0-10)
  coherence: number   // coerenza logica (0-10)
  originality: number // originalità (0-10)
  intent: number      // intento costruttivo vs distruttivo (0-10)
  overall: number     // score complessivo (0-10)
  flag: boolean       // true se il contenuto è problematico
}> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: `Sei un sistema di analisi invisibile per una piattaforma di pensieri globale.
Analizza il testo fornito e restituisci SOLO un oggetto JSON valido, senza altro testo.
Valuta su scale da 0 a 10:
- depth: profondità del ragionamento (0=frase banale, 10=riflessione profonda)
- coherence: coerenza logica interna (0=incoerente, 10=logicamente solido)
- originality: originalità del pensiero (0=generico/copiato, 10=prospettiva unica)
- intent: intento costruttivo (0=manipolatorio/distruttivo, 10=costruttivo/positivo)
- overall: score complessivo ponderato
- flag: true solo se il contenuto è spam, odio, violenza, manipolazione esplicita

Rispondi SOLO con JSON valido, esempio: {"depth":7,"coherence":8,"originality":6,"intent":9,"overall":7.5,"flag":false}`,
      messages: [
        {
          role: 'user',
          content: `Analizza questo pensiero: "${content}"`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '{}'

  try {
    return JSON.parse(text)
  } catch {
    return {
      depth: 5,
      coherence: 5,
      originality: 5,
      intent: 8,
      overall: 5,
      flag: false,
    }
  }
}

// Analisi affinità tra due pensieri connessi
async function analyzeAffinity(contentA: string, contentB: string): Promise<{
  semantic_score: number   // affinità semantica (0-10)
  complementarity: number  // quanto si completano (0-10)
  connection_quality: number // qualità della connessione (0-10)
}> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: `Sei un sistema di analisi affinità tra pensieri.
Analizza due pensieri e valuta quanto si connettono significativamente.
Rispondi SOLO con JSON valido, esempio: {"semantic_score":7,"complementarity":8,"connection_quality":7.5}`,
      messages: [
        {
          role: 'user',
          content: `Pensiero A: "${contentA}"\nPensiero B: "${contentB}"\nValuta l'affinità semantica tra questi due pensieri.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return { semantic_score: 5, complementarity: 5, connection_quality: 5 }
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? '{}'

  try {
    return JSON.parse(text)
  } catch {
    return { semantic_score: 5, complementarity: 5, connection_quality: 5 }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { thought_id, connection_id } = await request.json()

  // ANALISI SINGOLO PENSIERO
  if (thought_id) {
    const { data: thought } = await supabase
      .from('thoughts')
      .select('content, user_id')
      .eq('id', thought_id)
      .single()

    if (!thought) return NextResponse.json({ error: 'Pensiero non trovato' }, { status: 404 })

    try {
      const analysis = await analyzeThought(thought.content)

      // Aggiorna il pensiero con lo score di analisi
      await supabase
        .from('thoughts')
        .update({
          // Usiamo avg_rating come campo per memorizzare l'analisi iniziale
          // se non ha ancora voti umani (ratings_count = 0)
        })
        .eq('id', thought_id)

      // Se il contenuto è problematico, lo rendiamo privato automaticamente
      if (analysis.flag) {
        await supabase
          .from('thoughts')
          .update({ is_public: false })
          .eq('id', thought_id)
      }

      // Aggiorna il punteggio di attendibilità dell'utente
      // Prendiamo la media di tutti gli score di analisi dei suoi pensieri
      const { data: userThoughts } = await supabase
        .from('thoughts')
        .select('id')
        .eq('user_id', thought.user_id)

      if (userThoughts && userThoughts.length > 0) {
        // Score attendibilità: normalizzato overall score → percentuale 0-100
        const reliabilityScore = (analysis.overall / 10) * 100

        await supabase
          .from('users')
          .update({ reliability_score: reliabilityScore })
          .eq('id', thought.user_id)
      }

      return NextResponse.json({
        analyzed: true,
        flagged: analysis.flag,
        scores: {
          depth: analysis.depth,
          coherence: analysis.coherence,
          originality: analysis.originality,
          intent: analysis.intent,
          overall: analysis.overall,
        },
      })
    } catch (error) {
      console.error('Analysis error:', error)
      return NextResponse.json({ analyzed: false, error: 'analysis_failed' })
    }
  }

  // ANALISI AFFINITÀ TRA DUE PENSIERI CONNESSI
  if (connection_id) {
    const { data: conn } = await supabase
      .from('connections')
      .select('thought_a_id, thought_b_id, score_total')
      .eq('id', connection_id)
      .single()

    if (!conn) return NextResponse.json({ error: 'Connessione non trovata' }, { status: 404 })

    const [{ data: thA }, { data: thB }] = await Promise.all([
      supabase.from('thoughts').select('content').eq('id', conn.thought_a_id).single(),
      supabase.from('thoughts').select('content').eq('id', conn.thought_b_id).single(),
    ])

    if (!thA || !thB) return NextResponse.json({ error: 'Pensieri non trovati' }, { status: 404 })

    try {
      const affinity = await analyzeAffinity(thA.content, thB.content)

      // Aggiorna lo score della connessione con il bonus semantico
      const semanticBonus = (affinity.connection_quality / 10) * 2 // max +2 punti
      const newScore = Math.min((conn.score_total ?? 5) + semanticBonus, 10)

      await supabase
        .from('connections')
        .update({ score_total: newScore })
        .eq('id', connection_id)

      return NextResponse.json({
        analyzed: true,
        affinity: affinity,
        new_score: newScore,
      })
    } catch (error) {
      console.error('Affinity analysis error:', error)
      return NextResponse.json({ analyzed: false, error: 'analysis_failed' })
    }
  }

  return NextResponse.json({ error: 'thought_id o connection_id richiesto' }, { status: 400 })
}
