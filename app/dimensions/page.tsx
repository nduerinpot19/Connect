import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/logout-button'

const AREA_COLORS: Record<string, string> = {
  'Scienze & Natura': 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
  'Economia & Societa': 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
  'Arte & Cultura': 'from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-500/30',
  'Mente & Spirito': 'from-violet-500/20 to-violet-500/5 border-violet-500/30',
  'Vita & Relazioni': 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
  'Natura & Corpo': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  'Futuro & Innovazione': 'from-lime-500/20 to-lime-500/5 border-lime-500/30',
  'Extra': 'from-neutral-500/20 to-neutral-500/5 border-neutral-500/30',
}

export default async function DimensionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dimensions } = await supabase
    .from('dimensions')
    .select('*')
    .order('number')

  type Dimension = NonNullable<typeof dimensions>[number]

  const grouped = (dimensions ?? []).reduce((acc: Record<string, Dimension[]>, dim) => {
    if (!acc[dim.area]) acc[dim.area] = []
    acc[dim.area].push(dim)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 to-neutral-900 text-white">
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight text-lime-400">coNNect</h1>
          <div className="flex items-center gap-4">
            <Link href="/connections" className="text-sm text-neutral-400 hover:text-lime-400">
              ⇕ Le mie connessioni
            </Link>
            <span className="text-sm text-neutral-400">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Le 93 Dimensioni</h2>
          <p className="mt-2 text-neutral-400">
            Scegli una dimensione per esplorare pensieri e creare nuove connessioni
          </p>
        </div>

        {Object.entries(grouped).map(([area, dims]) => (
          <section key={area} className="mb-10">
            <h3 className="mb-4 text-lg font-semibold text-neutral-300">{area}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {dims?.map((dim) => (
                <a
                  key={dim.id}
                  href={`/dimensions/${dim.number}`}
                  className={`group rounded-xl border bg-gradient-to-br ${AREA_COLORS[area] ?? AREA_COLORS['Extra']} p-4 transition hover:scale-[1.03] hover:shadow-lg`}
                >
                  <div className="text-3xl">{dim.icon}</div>
                  <div className="mt-2 text-sm font-medium text-white">{dim.name}</div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
