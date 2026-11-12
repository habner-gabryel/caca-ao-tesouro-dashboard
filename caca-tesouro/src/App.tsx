import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { initialAccesses, initialQrPublic, initialTeams } from './mockData'
import type { QrDocument, AccessRecord } from './types'
import { HomePage } from './pages/HomePage'
import { PublicQrPage } from './pages/PublicQrPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminApp } from './pages/AdminApp'

function App() {
  const [qrPublic, setQrPublic] = useState<QrDocument[]>(initialQrPublic)
  const [accesses, setAccesses] = useState<AccessRecord[]>(initialAccesses)

  return (
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route
        path='/q/:qrId'
        element={<PublicQrPage qrPublic={qrPublic} teams={initialTeams} setAccesses={setAccesses} />}
      />
      <Route path='/admin/login' element={<AdminLoginPage />} />
      <Route
        path='/admin/*'
        element={<AdminApp qrPublic={qrPublic} setQrPublic={setQrPublic} accesses={accesses} setAccesses={setAccesses} />}
      />
    </Routes>
  )
}

export default App
