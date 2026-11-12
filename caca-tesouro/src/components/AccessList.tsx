import type { AccessRecord } from '../types'

export interface AccessListProps {
  accesses: AccessRecord[]
  maxItems?: number
  title?: string
}

export function AccessList({ accesses, maxItems = 10, title = 'Últimos acessos' }: AccessListProps) {
  const sortedAccesses = [...accesses]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, maxItems)

  if (sortedAccesses.length === 0) {
    return (
      <div className="card-section p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
        <p className="text-slate-500 text-center py-4">Nenhum acesso registrado ainda.</p>
      </div>
    )
  }

  return (
    <div className="card-section p-5">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      <ul className="m-0 list-none space-y-0">
        {sortedAccesses.map((entry) => (
          <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5 border-b border-slate-100 last:border-0">
            <strong className="text-slate-900">{entry.equipeNome}</strong>
            <span className="text-slate-600 font-mono text-sm">{entry.qrId}</span>
            <small className="text-slate-500 whitespace-nowrap">
              {new Date(entry.timestamp).toLocaleString('pt-BR')}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}