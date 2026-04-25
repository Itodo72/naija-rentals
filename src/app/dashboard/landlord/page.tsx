'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth'
import { api } from '../../../lib/api'
import toast from 'react-hot-toast'

const fmt = (n: number) => '₦' + Math.round(n).toLocaleString('en-NG')
type Sec = 'overview' | 'listings' | 'inquiries' | 'payments' | 'addlisting' | 'profile'

const STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe','Imo','Jigawa',
'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo',
'Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara']

const TYPES = ['Self-contain','Mini Flat','Room & Parlour','Flat / Apartment','Duplex',
'Bungalow','Detached House','Semi-detached','Terrace','Land','Shop / Office']

const NAV: { id: Sec; label: string; icon: string; badge?: string }[] = [
  { id: 'overview',   label: 'Overview',    icon: '📊' },
  { id: 'listings',   label: 'My listings', icon: '🏘' },
  { id: 'inquiries',  label: 'Inquiries',   icon: '💬', badge: '5' },
  { id: 'payments',   label: 'Payments',    icon: '💰' },
  { id: 'addlisting', label: 'Add listing', icon: '➕' },
  { id: 'profile',    label: 'My profile',  icon: '👤' },
]

export default function LandlordDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [sec, setSec] = useState<Sec>('overview')
  const [submitting, setSubmitting] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [ptype, setPtype] = useState('Flat / Apartment')
  const [rent, setRent] = useState('')
  const [state, setState] = useState('')
  const [lga, setLga] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [beds, setBeds] = useState('2')
  const [baths, setBaths] = useState('1')
  const [desc, setDesc] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [fName, setFName] = useState('')
  const [lName, setLName] = useState('')
  const [uPhone, setUPhone] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'LANDLORD')) router.push('/')
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

  const rentNum = parseInt(rent) || 0
  const fee5    = Math.round(rentNum * 0.05)
  const total   = rentNum + fee5

  function handlePhotos(files: FileList | null) {
    if (!files) return
    const all = [...photos, ...Array.from(files)].slice(0, 20)
    setPhotos(all)
    setPreviews(all.map(f => URL.createObjectURL(f)))
    toast.success(all.length + ' photo' + (all.length !== 1 ? 's' : '') + ' ready' + (all.length >= 4 ? ' ✅' : ''))
  }

  function removePhoto(i: number) {
    const updated = photos.filter((_, j) => j !== i)
    setPhotos(updated)
    setPreviews(updated.map(f => URL.createObjectURL(f)))
  }

  async function submitListing(e: React.FormEvent) {
    e.preventDefault()
    if (photos.length < 4) { toast.error('Upload at least 4 photos'); return }
    if (!title || !rent || !state || !lga || !city || !address) {
      toast.error('Fill in all required fields'); return
    }
    setSubmitting(true)
    try {
      await api.listings.create({
        title, type: ptype, annualRent: parseInt(rent),
        state, lga, city, streetAddress: address,
        bedrooms: parseInt(beds), bathrooms: parseInt(baths),
        description: desc,
        contactPhone: cPhone || user?.phone ?? '',  // eslint-disable-line
        contactEmail: cEmail || user?.email ?? '',  // eslint-disable-line
      })
      toast.success('Listing submitted for admin review!')
      setSec('listings')
      setTitle(''); setRent(''); setCity(''); setAddress('')
      setPhotos([]); setPreviews([])
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      toast.error(e?.response?.data?.message || 'Submission failed')
    }
    setSubmitting(false)
  }

  const sidebarStyle = { background: '#0D3B2E' }
  const activeStyle  = { background: 'rgba(46,158,116,0.25)', border: '1px solid rgba(46,158,116,0.28)', color: '#fff', fontWeight: 600 }
  const inactiveStyle = { color: 'rgba(255,255,255,0.4)' }
  const bannerStyle  = { background: 'linear-gradient(135deg,#1A5C44,#0D3B2E)' }

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={sidebarStyle}>
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3"
            style={{ background: 'linear-gradient(135deg,#237A5A,#2E9E74)' }}>
            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
          </div>
          <div className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</div>
          <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>🏠 Landlord</div>
          <span className="inline-flex items-center gap-1 mt-2 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ background: 'rgba(240,160,32,0.18)', border: '1px solid rgba(240,160,32,0.28)', color: '#F5C460' }}>
            ✓ Verified landlord
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
                  style={{ background: '#B86800' }}>{item.badge}</span>
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
                  <h2 className="text-white text-lg font-semibold mb-1">Good morning, {user.firstName} 👋</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Live summary of your NaijaRentals properties</p>
                </div>
                <div className="flex gap-2.5">
                  {[{ n: '₦2,200,000', l: 'Rent received' }, { n: '5', l: 'Inquiries today' }].map(({ n, l }) => (
                    <div key={l} className="rounded-xl px-4 py-2.5 text-center"
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div className="text-white font-semibold text-sm">{n}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { n: '3', l: 'Active listings', s: '↑ 1 this month', c: '#1A6B3A' },
                  { n: '1', l: 'Rented out',      s: 'Via escrow',     c: '#7A9E8A' },
                  { n: '5', l: 'Inquiries',        s: '↑ 2 today',     c: '#1A6B3A' },
                  { n: '₦2.2M', l: 'Rent received', s: 'Via Paystack', c: '#1A6B3A' },
                ].map(({ n, l, s, c }) => (
                  <div key={l} className="bg-white rounded-xl px-4 py-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className="text-2xl font-semibold text-gray-800">{n}</div>
                    <div className="text-xs text-gray-400 mt-1">{l}</div>
                    <div className="text-xs mt-1.5" style={{ color: c }}>{s}</div>
                  </div>
                ))}
              </div>
              <div className="notice-amber">
                <strong>🔒 Commission protection:</strong> All rent flows through Paystack escrow. Our 5% fee is auto-deducted before rent reaches you.{' '}
                <strong>Tenancy agreements, caution deposits and legal fees are settled between you and the tenant outside this platform.</strong>
              </div>
            </div>
          )}

          {/* ── MY LISTINGS ── */}
          {sec === 'listings' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5 flex items-center justify-between" style={bannerStyle}>
                <div>
                  <h2 className="text-white text-lg font-semibold mb-1">My listings</h2>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>All your properties on NaijaRentals</p>
                </div>
                <button onClick={() => setSec('addlisting')} className="text-white text-sm font-medium px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>➕ Add new listing</button>
              </div>
              {[
                { em: '🏢', title: 'Modern 2-bedroom flat, Rumuola', loc: 'Port Harcourt, Rivers · 2 beds · 2 baths', status: 'APPROVED',       rent: 750000 },
                { em: '🏠', title: 'Cozy self-contain, GRA Phase 1', loc: 'Port Harcourt, Rivers · 1 bed · 1 bath',  status: 'PENDING_REVIEW', rent: 480000 },
                { em: '🏡', title: '4-bedroom duplex, Woji',         loc: 'Port Harcourt, Rivers · 4 beds · 4 baths', status: 'RENTED',         rent: 2200000 },
              ].map(({ em, title: t, loc, status, rent: r }) => {
                const f = Math.round(r * 0.05)
                const pill = status === 'APPROVED' ? 'pill-green' : status === 'PENDING_REVIEW' ? 'pill-amber' : 'pill-red'
                const label = status === 'APPROVED' ? '✅ Live' : status === 'PENDING_REVIEW' ? '⏳ Pending review' : '🔴 Rented'
                return (
                  <div key={t} className="bg-white rounded-2xl p-5 mb-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: '#F0FAF5' }}>{em}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{t}</div>
                        <div className="text-xs text-gray-400 mt-0.5">📍 {loc}</div>
                        <span className={pill + ' mt-1 text-xs'}>{label}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 rounded-xl overflow-hidden mb-3" style={{ border: '1px solid #D4EAD8' }}>
                      {[
                        { lb: 'Your rent',       v: fmt(r),   c: 'text-amber-700' },
                        { lb: '+ Platform (5%)', v: fmt(f),   c: 'text-brand-700' },
                        { lb: '= Tenant pays',   v: fmt(r+f), c: 'text-gray-800' },
                      ].map(({ lb, v, c }) => (
                        <div key={lb} className="px-3 py-3 bg-brand-50" style={{ borderRight: '1px solid #D4EAD8' }}>
                          <div className="text-xs text-gray-400 mb-1">{lb}</div>
                          <div className={'font-bold text-sm ' + c}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary text-xs px-3 py-1.5" onClick={() => toast('Editing...')}>✏️ Edit</button>
                      <button className="btn-danger text-xs px-3 py-1.5" onClick={() => toast('Paused.')}>⏸ Pause</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── INQUIRIES ── */}
          {sec === 'inquiries' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Tenant inquiries</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Prospective tenants who reached out</p>
              </div>
              <div className="bg-white rounded-2xl p-5 space-y-4" style={{ border: '1px solid #D4EAD8' }}>
                {[
                  { av: 'TN', name: 'Tunde Nwachukwu', tag: 'Re: 2-bed flat, Rumuola',    msg: 'Good day, is it still available? I can inspect any day this week.', time: 'Today 9:14 AM · +234 803 221 4455' },
                  { av: 'AF', name: 'Aisha Farouq',     tag: 'Re: 2-bed flat, Rumuola',    msg: 'Can I inspect this weekend? Ready to pay if okay.',                time: 'Today 6:30 AM · +234 807 334 5566' },
                  { av: 'KC', name: 'Kelechi Chima',    tag: 'Re: Self-contain, GRA Ph 1', msg: 'Is water supply available? Does it have a prepaid meter?',         time: 'Yesterday 4:45 PM · +234 802 445 6677' },
                ].map(({ av, name, tag, msg, time }) => (
                  <div key={name} className="flex gap-3 pb-4" style={{ borderBottom: '1px solid #F0FAF5' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#F0FAF5', border: '1px solid #A8E6CC', color: '#1A5C44' }}>{av}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{name}</div>
                      <div className="text-xs mt-0.5 mb-1" style={{ color: '#237A5A' }}>{tag}</div>
                      <div className="text-xs text-gray-500 leading-relaxed">{msg}</div>
                      <div className="text-xs text-gray-400 mt-1">{time}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="btn-secondary text-xs px-3 py-1" onClick={() => toast('Calling ' + name)}>📞 Call</button>
                        <button className="btn-secondary text-xs px-3 py-1" onClick={() => toast('Email opened')}>✉️ Email</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENTS ── */}
          {sec === 'payments' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Payments</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Rent received via Paystack escrow</p>
              </div>
              <div className="notice mb-5">
                All rent flows through <strong>Paystack escrow</strong>. Our 5% fee is auto-deducted.{' '}
                <strong>Tenancy agreements, caution deposits and legal fees are settled between you and tenant outside this platform.</strong>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { n: '₦2,200,000', l: 'Total rent received',        c: 'text-brand-900' },
                  { n: '1',          l: 'Completed rentals',           c: 'text-gray-700'  },
                  { n: '₦110,000',   l: 'Platform fee (paid by tenant)', c: 'text-amber-700' },
                ].map(({ n, l, c }) => (
                  <div key={l} className="bg-white rounded-xl px-4 py-4" style={{ border: '1px solid #D4EAD8' }}>
                    <div className={'text-xl font-semibold ' + c}>{n}</div>
                    <div className="text-xs text-gray-400 mt-1">{l}</div>
                  </div>
                ))}
              </div>
              {/* Receipt */}
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #D4EAD8' }}>
                <div className="px-5 py-3.5" style={{ borderBottom: '1px solid #F0FAF5' }}>
                  <span className="font-semibold text-gray-800 text-sm">Transaction history</span>
                </div>
                <div className="p-5">
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #D4EAD8' }}>
                    <div className="flex justify-between items-center px-4 py-2.5" style={{ background: '#F0FAF5', borderBottom: '1px solid #D4EAD8' }}>
                      <span className="text-sm font-semibold text-gray-800">🏡 4-bed duplex, Woji · Jan 2025</span>
                      <span className="pill-green text-xs">✓ Escrow released</span>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {[
                          { l: '💳 Tenant paid', v: '₦2,310,000', bg: '#F9F9F9', bc: '#E0E0E0', c: 'text-gray-800',  s: 'via Paystack' },
                          { l: '🏠 You received', v: '₦2,200,000', bg: '#F0FAF5', bc: '#A8E6CC', c: 'text-brand-900', s: 'Sent to bank ✓' },
                          { l: '🏢 Platform 5%',  v: '₦110,000',   bg: '#FFFBF0', bc: '#F5C460', c: 'text-amber-700', s: 'NaijaRentals'   },
                        ].map(({ l, v, bg, bc, c, s }) => (
                          <div key={l} className="rounded-xl p-3 text-center"
                            style={{ background: bg, border: '1px solid ' + bc }}>
                            <div className="text-xs text-gray-400 mb-1">{l}</div>
                            <div className={'text-base font-bold ' + c}>{v}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{s}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs" style={{ color: '#1A6B3A' }}>
                        ✅ Tenant: Tunde Obi · Released 15 Jan 2025 · Ref: NRE-001
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADD LISTING ── */}
          {sec === 'addlisting' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">Add a new listing</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Free to list · Admin review within 24 hours</p>
              </div>
              <div className="notice mb-5">Your listing goes to <strong>admin review</strong> before going live. Upload clear photos — minimum 4 required.</div>

              <form onSubmit={submitListing} className="bg-white rounded-2xl p-6 space-y-5" style={{ border: '1px solid #D4EAD8' }}>

                {/* Photos */}
                <div>
                  <label className="label">Property photos <span className="text-red-400 text-xs">* minimum 4</span></label>
                  <div onClick={() => document.getElementById('ph-input')?.click()}
                    className="rounded-xl p-6 text-center cursor-pointer transition-colors"
                    style={{ border: '2px dashed #A8E6CC', background: '#F0FAF5' }}>
                    <div className="text-3xl mb-2">📷</div>
                    <div className="text-sm font-semibold mb-1" style={{ color: '#1A5C44' }}>Click to upload photos</div>
                    <div className="text-xs text-gray-400">Up to 20 photos · JPG, PNG</div>
                    <input id="ph-input" type="file" accept="image/*" multiple className="hidden"
                      onChange={e => handlePhotos(e.target.files)} />
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                        {photos.length >= 4
                          ? <span className="text-xs font-medium" style={{ color: '#1A6B3A' }}>✅ Minimum met</span>
                          : <span className="text-xs text-red-500">{4 - photos.length} more required</span>}
                      </div>
                      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(72px,1fr))' }}>
                        {previews.map((src, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1', border: '1px solid #D4EAD8' }}>
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removePhoto(i)}
                              className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full text-white flex items-center justify-center"
                              style={{ fontSize: 9 }}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Property title *</label>
                    <input className="input" placeholder="e.g. Modern 2-bed flat, Rumuola"
                      value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Property type *</label>
                    <select className="input" value={ptype} onChange={e => setPtype(e.target.value)}>
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">State *</label>
                    <select className="input" value={state} onChange={e => setState(e.target.value)}>
                      <option value="">— Select state —</option>
                      {STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">LGA *</label>
                    <input className="input" placeholder="e.g. Obio/Akpor"
                      value={lga} onChange={e => setLga(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">City / Area *</label>
                    <input className="input" placeholder="e.g. GRA Phase 2"
                      value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Street address *</label>
                    <input className="input" placeholder="e.g. 12 Okporo Road"
                      value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">Annual rent (₦) *</label>
                  <input className="input" type="number" placeholder="e.g. 750000"
                    value={rent} onChange={e => setRent(e.target.value)} />
                  {rentNum >= 1000 && (
                    <div className="grid grid-cols-3 rounded-xl overflow-hidden mt-2" style={{ border: '1px solid #D4EAD8' }}>
                      {[
                        { lb: 'Your rent',       v: fmt(rentNum), c: 'text-amber-700' },
                        { lb: '+ Platform (5%)', v: fmt(fee5),    c: 'text-brand-700' },
                        { lb: '= Tenant pays',   v: fmt(total),   c: 'text-gray-800'  },
                      ].map(({ lb, v, c }) => (
                        <div key={lb} className="px-3 py-3 bg-brand-50" style={{ borderRight: '1px solid #D4EAD8' }}>
                          <div className="text-xs text-gray-400 mb-1">{lb}</div>
                          <div className={'font-bold text-sm ' + c}>{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Bedrooms</label>
                    <select className="input" value={beds} onChange={e => setBeds(e.target.value)}>
                      {['1','2','3','4','5','6'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Bathrooms</label>
                    <select className="input" value={baths} onChange={e => setBaths(e.target.value)}>
                      {['1','2','3','4'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Conditions &amp; details</label>
                  <textarea className="input" rows={3}
                    placeholder="e.g. No pets, 1 year upfront, borehole, generator..."
                    value={desc} onChange={e => setDesc(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact phone</label>
                    <input className="input" type="tel" placeholder="+234 ..."
                      value={cPhone} onChange={e => setCPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Contact email</label>
                    <input className="input" type="email" placeholder="landlord@email.com"
                      value={cEmail} onChange={e => setCEmail(e.target.value)} />
                  </div>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-sm">
                  {submitting ? 'Submitting...' : '📋 Submit listing for admin review'}
                </button>
              </form>
            </div>
          )}

          {/* ── PROFILE ── */}
          {sec === 'profile' && (
            <div>
              <div className="rounded-2xl px-6 py-5 mb-5" style={bannerStyle}>
                <h2 className="text-white text-lg font-semibold mb-1">My profile</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>Manage your landlord account</p>
              </div>
              <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #D4EAD8' }}>
                <div className="flex items-center gap-4 mb-6 pb-6" style={{ borderBottom: '1px solid #F0FAF5' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: '#1A5C44' }}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-400 mt-0.5">Landlord · {user?.email ?? ''}</div>
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
