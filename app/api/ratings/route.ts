import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { thought_id, score } = await request.json()

  if (!thought_id || score === undefined) {
    return NextResponse.json({ error: 'thought_id e score richiesti' }, { status: 400 })
  }

  if (score < -8 || score > 10 || !Number.isInteger(score)) {
    return NextResponse.json({ error: 'Score deve essere un intero tra -8 e +10' }, { status: 400 })
  }

  // Verifica che l'utente non stia votando il proprio pensiero
  const { data: thought } = await supabase
    .from('thoughts')
    .select('user_id')
    .eq('id', thought_id)
    .single()

  if (thought?.user_id === user.id) {
    return NextResponse.json({ error: 'Non puoi votare i tuoi pensieri' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('thought_ratings')
    .upsert(
      { thought_id, user_id: user.id, score, updated_at: new Date().toISOString() },
      { onConflict: 'thought_id,user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ rating: data }, { status: 201 })
}
