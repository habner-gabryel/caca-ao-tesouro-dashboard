import type { QrDocument } from '../types'
import type { AccessRecord } from '../types'
import { Badge } from './ui/Badge'
import { Card } from './ui/Card'

export interface QrCardProps {
  qr: QrDocument
  lastAccess?: AccessRecord
}

export function QrCard({ qr, lastAccess }: QrCardProps) {
  return (
    <Card variant="bordered" padding="md" className={`border-l-6 ${lastAccess ? 'border-l-green-500' : 'border-l-slate-300'}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <Badge variant="info" size="sm">{qr.id}</Badge>
        <Badge variant={lastAccess ? 'success' : 'default'} size="sm">
          {lastAccess ? 'Acessado' : 'Aguardando'}
        </Badge>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {qr.tipo === 'dica' ? 'Dica' : 'Meme'}
      </h3>
      {lastAccess ? (
        <p className="text-slate-600">
          Equipe: <strong className="text-slate-900">{lastAccess.equipeNome}</strong>
        </p>
      ) : (
        <p className="text-slate-500">Sem acessos registrados ainda.</p>
      )}
      {lastAccess && qr.tipo === 'dica' ? (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          Transmitir no <strong>{qr.canalRadio ?? 'Canal'}</strong> para <strong>{lastAccess.equipeNome}</strong>
        </div>
      ) : null}
    </Card>
  )
}