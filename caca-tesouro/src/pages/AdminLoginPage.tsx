import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function AdminLoginPage() {
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
    <main className="flex min-h-screen items-center justify-center page p-6 bg-slate-50">
      <Card padding="lg" className="w-full max-w-[440px]">
        <p className="section-kicker mb-3 text-indigo-600">Painel administrativo</p>
        <h1 className="heading my-8 max-[1024px]:my-5 max-[1024px]:text-4xl text-3xl font-bold text-slate-900">
          Entrar
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Senha"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button type="submit" fullWidth size="lg" className="mt-2">
            Entrar
          </Button>
        </form>

        {error && <p className="error-text text-center mt-4" role="alert">{error}</p>}
      </Card>
    </main>
  )
}