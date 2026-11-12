import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center page-main p-6 bg-slate-50">
      <section className="card-section w-full max-w-[720px] p-12 px-10 text-left max-[1024px]:p-7 max-[1024px]:px-5">
        <p className="section-kicker mb-3 text-indigo-600 font-bold uppercase tracking-wide text-sm">Caça ao Tesouro</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-4xl font-bold text-slate-900 leading-tight">
          Dashboard do evento e QR público
        </h1>
        <p className="section-description text-slate-600 text-lg leading-relaxed mb-8">
          A experiência pública leva o participante ao QR e o painel administrativo acompanha os acessos em tempo real.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/q/QR001">
            <Button variant="primary" size="lg">
              Abrir QR demo
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="outline" size="lg">
              Login admin
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}