import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/logo'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white flex flex-col">
      <header className="px-6 py-5">
        <Logo size="md" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="inline-block rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1 text-xs uppercase tracking-widest text-lime-400 mb-6">
            Benvenuto
          </span>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Ogni pensiero è un universo.
            <br />
            <span className="text-lime-400">Connettilo al mondo.</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            coNNect è la piattaforma dove i tuoi pensieri incontrano quelli di persone 
            in tutto il mondo — creando connessioni inaspettate tra idee, culture e prospettive.
          </p>
        </div>

        <div className="grid gap-4 w-full mb-10">
          <Step
            number="01"
            title="Scegli una dimensione"
            description="93 categorie tematiche — dalla Fisica alla Musica, dall'Amore alla Tecnologia. Ogni dimensione è un universo di pensieri."
            icon="🌌"
          />
          <Step
            number="02"
            title="Pubblica un pensiero"
            description="Scrivi una riflessione, una domanda, un'osservazione — max 280 caratteri. Il tuo pensiero entra in contatto con il mondo."
            icon="✍️"
          />
          <Step
            number="03"
            title="Crea connessioni"
            description="Quando un pensiero altrui risuona col tuo, connettili. Il sistema calcola un punteggio in base a distanza geografica, lingue e profondità."
            icon="⇕"
          />
          <Step
            number="04"
            title="Guadagna badge VIP"
            description="Più connessioni crei con persone in paesi e lingue diverse, più sali di livello — da Connector a Resonator fino a VIP Luce."
            icon="✨"
          />
        </div>

        <Link
          href="/dimensions"
          className="inline-block rounded-xl bg-lime-400 px-8 py-3 font-semibold text-black hover:bg-lime-300 transition"
        >
          Inizia a esplorare →
        </Link>
      </main>
    </div>
  )
}

function Step({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
      <div className="flex-shrink-0 text-2xl w-10 text-center">{icon}</div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-lime-400">{number}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
