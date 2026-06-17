import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { thought_a_id, thought_b_id } = await request.json()

  if (!thought_a_id || !thought_b_id) {
    return NextResponse.json({ error: 'thought_a_id e thought_b_id richiesti' }, { status: 400 })
  }

  if (thought_a_id === thought_b_id) {
    return NextResponse.json({ error: 'Non puoi connettere un pensiero a se stesso' }, { status: 400 })
  }

  // Recupera entrambi i pensieri con utente, paese, lingua, tag
  const { data: thoughtA, error: errA } = await supabase
    .from('thoughts')
    .select('id, user_id, tags, users(country, language)')
    .eq('id', thought_a_id)
    .single()

  const { data: thoughtB, error: errB } = await supabase
    .from('thoughts')
    .select('id, user_id, tags, users(country, language)')
    .eq('id', thought_b_id)
    .single()

  if (errA || errB || !thoughtA || !thoughtB) {
    return NextResponse.json({ error: 'Pensiero non trovato' }, { status: 404 })
  }

  // Solo il proprietario di thought_a può creare la connessione (la usa per collegare il proprio pensiero a un altro)
  if (thoughtA.user_id !== user.id) {
    return NextResponse.json({ error: 'Puoi connettere solo i tuoi pensieri' }, { status: 403 })
  }

  // Evita connessioni duplicate (in entrambe le direzioni)
  const { data: existing } = await supabase
    .from('connections')
    .select('id')
    .or(
      `and(thought_a_id.eq.${thought_a_id},thought_b_id.eq.${thought_b_id}),and(thought_a_id.eq.${thought_b_id},thought_b_id.eq.${thought_a_id})`
    )
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Connessione già esistente', connection_id: existing.id }, { status: 409 })
  }

  const userA = Array.isArray(thoughtA.users) ? thoughtA.users[0] : thoughtA.users
  const userB = Array.isArray(thoughtB.users) ? thoughtB.users[0] : thoughtB.users

  const tagsA: string[] = thoughtA.tags ?? []
  const tagsB: string[] = thoughtB.tags ?? []
  const matchedTags = tagsA.filter((t) => tagsB.includes(t))

  // Crea la connessione
  const { data: connection, error: connError } = await supabase
    .from('connections')
    .insert({
      thought_a_id,
      thought_b_id,
      matched_tags: matchedTags,
      country_a: userA?.country ?? null,
      country_b: userB?.country ?? null,
      language_a: userA?.language ?? null,
      language_b: userB?.language ?? null,
    })
    .select()
    .single()

  if (connError) {
    return NextResponse.json({ error: connError.message }, { status: 500 })
  }

  // Calcola score iniziale (5.0 base finché non arrivano valutazioni)
  await supabase.rpc('calc_connection_score', { p_connection_id: connection.id })

  // Aggiorna connections_count su entrambi i pensieri
  await supabase
    .from('thoughts')
    .update({ connections_count: (await getConnectionsCount(supabase, thought_a_id)) })
    .eq('id', thought_a_id)

  await supabase
    .from('thoughts')
    .update({ connections_count: (await getConnectionsCount(supabase, thought_b_id)) })
    .eq('id', thought_b_id)

  // Aggiorna/crea riga interactions tra i due utenti e verifica unlock stella
  if (thoughtB.user_id && thoughtB.user_id !== user.id) {
    await upsertInteraction(supabase, user.id, thoughtB.user_id)
    await supabase.rpc('check_star_unlock', { p_a: user.id, p_b: thoughtB.user_id })
  }

  // Analisi affinità semantica in background — non blocca la risposta
  fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : 'http://localhost:3000'}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connection_id: connection.id }),
  }).catch(() => {}) // silenzioso

  return NextResponse.json({ connection }, { status: 201 })
}

async function getConnectionsCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  thoughtId: string
) {
  const { count } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .or(`thought_a_id.eq.${thoughtId},thought_b_id.eq.${thoughtId}`)
  return count ?? 0
}

async function upsertInteraction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userA: string,
  userB: string
) {
  const { data: existing } = await supabase
    .from('interactions')
    .select('count')
    .eq('user_a_id', userA)
    .eq('user_b_id', userB)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('interactions')
      .update({ count: existing.count + 1 })
      .eq('user_a_id', userA)
      .eq('user_b_id', userB)
  } else {
    await supabase.from('interactions').insert({ user_a_id: userA, user_b_id: userB, count: 1 })
  }
}
