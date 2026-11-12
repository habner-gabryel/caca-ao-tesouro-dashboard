import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addDoc, collection } from 'firebase/firestore'
import { db, isFirebaseConfigured } from '../firebase'
import type { QrDocument, Team, AccessRecord } from '../types'
import { TeamSelect } from '../components/TeamSelect'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

interface PublicQrPageProps {
  qrPublic: QrDocument[]
  teams: Team[]
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}

export function PublicQrPage({ qrPublic, teams, setAccesses }: PublicQrPageProps) {
  const { qrId = '' } = useParams()
  const [selectedTeam, setSelectedTeam] = useState('')
  const [registered, setRegistered] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const qr = useMemo(
    () => qrPublic.find((item) => item.id === qrId && item.ativo),
    [qrId, qrPublic],
  )

  const handleRegister = async () => {
    if (!selectedTeam || !qr) {
      setErrorMessage('Selecione uma equipe válida para continuar.')
      return
    }

    const team = teams.find((item) => item.id === selectedTeam)
    if (!team) {
      setErrorMessage('Equipe não encontrada.')
      return
    }

    const access: AccessRecord = {
      id: `acc-${Date.now()}`,
      qrId: qr.id,
      equipeId: team.id,
      equipeNome: team.nome,
      origem: 'qr',
      timestamp: new Date().toISOString(),
    }

    setAccesses((current) => [access, ...current])

    if (db && isFirebaseConfigured) {
      try {
        await addDoc(collection(db, 'acessos'), {
          qrId: access.qrId,
          equipeId: access.equipeId,
          equipeNome: access.equipeNome,
          origem: access.origem,
          timestamp: new Date(),
        })
      } catch {
        setErrorMessage('Acesso registrado localmente, mas a sincronização com o Firebase falhou.')
      }
    }

    setRegistered(true)
    setErrorMessage('')
  }

  if (!qr) {
    return (
      <main className="flex min-h-screen items-center justify-center page p-6 bg-slate-50">
        <Card padding="lg" className="w-full max-w-[420px] text-center">
          <p className="section-kicker mb-3 text-red-600">QR inválido</p>
          <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-3xl font-bold text-slate-900">
            Este código não está ativo.
          </h1>
          <p className="text-slate-600">Verifique o QR ou solicite nova etapa ao organizador.</p>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center page p-6 bg-slate-50">
      <Card padding="lg" className="w-full max-w-[420px]">
        <p className="section-kicker mb-3 text-indigo-600">Caça ao Tesouro</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-3xl font-bold text-slate-900">
          {qr.id}
        </h1>

        {!registered ? (
          <>
            <TeamSelect
              teams={teams}
              value={selectedTeam}
              onChange={setSelectedTeam}
              error={errorMessage}
            />

            <Button
              type="button"
              fullWidth
              size="lg"
              className="mt-5"
              onClick={handleRegister}
              disabled={!selectedTeam}
            >
              Confirmar participação
            </Button>

            {errorMessage && <p className="error-text text-center mt-3" role="alert">{errorMessage}</p>}
          </>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <p className="success-text text-center text-lg font-medium">Acesso confirmado.</p>
            {qr.tipo === 'dica' ? (
              <div className="card-section p-4 text-center">
                <p className="font-bold text-slate-900 mb-2">Sintonize o canal de rádio:</p>
                <div className="text-2xl font-mono font-bold text-indigo-600">
                  {qr.canalRadio ?? 'Canal informado'}
                </div>
              </div>
            ) : (
              <div className="card-section p-4">
                <p className="font-bold text-slate-900 mb-3">Meme liberado:</p>
                {qr.memeUrl ? (
                  <img
                    src={qr.memeUrl}
                    alt="Meme da pista"
                    className="block max-h-[300px] w-full rounded-2xl object-cover shadow-sm"
                  />
                ) : (
                  <p className="text-slate-500 text-center py-8">Imagem não disponível no momento.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </main>
  )
}