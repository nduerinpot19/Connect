import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })

  const { connection_id } = await request.json()
  if (!connection_id) return NextResponse.json({ error: 'connection_id richiesto' }, { status: 400 })

  // Verifica che l'utente sia proprietario di uno dei due pensieri
  const { data: conn } = await supabase
    .from('connections')
    .select('thought_a_id, thought_b_id')
    .eq('id', connection_id)
    .single()

  if (!conn) return NextResponse.json({ error: 'Connessione non trovata' }, { status: 404 })

  const { data: thoughtA } = await supabase
    .from('thoughts')
    .select('user_id')
    .eq('id', conn.thought_a_id)
    .single()

  const { data: thoughtB } = await supabase
    .from('thoughts')
    .select('user_id')
    .eq('id', conn.thought_b_id)
    .single()

  if (thoughtA?.user_id !== user.id && thoughtB?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 })
  }

  // Termina la connessione calcolando la durata
  await supabase.rpc('end_connection', { p_connection_id: connection_id })

  return NextResponse.json({ success: true })
}
