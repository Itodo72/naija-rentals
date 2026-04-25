'use client'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import toast from 'react-hot-toast'

interface Props {
  role: string
  onClose: () => void
  onSuccess: (u: { role: string }) => void
}

export default function AuthModal({ role, onClose, onSuccess }: Props) {
  const { login, register } = useAuth()
  const [tab,      setTab]      = useState<'login' | 'register'>('login')
  const [loading,  setLoading]  = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')

  const isLL = role === 'LANDLORD'
  const bg   = isLL ? '#1A5C44' : '#1C3828'

  async function doLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Enter email and password'); return }
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.success) { toast.success(res.message); onSuccess({ role }) }
    else toast.error(res.message)
  }

  async function doRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!firstName || !lastName || !email || !phone || !password) { toast.error('Fill in all fields'); return }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    const res = await register({ firstName, lastName, email, phone, password, role })
    setLoading(false)
    if (res.success) { toast.success('Account created! Welcome 🎉'); onSuccess({ role }) }
    else toast.error(res.message)
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-10 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl w-full overflow-hidden shadow-2xl" style={{ maxWidth: 420 }}>

        {/* Header */}
        <div className="px-7 py-6" style={{ background: 'linear-gradient(135deg,' + bg + ',#0D3B2E)' }}>
          <div className="flex items-center gap-2 mb-3">
            <button type="button" onClick={onClose}
              className="text-white text-xs px-3 py-1 rounded-md"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              ← Back
            </button>
            <span className="text-white text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
              {isLL ? '🏠 Landlord' : '👤 Tenant'}
            </span>
          </div>
          <h2 className="text-white text-lg font-semibold mb-1">
            {tab === 'login'
              ? (isLL ? 'Landlord sign in' : 'Tenant sign in')
              : (isLL ? 'Create landlord account' : 'Create tenant account')}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {tab === 'login'
              ? ('Access your ' + (isLL ? 'landlord' : 'tenant') + ' dashboard')
              : (isLL ? 'List your properties for free' : 'Find your home without agent fees')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-brand-100 bg-brand-50">
          {(['login', 'register'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className="flex-1 py-3 text-sm transition-all"
              style={{
                background:   tab === t ? '#fff' : 'transparent',
                color:        tab === t ? bg : '#aaa',
                fontWeight:   tab === t ? 600 : 400,
                borderBottom: tab === t ? ('2px solid ' + bg) : '2px solid transparent',
              }}>
              {t === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {tab === 'login' ? (
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
                style={{ background: bg }}>
                {loading ? 'Signing in...' : (isLL ? 'Sign in as Landlord' : 'Sign in as Tenant')}
              </button>
              <p className="text-center text-sm text-gray-400 pt-2 border-t border-brand-50">
                No account?{' '}
                <button type="button" onClick={() => setTab('register')}
                  className="font-semibold" style={{ color: bg }}>
                  Create one free
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={doRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">First name</label>
                  <input className="input" placeholder="Amaka"
                    value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input className="input" placeholder="Okafor"
                    value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" type="tel" placeholder="+234 800 000 0000"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Minimum 8 characters"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50 mt-1"
                style={{ background: bg }}>
                {loading ? 'Creating account...' : (isLL ? 'Create Landlord Account' : 'Create Tenant Account')}
              </button>
              <p className="text-center text-sm text-gray-400 pt-2 border-t border-brand-50">
                Have an account?{' '}
                <button type="button" onClick={() => setTab('login')}
                  className="font-semibold" style={{ color: bg }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
