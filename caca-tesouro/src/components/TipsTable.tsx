import { useMemo } from 'react'
import type { QrDocument, AccessRecord, Team } from '../types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { formatDateTime } from '../utils/dateFormat'

interface TipsTableProps {
  qrPublic: QrDocument[]
  accesses: AccessRecord[]
  teams: Team[]
}

export function TipsTable({ qrPublic, accesses, teams }: TipsTableProps) {
  const tableData = useMemo(() => {
    return qrPublic
      .filter((qr) => qr.tipo === 'dica')
      .map((qr) => {
        const itemAccesses = accesses.filter((a) => a.qrId === qr.id)
        const lastAccess = itemAccesses.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]

        return { qr, lastAccess, accessCount: itemAccesses.length }
      })
  }, [qrPublic, accesses])

  const getTeamName = (equipeId: string) => {
    const team = teams.find((t) => t.id === equipeId)
    return team?.nome ?? equipeId
  }

  if (tableData.length === 0) {
    return (
      <Card variant="bordered" padding="lg" className="text-center">
        <p className="text-slate-500">Nenhuma dica cadastrada.</p>
      </Card>
    )
  }

  return (
    <Card variant="bordered" padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Texto da dica</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Canal</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Local</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Equipe que encontrou</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">Horário</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tableData.map(({ qr, lastAccess, accessCount }) => (
              <tr
                key={qr.id}
                className={`transition-colors duration-300 ${
                  lastAccess
                    ? 'bg-green-50 border-l-4 border-l-green-500'
                    : 'hover:bg-slate-50'
                }`}
              >
                <td className="px-4 py-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                  <Badge variant="info" size="sm">{qr.id}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {lastAccess ? (
                    <Badge variant="success" size="sm">Acessado</Badge>
                  ) : (
                    <Badge variant="default" size="sm">Aguardando</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 max-w-xs truncate" title={qr.dicaTexto ?? ''}>
                                  {qr.dicaTexto ? (
                                    qr.dicaTexto
                                  ) : (
                                    <em className="text-slate-400">Sem texto</em>
                                  )}
                                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono">
                  {qr.canalRadio ?? '-'}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {qr.local ?? '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {lastAccess ? (
                    <span className="font-medium text-indigo-600">{getTeamName(lastAccess.equipeId)}</span>
                  ) : (
                    <span className="text-slate-400 italic">—</span>
                  )}
                  {accessCount > 1 && (
                    <span className="ml-2 text-xs text-slate-400">(+{accessCount - 1})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {lastAccess ? (
                                    <span className="font-medium text-indigo-600">{formatDateTime(lastAccess.timestamp)}</span>
                  ) : (
                    <span className="text-slate-400 italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
        Total de dicas: <span className="font-medium text-slate-700">{tableData.length}</span>{' '}
        | Acessadas: <span className="font-medium text-green-600">{tableData.filter((d) => d.lastAccess).length}</span>{' '}
        | Aguardando: <span className="font-medium text-slate-500">{tableData.filter((d) => !d.lastAccess).length}</span>
      </div>
    </Card>
  )
}