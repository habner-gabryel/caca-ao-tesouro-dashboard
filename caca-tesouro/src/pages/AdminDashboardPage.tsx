import { useMemo } from 'react'
import type { QrDocument, AccessRecord } from '../types'
import { QrCard } from '../components/QrCard'
import { AccessList } from '../components/AccessList'

interface AdminDashboardPageProps {
  qrPublic: QrDocument[]
  accesses: AccessRecord[]
}

export function AdminDashboardPage({ qrPublic, accesses }: AdminDashboardPageProps) {
  const cards = useMemo(() => {
    return qrPublic.map((qr) => {
      const item = [...accesses]
        .filter((entry) => entry.qrId === qr.id)
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())[0]

      return { qr, lastAccess: item }
    })
  }, [accesses, qrPublic])

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="section-kicker mb-3 text-indigo-600">Visão geral</p>
          <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-4xl font-bold text-slate-900">
            Dashboard
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 print:hidden">
        {cards.map(({ qr, lastAccess }) => (
          <QrCard key={qr.id} qr={qr} lastAccess={lastAccess} />
        ))}
      </section>

      <AccessList accesses={accesses} maxItems={6} title="Últimos acessos" />
    </>
  )
}