import { useMemo } from 'react'
import type { QrDocument } from '../types'
import { QRCodeDisplay } from '../components/QRCodeDisplay'
import { Card } from '../components/ui/Card'

interface PrintQrPageProps {
  qrPublic: QrDocument[]
}

export function PrintQrPage({ qrPublic }: PrintQrPageProps) {
  const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/q/`

  const activeQrs = useMemo(
    () => qrPublic.filter((qr) => qr.ativo),
    [qrPublic]
  )

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="section-kicker text-indigo-600">Impressão</p>
          <h1 className="heading max-[1024px]:my-5 max-[1024px]:text-4xl text-4xl font-bold text-slate-900">
            QR Codes
          </h1>
        </div>
      </header>

      <section className="print-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 print:grid-cols-[repeat(2,minmax(160px,1fr))] print:gap-4">
        {activeQrs.map((qr) => (
          <Card key={qr.id} variant="bordered" padding="md" className="print-card flex flex-col items-center">
            <QRCodeDisplay value={`${baseUrl}${qr.id}`} size={160} showValue />
            <span className="font-bold text-slate-900 mt-2">{qr.id}</span>
            <span className="text-xs text-slate-500 capitalize">{qr.tipo}</span>
          </Card>
        ))}
      </section>

      {activeQrs.length === 0 && (
        <Card padding="lg" className="text-center">
          <p className="text-slate-500">Nenhum QR code ativo para impressão.</p>
        </Card>
      )}
    </>
  )
}