import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  const { connection_id, value } = await request.json()

  if (!connection_id || !value) {
    return NextResponse.json({ error: 'connection_id e value richiesti' }, { status: 400 })
  }

  if (!['positiva', 'neutra', 'negativa'].includes(value)) {
    return NextResponse.json({ error: 'value deve essere positiva, neutra o negativa' }, { status: 400 })
  }

  const { data: evaluation, error } = await supabase
    .from('evaluations')
    .upsert(
      { connection_id, user_id: user.id, value },
      { onConflict: 'connection_id,user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Il trigger trg_after_evaluation ricalcola automaticamente i punteggi
  return NextResponse.json({ evaluation }, { status: 201 })
}
