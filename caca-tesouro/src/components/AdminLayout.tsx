import { NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { Button } from './ui/Button'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth)
    }
    navigate('/admin/login', { replace: true })
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/qrcodes', label: 'QR Codes' },
    { path: '/admin/qrcodes/print', label: 'Impressão' },
  ]

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr] panel max-[740px]:grid-cols-1">
      <aside className="aside-nav max-[740px]:border-r-0 max-[740px]:border-b print:hidden bg-white border-r border-slate-200">
        <div className="p-6">
          <p className="section-kicker mb-3 text-indigo-600 font-bold uppercase tracking-wide text-sm">Admin</p>
          <h2 className="text-2xl font-bold text-slate-900 max-[1024px]:text-xl">
            Caça ao Tesouro
          </h2>
        </div>

        <nav className="px-4 pb-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Button variant="outline" onClick={handleLogout} className="mt-2 w-full justify-center">
            Sair
          </Button>
        </nav>
      </aside>

      <main className="p-8 max-[740px]:px-4 max-[740px]:pt-5 max-[740px]:pb-10 bg-slate-50 min-h-screen">
        {children}
      </main>
    </div>
  )
}