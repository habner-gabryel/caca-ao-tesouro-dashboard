import { useEffect, useState } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'
import { AdminLayout } from '../components/AdminLayout'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminQrPage } from './AdminQrPage'
import { PrintQrPage } from './PrintQrPage'

interface AdminAppProps {
  qrPublic: QrDocument[]
  setQrPublic: React.Dispatch<React.SetStateAction<QrDocument[]>>
  accesses: AccessRecord[]
  setAccesses: React.Dispatch<React.SetStateAction<AccessRecord[]>>
}

import type { QrDocument, AccessRecord } from '../types'

export function AdminApp({ qrPublic, setQrPublic, accesses, setAccesses }: AdminAppProps) {
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
      <div className="flex min-h-screen items-center justify-center font-medium text-slate-500">
        Verificando acesso...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <AdminLayout>
      <Routes>
        <Route
          index
          element={<AdminDashboardPage qrPublic={qrPublic} accesses={accesses} />}
        />
        <Route
          path="qrcodes"
          element={<AdminQrPage qrPublic={qrPublic} setQrPublic={setQrPublic} setAccesses={setAccesses} />}
        />
        <Route path="qrcodes/print" element={<PrintQrPage qrPublic={qrPublic} />} />
      </Routes>
    </AdminLayout>
  )
}