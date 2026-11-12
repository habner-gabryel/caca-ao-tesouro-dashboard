import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, type User } from 'firebase/auth'
import { addDoc, collection, doc, writeBatch } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './firebase'
import {
  initialAccesses,
  initialQrPublic,
  initialTeams,
  type AccessRecord,
  type QrDocument,
  type Team,
} from './mockData'

type FormState = {
  id: string
  tipo: 'dica' | 'meme'
  local: string
  canalRadio: string
  dicaTexto: string
  memeUrl: string
  ativo: boolean
}

const defaultForm: FormState = {
  id: 'QR004',
  tipo: 'dica',
  local: 'Pátio',
  canalRadio: 'Canal 3',
  dicaTexto: 'A pista está no ponto mais alto da área central.',
  memeUrl: '',
  ativo: true,
}

function App() {
  const [qrPublic, setQrPublic] = useState<QrDocument[]>(initialQrPublic)
  const [accesses, setAccesses] = useState<AccessRecord[]>(initialAccesses)

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/q/:qrId"
        element={<PublicQrPage qrPublic={qrPublic} teams={initialTeams} setAccesses={setAccesses} />}
      />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/*"
        element={<AdminApp qrPublic={qrPublic} setQrPublic={setQrPublic} accesses={accesses} setAccesses={setAccesses} />}
      />
    </Routes>
  )
}

function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center page-main p-6">
      <section className="card-section w-full max-w-[720px] p-12 px-10 text-left max-[1024px]:p-7 max-[1024px]:px-5">
        <p className="section-kicker mb-3">Caça ao Tesouro</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl">
          Dashboard do evento e QR público
        </h1>
        <p className="section-description">
          A experiência pública leva o participante ao QR e o painel administrativo acompanha os acessos em tempo real.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/q/QR001" className="btn-primary">
            Abrir QR demo
          </Link>
          <Link to="/admin/login" className="btn-nav">
            Login admin
          </Link>
        </div>
      </section>
    </main>
  )
}

function PublicQrPage({
  qrPublic,
  teams,
  setAccesses,
}: {
  qrPublic: QrDocument[]
  teams: Team[]
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}) {
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
      <main className="flex min-h-screen items-center justify-center page p-6">
        <section className="card-section w-full max-w-[420px] p-7 px-6 text-center">
          <p className="section-kicker mb-3">QR inválido</p>
          <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl">
            Este código não está ativo.
          </h1>
          <p>Verifique o QR ou solicite nova etapa ao organizador.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center page p-6">
      <section className="card-section w-full max-w-[420px] p-7 px-6 text-left">
        <p className="section-kicker mb-3">Caça ao Tesouro</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl">
          {qr.id}
        </h1>

        {!registered ? (
          <>
            <label className="label-field" htmlFor="team-select">
              Selecione sua equipe
            </label>
            <select
              id="team-select"
              className="input-field"
              value={selectedTeam}
              onChange={(event) => setSelectedTeam(event.target.value)}
            >
              <option value="">Escolha uma equipe</option>
              {teams
                .filter((team) => team.ativo)
                .map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
            </select>

            <button
              type="button"
              className="mt-5 btn-primary w-full"
              onClick={handleRegister}
            >
              Confirmar participação
            </button>

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          </>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <p className="success-text">Acesso confirmado.</p>
            {qr.tipo === 'dica' ? (
              <>
                <p className="font-bold">Sintonize o canal de rádio:</p>
                <strong>{qr.canalRadio ?? 'Canal informado'}</strong>
              </>
            ) : (
              <>
                <p className="font-bold">Meme liberado:</p>
                {qr.memeUrl ? (
                  <img
                    src={qr.memeUrl}
                    alt="Meme da pista"
                    className="block max-h-[300px] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <p>Imagem não disponível no momento.</p>
                )}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@demo.local')
  const [password, setPassword] = useState('123456')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!auth) {
      navigate('/admin', { replace: true })
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin', { replace: true })
    } catch {
      setError('Credenciais inválidas. Em ambiente local, use a demo admin do projeto.')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center page p-6">
      <section className="card-section w-full max-w-[440px] p-7 px-6">
        <p className="section-kicker mb-3">Painel administrativo</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl">
          Entrar
        </h1>
        <form onSubmit={handleSubmit} className="mt-2">
          <label className="label-field" htmlFor="email">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input-field"
          />

          <label className="label-field" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="input-field"
          />

          <button type="submit" className="mt-5 btn-primary w-full">
            Entrar
          </button>
        </form>

        {error ? <p className="error-text">{error}</p> : null}
      </section>
    </main>
  )
}

function AdminApp({
  qrPublic,
  setQrPublic,
  accesses,
  setAccesses,
}: {
  qrPublic: QrDocument[]
  setQrPublic: React.Dispatch<React.SetStateAction<QrDocument[]>>
  accesses: AccessRecord[]
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}) {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!auth) {
      setUser({ uid: 'demo-admin', email: 'admin@demo.local' } as User)
      setChecking(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setChecking(false)
    })

    return () => unsubscribe()
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center font-semibold checking-text">
        Verificando acesso...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] panel max-[740px]:grid-cols-1">
      <aside className="aside-nav max-[740px]:border-r-0 max-[740px]:border-b print:hidden">
        <div>
          <p className="section-kicker mb-3">Admin</p>
          <h2 className="mb-2 text-2xl leading-[1.18] tracking-[-0.01em] text-heading max-[1024px]:text-xl">
            Caça ao Tesouro
          </h2>
        </div>

        <nav className="mt-6 flex flex-col gap-3">
          <Link to="/admin" className="nav-link">
            Dashboard
          </Link>
          <Link to="/admin/qrcodes" className="nav-link">
            QR Codes
          </Link>
          <Link to="/admin/qrcodes/print" className="nav-link">
            Impressão
          </Link>
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              if (auth) {
                await signOut(auth)
              }
              window.location.hash = '#/admin/login'
            }}
          >
            Sair
          </button>
        </nav>
      </aside>

      <main className="p-8 max-[740px]:px-4 max-[740px]:pt-5 max-[740px]:pb-10">
        <Routes>
          <Route index element={<AdminDashboardPage qrPublic={qrPublic} accesses={accesses} />} />
          <Route
            path="qrcodes"
            element={<AdminQrPage qrPublic={qrPublic} setQrPublic={setQrPublic} setAccesses={setAccesses} />}
          />
          <Route path="qrcodes/print" element={<PrintQrPage qrPublic={qrPublic} />} />
        </Routes>
      </main>
    </div>
  )
}

function AdminDashboardPage({ qrPublic, accesses }: { qrPublic: QrDocument[]; accesses: AccessRecord[] }) {
  const cards = useMemo(() => {
    return qrPublic.map((qr) => {
      const item = [...accesses]
        .filter((entry) => entry.qrId === qr.id)
        .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())[0]

      return { qr, lastAccess: item }
    })
  }, [accesses, qrPublic])

  const recentAccesses = [...accesses]
    .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
    .slice(0, 6)

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="section-kicker mb-3">Visão geral</p>
          <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl">
            Dashboard
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[18px] print:hidden">
        {cards.map(({ qr, lastAccess }) => (
          <article
            key={qr.id}
            className={`card-item border-l-[6px] p-5 ${lastAccess ? 'border-l-success' : 'border-l-slate'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="badge-id text-xs">{qr.id}</span>
              <span
                className={`status-badge ${lastAccess ? 'status-badge-active' : 'status-badge-idle'}`}
              >
                {lastAccess ? 'Acessado' : 'Aguardando'}
              </span>
            </div>
            <h3 className="text-[1.1rem] text-heading">
              {qr.tipo === 'dica' ? 'Dica' : 'Meme'}
            </h3>
            {lastAccess ? (
              <p>
                Equipe: <strong>{lastAccess.equipeNome}</strong>
              </p>
            ) : (
              <p>Sem acessos registrados ainda.</p>
            )}
            {lastAccess && qr.tipo === 'dica' ? (
              <p className="mt-3 warning-card px-3 py-2.5">
                Transmitir no {qr.canalRadio ?? 'Canal'} para {lastAccess.equipeNome}
              </p>
            ) : null}
          </article>
        ))}
      </section>

      <section className="mt-7 card-section p-5 print:hidden">
        <h2 className="mb-2 text-2xl leading-[1.18] tracking-[-0.01em] text-heading max-[1024px]:text-xl">
          Últimos acessos
        </h2>
        <ul className="m-0 grid list-none gap-3 p-0">
          {recentAccesses.map((entry) => (
            <li
              key={entry.id}
              className="list-item flex flex-wrap justify-between gap-3 px-3 py-2.5"
            >
              <strong>{entry.equipeNome}</strong>
              <span>{entry.qrId}</span>
              <small>{new Date(entry.timestamp).toLocaleString('pt-BR')}</small>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function AdminQrPage({
  qrPublic,
  setQrPublic,
  setAccesses,
}: {
  qrPublic: QrDocument[]
  setQrPublic: React.Dispatch<React.SetStateAction<QrDocument[]>>
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}) {
  const [form, setForm] = useState<FormState>(defaultForm)
  const [notice, setNotice] = useState('')

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const nextQr: QrDocument = {
      id: form.id.trim() || `QR${String(qrPublic.length + 1).padStart(3, '0')}`,
      tipo: form.tipo,
      local: form.local,
      canalRadio: form.tipo === 'dica' ? form.canalRadio : undefined,
      dicaTexto: form.tipo === 'dica' ? form.dicaTexto : undefined,
      memeUrl: form.tipo === 'meme' ? form.memeUrl : undefined,
      ativo: form.ativo,
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

    if (form.tipo === 'dica' && form.canalRadio) {
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
    setForm({ ...defaultForm, id: nextQr.id })
  }

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="mb-3 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-[#4f46e5]">
            Configuração
          </p>
          <h1 className="my-8 text-[clamp(2.1rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.04em] text-[#0f172a] max-[1024px]:my-5 max-[1024px]:text-4xl">
            QR Codes
          </h1>
        </div>
      </header>

      <form className="card-section max-w-[560px] p-6 print:hidden" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="label-field" htmlFor="qrId">
            ID do QR
          </label>
          <input
            id="qrId"
            className="input-field"
            value={form.id}
            onChange={(event) => handleChange('id', event.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="label-field" htmlFor="tipo">
            Tipo
          </label>
          <select
            id="tipo"
            className="input-field"
            value={form.tipo}
            onChange={(event) => handleChange('tipo', event.target.value as 'dica' | 'meme')}
          >
            <option value="dica">Dica</option>
            <option value="meme">Meme</option>
          </select>
        </div>

        {form.tipo === 'dica' ? (
          <>
            <div className="mb-3">
              <label className="label-field" htmlFor="canalRadio">
                Canal de rádio
              </label>
              <input
                id="canalRadio"
                className="input-field"
                value={form.canalRadio}
                onChange={(event) => handleChange('canalRadio', event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="label-field" htmlFor="dicaTexto">
                Texto da dica
              </label>
              <textarea
                id="dicaTexto"
                className="input-field min-h-[120px] resize-y p-3"
                value={form.dicaTexto}
                onChange={(event) => handleChange('dicaTexto', event.target.value)}
              />
            </div>
          </>
        ) : (
          <div className="mb-3">
            <label className="label-field" htmlFor="memeUrl">
              URL do meme
            </label>
            <input
              id="memeUrl"
              className="input-field"
              value={form.memeUrl}
              onChange={(event) => handleChange('memeUrl', event.target.value)}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="label-field" htmlFor="local">
            Local/descrição
          </label>
          <input
            id="local"
            className="input-field"
            value={form.local}
            onChange={(event) => handleChange('local', event.target.value)}
          />
        </div>

        <label className="mt-2 inline-flex items-center gap-2 text-nav">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={(event) => handleChange('ativo', event.target.checked)}
          />
          QR ativo
        </label>

        <button type="submit" className="mt-5 btn-primary w-full">
          Salvar QR
        </button>
      </form>

      {notice ? <p className="mt-4 success-text print:hidden">{notice}</p> : null}
    </>
  )
}

function PrintQrPage({ qrPublic }: { qrPublic: QrDocument[] }) {
  const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/q/`

  return (
    <>
      <header className="mb-6 print:hidden">
        <div>
          <p className="section-kicker">
            Impressão
          </p>
          <h1 className="heading max-[1024px]:my-5 max-[1024px]:text-4xl">
            QR Codes
          </h1>
        </div>
      </header>

      <section className="print-section print:grid-cols-[repeat(2,minmax(160px,1fr))] print:gap-4">
        {qrPublic.map((qr) => (
          <div key={qr.id} className="print-card">
            <QRCodeSVG value={`${baseUrl}${qr.id}`} size={160} />
            <span className="font-bold">{qr.id}</span>
          </div>
        ))}
      </section>
    </>
  )
}

export default App
