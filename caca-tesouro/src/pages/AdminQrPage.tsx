import { useState } from 'react'
import { doc, writeBatch } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import type { QrDocument, FormState, AccessRecord } from '../types'
import { QrForm } from '../components/QrForm'
import { Card } from '../components/ui/Card'

interface AdminQrPageProps {
  qrPublic: QrDocument[]
  setQrPublic: React.Dispatch<React.SetStateAction<QrDocument[]>>
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}

export function AdminQrPage({ qrPublic, setQrPublic, setAccesses }: AdminQrPageProps) {
  const [notice, setNotice] = useState('')

  const handleSubmit = async (formData: FormState) => {
    const nextQr: QrDocument = {
      id: formData.id.trim() || `QR${String(qrPublic.length + 1).padStart(3, '0')}`,
      tipo: formData.tipo,
      local: formData.local,
      canalRadio: formData.tipo === 'dica' ? formData.canalRadio : undefined,
      dicaTexto: formData.tipo === 'dica' ? formData.dicaTexto : undefined,
      memeUrl: formData.tipo === 'meme' ? formData.memeUrl : undefined,
      ativo: formData.ativo,
    }

    setQrPublic((current) => [nextQr, ...current.filter((item) => item.id !== nextQr.id)])

    if (db && isFirebaseConfigured) {
      try {
        const batch = writeBatch(db)
        const qrRef = doc(db, 'qrCodes', nextQr.id)
        const publicRef = doc(db, 'qrPublic', nextQr.id)
        batch.set(qrRef, nextQr)
        batch.set(publicRef, {
          tipo: nextQr.tipo,
          canalRadio: nextQr.canalRadio,
          memeUrl: nextQr.memeUrl,
          ativo: nextQr.ativo,
        })
        await batch.commit()
      } catch {
        setNotice('Item salvo localmente. Ajuste a configuração do Firebase para persistir no banco real.')
        return
      }
    }

    if (formData.tipo === 'dica' && formData.canalRadio) {
      const access: AccessRecord = {
        id: `manual-${Date.now()}`,
        qrId: nextQr.id,
        equipeId: 'equipe-1',
        equipeNome: 'Equipe Azul',
        origem: 'manual',
        timestamp: new Date().toISOString(),
      }
      setAccesses((current) => [access, ...current])
    }

    setNotice('QR salvo com sucesso.')
  }

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="section-kicker mb-3 text-indigo-600">Configuração</p>
          <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-4xl font-bold text-slate-900">
            QR Codes
          </h1>
        </div>
      </header>

      <Card padding="lg" className="max-w-[560px] print:hidden">
        <QrForm onSubmit={handleSubmit} notice={notice} />
      </Card>
    </>
  )
}