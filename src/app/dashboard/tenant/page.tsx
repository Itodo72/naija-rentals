'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
type Sec = 'overview' | 'browse' | 'myrentals' | 'payments' | 'saved' | 'profile'

const NAV: { id: Sec; label: string; icon: string; badge?: string }[] = [
  { id: 'overview',  label: 'Overview',          icon: '📊' },
  { id: 'browse',    label: 'Browse properties', icon: '🔍', badge: 'NEW' },
  { id: 'myrentals', label: 'My rentals',        icon: '🏠' },
  { id: 'payments',  label: 'Payments',          icon: '💰' },
  { id: 'saved',     label: 'Saved',             icon: '❤️', badge: '4' },
  { id: 'profile',   label: 'My profile',        icon: '👤' },
]

export default function TenantDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [sec, setSec]         = useState<Sec>('overview')
  const [payRent, setPayRent] = useState('')
  const [payProp, setPayProp] = useState('')
  const [fName, setFName]     = useState('')
  const [lName, setLName]     = useState('')
  const [uPhone, setUPhone]   = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TENANT')) router.push('/')
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setFName(user.firstName || '')
      setLName(user.lastName || '')
      setUPhone(user?.phone ?? '')
    }
  }, [user])

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0D3B2E' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Loading...</p>
      </div>
    )
  }

  const rentNum = parseInt(payRent) || 0
  const fee5    = Math.round(rentNum * 0.05)
  const total   = rentNum + fee5
  const saving  = Math.round(rentNum * 0.20) - fee5

  function payNow() {
    if (rentNum < 10000) { toast.error('Enter a valid rent amount'); return }
    if (!payProp)        { toast.error('Enter the property name');   return }
    const psKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''
    const ref   = 'NRE-' + Date.now()
    const win   = window as unknown as { PaystackPop?: { setup: (o: Record<string, unknown>) => { openIframe: () => void } } }
    if (win.PaystackPop) {
      const handler = win.PaystackPop.setup({
        key: psKey, email: user?.email ?? '', amount: total * 100, currency: 'NGN', ref,
        metadata: { custom_fields: [
          { display_name: 'Property',         variable_name: 'property', value: payProp },
          { display_name: 'Rent to Landlord', variable_name: 'rent',     value: fmt(rentNum) },
          { display_name: 'Platform Fee 5%',  variable_name: 'fee',      value: fmt(fee5) },
        ]},
        callback: (res: { reference: string }) => toast.success('✅ Payment confirmed! Ref: ' + res.reference),
        onClose:  () => toast('Payment window closed'),
      })
      handler.openIframe()
    } else {
      toast.success('[Demo] Payment of ' + fmt(total) + ' initiated · Ref: ' + ref)
    }
  }

  const activeStyle  = { background: 'rgba(46,158,116,0.25)', border: '1px solid rgba(46,158,116,0.28)', color: '#fff', fontWeight: 600 }
  const inactiveStyle = { color: 'rgba(255,255,255,0.4)' }
  const bannerStyle  = { background: 'linear-gradient(135deg,#1C3828,#0A1E16)' }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col"
        style={{ background: 'linear-gradient(180deg,#1C3828,#0A1E16)' }}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3"
            style={{ background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.18)' }}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>👤 Tenant</div>
          <span className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: 'rgba(92,196,154,0.14)', border: '1px solid rgba(92,196,154,0.22)', color: '#5CC49A' }}>
            ✓ Verified tenant
          </span>
        </div>
        <nav className="px-3 py-3 flex-1">
          {NAV.map(item => (
            <button key={item.id} onClick={() => setSec(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm mb-0.5 transition-all text-left"
              style={sec === item.id ? activeStyle : inactiveStyle}>
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-white text-xs px-1.5 py-px rounded-full font-semibold"
                  style={{ background: '#237A5A' }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-2 px-6 py-4 text-sm"
          style={{ color: 'rgba(255,120,120,0.65)' }}>🚪 Log out</button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#F5FAF7' }}>
        <div className="p-7">

          {/* ── OVERVIEW ── */}
          {sec === 'overview' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5 flex flex-wrap items-center justify-between gap-4"
                style={bannerStyle}>
                <div>
                  <h2 className="text-white text-lg font-semibold mb-1">Welcome back, {user.firstName} 👋</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Track your rentals and browse properties</p>
                </div>
                <div className="flex gap-2.5">
                  {[
                    { n: '₦2,310,000', l: 'Total paid',     c: '#fff'     },
                    { n: '₦330,000',   l: 'Saved vs agents', c: '#6DDEAA' },
                  ].map(({ n, l, c }) => (
                    <div key={l} className="rounded-xl px-4 py-2.5 text-center min-w-28"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="font-semibold text-sm" style={{ color: c }}>{n}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { n: '1',     l: 'Active rental',      s: 'Expires Jan 2026', c: '#1A6B3A' },
                  { n: '4',     l: 'Saved properties',   s: 'Browse more →',    c: '#7A9E8A' },
                  { n: '₦330k', l: 'Saved vs 20% agent', s: 'Zero commission!', c: '#1A6B3A' },
                ].map(({ n, l, s, c }) => (
                  <div key={l} className="bg-white rounded-xl px-4 py-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className="text-2xl font-semibold text-gray-800">{n}</div>
                    <div className="text-xs text-gray-500 mt-1">{l}</div>
                    <div className="text-xs mt-1.5" style={{ color: c }}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="notice-amber">
                💡 You saved <strong>₦330,000</strong> by using NaijaRentals instead of a traditional agent.{' '}
                <button onClick={() => setSec('payments')} className="underline font-medium">Pay rent now →</button>
              </div>
            </div>
          )}

          {/* ── BROWSE ── */}
          {sec === 'browse' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Browse properties</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Verified listings across all 36 states + FCT</p>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #D4EAD8' }}>
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Browse all properties</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
                  Find verified properties across all 36 states and 774 LGAs. Listings go live after admin approval.
                </p>
                <button onClick={() => setSec('payments')} className="btn-primary text-sm">
                  Go to Payments →
                </button>
              </div>
            </div>
          )}

          {/* ── MY RENTALS ── */}
          {sec === 'myrentals' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">My rentals</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Properties you rent via Paystack escrow</p>
              </div>
              <div className="rounded-xl p-5 mb-5" style={{ background: 'linear-gradient(135deg,#0D3B2E,#1C3828)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-white font-semibold text-sm mb-3">🛡️ How your rent payment flows</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { icon: '💳', t: 'You pay',           s: 'Rent + 5% via Paystack', bg: 'rgba(255,255,255,0.08)' },
                    { icon: '🏠', t: '95% → Landlord',    s: 'Direct to their bank',   bg: 'rgba(46,158,116,0.3)'  },
                    { icon: '🏢', t: '5% → NaijaRentals', s: 'Platform fee',           bg: 'rgba(240,160,32,0.2)'  },
                  ].map(({ icon, t, s, bg }) => (
                    <div key={t} className="rounded-lg p-3 text-center" style={{ background: bg }}>
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-xs font-semibold text-white mb-0.5">{t}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{s}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,80,48,0.12)', border: '1px solid rgba(255,80,48,0.22)' }}>
                  <p className="text-xs font-medium" style={{ color: '#FFB4A4' }}>
                    ⚠️ Always pay rent through NaijaRentals only. If a landlord asks you to pay directly to their account, report it immediately.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #D4EAD8' }}>
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="font-semibold text-gray-700 mb-1">No active rentals yet</h3>
                <p className="text-gray-400 text-sm mb-4">When you pay rent through NaijaRentals your active rental appears here.</p>
                <button onClick={() => setSec('payments')} className="btn-primary text-sm">Pay rent now →</button>
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {sec === 'payments' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Payments &amp; Escrow</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>All rent paid securely via Paystack · NaijaRentals Escrow</p>
              </div>

              {/* Escrow flow */}
              <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg,#0D3B2E,#1C3828)' }}>
                <div className="text-white font-semibold text-sm mb-4">🔐 How NaijaRentals Paystack Escrow works</div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { icon: '💳', t: '1. You pay',       s: 'via Paystack', c: '#fff',     bg: 'rgba(255,255,255,0.1)'  },
                    { icon: '🏦', t: '2. Held safely',   s: 'in escrow',    c: '#fff',     bg: 'rgba(255,255,255,0.1)'  },
                    { icon: '🏠', t: '3. 95% landlord',  s: 'direct bank',  c: '#5CC49A',  bg: 'rgba(46,158,116,0.3)'   },
                    { icon: '🏢', t: '4. 5% platform',   s: 'NaijaRentals', c: '#F5C460',  bg: 'rgba(240,160,32,0.2)'   },
                  ].map(({ icon, t, s, c, bg }) => (
                    <div key={t} className="text-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg mx-auto mb-2"
                        style={{ background: bg }}>{icon}</div>
                      <div className="text-xs font-semibold mb-0.5" style={{ color: c }}>{t}</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{s}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg p-3 text-xs leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
                  ℹ️ <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Not handled by NaijaRentals:</strong> Tenancy agreement, caution deposit and legal fees — settled directly between you and the landlord outside the platform.
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { n: '₦2,625,000', l: 'Total paid (all time)', c: 'text-gray-800'  },
                  { n: '₦125,000',   l: 'Platform fees (5%)',    c: 'text-amber-700' },
                  { n: '₦375,000',   l: 'Saved vs 20% agent',   c: 'text-green-700' },
                ].map(({ n, l, c }) => (
                  <div key={l} className="bg-white rounded-xl px-4 py-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className={'text-xl font-semibold ' + c}>{n}</div>
                    <div className="text-xs text-gray-400 mt-1">{l}</div>
                  </div>
                ))}
              </div>

              {/* Pay rent panel */}
              <div className="bg-white rounded-2xl p-5 mb-5" style={{ border: '1px solid #D4EAD8' }}>
                <h3 className="font-semibold text-gray-800 mb-1">💳 Pay rent via Paystack</h3>
                <p className="text-xs text-gray-400 mb-4">Card · Bank Transfer · USSD · QR Code</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="label">Annual rent (₦)</label>
                    <input className="input" type="number" placeholder="e.g. 750000"
                      value={payRent} onChange={e => setPayRent(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Property name</label>
                    <input className="input" placeholder="e.g. 2-bed flat, Rumuola"
                      value={payProp} onChange={e => setPayProp(e.target.value)} />
                  </div>
                </div>

                {rentNum >= 1000 && (
                  <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className="px-4 py-2.5" style={{ background: '#0D3B2E' }}>
                      <span className="text-white text-xs font-semibold">Payment breakdown</span>
                    </div>
                    {[
                      { l: 'Annual rent → Landlord', s: 'Released directly via Paystack',                   v: fmt(rentNum), c: 'text-brand-900', bold: false },
                      { l: 'NaijaRentals fee (5%)',  s: 'vs ' + fmt(Math.round(rentNum*0.20)) + ' agent fee', v: fmt(fee5),    c: 'text-amber-700', bold: false },
                      { l: 'Total via Paystack',     s: '💚 You save ' + fmt(saving) + ' vs 20% agent',       v: fmt(total),   c: 'text-gray-800',  bold: true  },
                    ].map(({ l, s, v, c, bold }) => (
                      <div key={l} className={'flex justify-between items-center px-4 py-3' + (bold ? ' bg-brand-50' : '')}
                        style={{ borderBottom: '1px solid #F0FAF5' }}>
                        <div>
                          <div className={'text-sm ' + (bold ? 'font-semibold text-gray-800' : 'text-gray-600')}>{l}</div>
                          <div className="text-xs text-gray-400">{s}</div>
                        </div>
                        <div className={'font-bold ' + (bold ? 'text-base' : 'text-sm') + ' ' + c}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={payNow} disabled={rentNum < 1000}
                  className="w-full py-3.5 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2.5 disabled:opacity-40 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#0D3B2E,#1A5C44)' }}>
                  <span>🔐 Pay securely via</span>
                  <span className="bg-white px-2 py-0.5 rounded font-extrabold text-xs tracking-wide"
                    style={{ color: '#0D3B2E' }}>Paystack</span>
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">🔒 256-bit SSL · PCI DSS Compliant · CBN Licensed</p>
              </div>

              {/* Transaction history */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #D4EAD8' }}>
                <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F0FAF5' }}>
                  <span className="font-semibold text-gray-800 text-sm">Transaction history</span>
                  <span className="text-xs text-gray-400">All via Paystack Escrow</span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { title: '🏡 4-bed duplex, Woji · Jan 2025',    ref: 'NRE-001', total: 2310000, rent: 2200000, fee: 110000, ll: 'Engr. Badmus',  saving: 330000 },
                    { title: '🏠 Self-contain, Mile 3 · Jan 2024',  ref: 'NRE-002', total: 315000,  rent: 300000,  fee: 15000,  ll: 'Mr. Sunday Eze', saving: 45000 },
                  ].map(({ title, ref, total: t, rent: r, fee: f, ll, saving: sv }) => (
                    <div key={ref} className="rounded-xl overflow-hidden" style={{ border: '1px solid #D4EAD8' }}>
                      <div className="flex justify-between items-center px-4 py-2.5 flex-wrap gap-2"
                        style={{ background: '#F0FAF5', borderBottom: '1px solid #D4EAD8' }}>
                        <span className="text-sm font-semibold text-gray-800">{title}</span>
                        <div className="flex items-center gap-2">
                          <span className="pill-green text-xs">✓ Escrow released</span>
                          <span className="text-xs text-gray-400">Ref: {ref}</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[
                            { l: '💳 You paid',    v: fmt(t), bg: '#F9F9F9', bc: '#E0E0E0', c: 'text-gray-800',  s: 'via Paystack' },
                            { l: '🏠 To landlord', v: fmt(r), bg: '#F0FAF5', bc: '#A8E6CC', c: 'text-brand-900', s: 'Released ✓'   },
                            { l: '🏢 Platform 5%', v: fmt(f), bg: '#FFFBF0', bc: '#F5C460', c: 'text-amber-700', s: 'NaijaRentals' },
                          ].map(({ l, v, bg, bc, c, s }) => (
                            <div key={l} className="rounded-xl p-3 text-center"
                              style={{ background: bg, border: '1px solid ' + bc }}>
                              <div className="text-xs text-gray-400 mb-1">{l}</div>
                              <div className={'text-base font-bold ' + c}>{v}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{s}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between flex-wrap gap-2">
                          <span className="text-xs" style={{ color: '#1A6B3A' }}>✅ Landlord: {ll}</span>
                          <span className="text-xs font-semibold" style={{ color: '#2E9E74' }}>Saved {fmt(sv)} vs agent</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SAVED ── */}
          {sec === 'saved' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Saved properties</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Properties you bookmarked while browsing</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: 'Modern 2-bed flat',       loc: 'Rumuola, Port Harcourt',   rent: 750000,  em: '🏢' },
                  { title: 'Bungalow, Aba Road',       loc: 'Rumuigbo, Port Harcourt',  rent: 600000,  em: '🏘' },
                  { title: '3-bed apartment, Lekki',   loc: 'Lekki Phase 1, Lagos',     rent: 3500000, em: '🏙' },
                  { title: 'Duplex, Ikeja GRA',        loc: 'Ikeja GRA, Lagos',         rent: 5000000, em: '🏡' },
                ].map(({ title, loc, rent, em }) => {
                  const f = Math.round(rent * 0.05)
                  return (
                    <div key={title} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #D4EAD8' }}>
                      <div className="h-24 flex items-center justify-center text-4xl" style={{ background: '#F0FAF5' }}>{em}</div>
                      <div className="p-4">
                        <div className="font-semibold text-gray-800 text-sm mb-1">{title}</div>
                        <div className="text-xs text-gray-400 mb-3">📍 {loc}</div>
                        <div className="text-lg font-bold" style={{ color: '#1A5C44' }}>
                          {fmt(rent + f)}<span className="text-xs font-normal text-gray-400"> /yr total</span>
                        </div>
                        <div className="text-xs text-gray-400">{fmt(rent)} rent + {fmt(f)} fee</div>
                        <div className="flex gap-2 mt-3">
                          <button className="btn-primary flex-1 text-xs py-2" onClick={() => toast('Viewing...')}>View</button>
                          <button className="btn-danger text-xs py-2 px-3" onClick={() => toast('Removed')}>✕</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {sec === 'profile' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">My profile</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Manage your tenant account</p>
              </div>
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #D4EAD8' }}>
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid #F0FAF5' }}>
                  <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400 mt-0.5">Tenant · {user?.email ?? ''}</div>
                    <span className="pill-green mt-2 text-xs">✓ Verified</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">First name</label>
                    <input className="input" value={fName} onChange={e => setFName(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input className="input" value={lName} onChange={e => setLName(e.target.value)} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">Email</label>
                  <input className="input" value={user?.email ?? ''} disabled style={{ background: '#F9F9F9', cursor: 'not-allowed' }} />
                </div>
                <div className="mb-5">
                  <label className="label">Phone</label>
                  <input className="input" value={uPhone} onChange={e => setUPhone(e.target.value)} />
                </div>
                <button className="btn-primary w-full py-3" onClick={() => toast('Profile updated!')}>
                  Save changes
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
