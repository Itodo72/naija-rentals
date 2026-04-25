'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth'
import AuthModal from '../../components/AuthModal'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState('TENANT')

  useEffect(() => {
    if (user) {
      router.push(user.role === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant')
    }
  }, [user, router])

  function openAuth(r: string) {
    setRole(r)
    setOpen(true)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{ background: '#0D3B2E' }}>

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 20% 80%,rgba(46,158,116,.22),transparent 45%),radial-gradient(circle at 80% 20%,rgba(240,160,32,.1),transparent 45%)'
      }} />

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'linear-gradient(135deg,#237A5A,#2E9E74)' }}>🏡</div>
          <span className="text-2xl font-bold text-white">
            Naija<span style={{ color: '#F0A020' }}>Rentals</span>
          </span>
        </div>

        {/* Pill */}
        <div className="inline-flex items-center gap-2 border border-white/16 text-white/85 px-5 py-2 rounded-full text-sm font-medium mb-5"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Welcome — Built for every Nigerian 🇳🇬
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold text-white text-center leading-tight mb-3"
          style={{ letterSpacing: '-1px' }}>
          Nigeria&apos;s{' '}
          <span style={{ color: '#F0A020' }}>Fairest</span>
          <br />Rental Marketplace
        </h1>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No agents. No hidden fees.
          </span>
          <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.15)' }} />
        </div>

        <p className="text-center text-base leading-relaxed mb-8 max-w-md"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          We cut the infamous{' '}
          <strong style={{ color: '#F5C460', fontWeight: 500 }}>20% agent commission</strong> down to just{' '}
          <strong style={{ color: '#F5C460', fontWeight: 500 }}>5%</strong>. Rent across all{' '}
          <strong style={{ color: '#F5C460', fontWeight: 500 }}>36 states + FCT</strong> and{' '}
          <strong style={{ color: '#F5C460', fontWeight: 500 }}>774 LGAs</strong>.
        </p>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <button onClick={() => openAuth('LANDLORD')}
            className="border-2 rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="text-4xl mb-3">🏠</div>
            <div className="text-base font-semibold text-white mb-1.5">I&apos;m a Landlord</div>
            <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              List for free. Collect rent through Paystack escrow. Reach tenants nationwide.
            </div>
            <div className="mt-4 text-sm font-semibold" style={{ color: '#F0A020' }}>Start listing →</div>
          </button>
          <button onClick={() => openAuth('TENANT')}
            className="border-2 rounded-2xl p-6 text-left transition-all duration-200 hover:-translate-y-1"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-base font-semibold text-white mb-1.5">I&apos;m a Tenant</div>
            <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Browse verified properties. Pay via Paystack escrow. No agent commission.
            </div>
            <div className="mt-4 text-sm font-semibold" style={{ color: '#5CC49A' }}>Start browsing →</div>
          </button>
        </div>

        {/* Trust */}
        <div className="flex flex-wrap gap-5 justify-center w-full pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { icon: '🛡️', text: 'Paystack Escrow protected' },
            { icon: '📉', text: 'Only 5% fee vs 20% agents' },
            { icon: '📍', text: '774 LGAs covered' },
            { icon: '📞', text: 'Direct landlord contact' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-xs"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              {icon}{' '}
              <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        <p className="mt-5 text-xs text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Already have an account?{' '}
          <button onClick={() => openAuth('LANDLORD')} className="font-medium" style={{ color: '#F0A020' }}>
            Landlord sign in
          </button>
          {' '}·{' '}
          <button onClick={() => openAuth('TENANT')} className="font-medium" style={{ color: '#F0A020' }}>
            Tenant sign in
          </button>
        </p>
      </div>

      {open && (
        <AuthModal
          role={role}
          onClose={() => setOpen(false)}
          onSuccess={(u) => {
            setOpen(false)
            router.push(u.role === 'LANDLORD' ? '/dashboard/landlord' : '/dashboard/tenant')
          }}
        />
      )}
    </main>
  )
}
