import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang } from './_app'
import { t } from '../lib/i18n'

export default function LoginPage() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!username || !password) { setError(lang === 'ar' ? 'يرجى إدخال بيانات الدخول' : 'Please enter your credentials'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || (lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login error')); setLoading(false); return }
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch {
      setError(lang === 'ar' ? 'خطأ في الاتصال. حاول مرة ثانية.' : 'Connection error. Try again.')
      setLoading(false)
    }
  }

  const isRtl = lang === 'ar'

  return (
    <>
      <Head>
        <title>COACHBASHARALASALI — {t(lang, 'login')}</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={S.page}>
        <div style={S.blob1} />
        <div style={S.blob2} />
        <div style={S.blob3} />

        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={S.langBtn}>
          {t(lang, 'langToggle')}
        </button>

        <form onSubmit={handleLogin} style={S.card} className="fade-in">
          <div style={S.logoWrap}>
            <div style={S.logoCircle} className="float">
              <span style={{ fontSize: '30px' }}>🏪</span>
            </div>
            <h1 style={S.logoName}>COACHBASHARALASALI</h1>
            <p style={S.logoSub}>{t(lang, 'academyTagline')}</p>
            <div style={S.logoDivider} />
          </div>

          {error && (
            <div style={S.errorBox} className="fade-in">⚠️ {error}</div>
          )}

          <div style={S.fieldWrap}>
            <label style={S.label}>{t(lang, 'usernameLabel')}</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ ...S.input, textAlign: isRtl ? 'right' : 'left' }}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div style={S.fieldWrap}>
            <label style={S.label}>{t(lang, 'passwordLabel')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...S.input, marginBottom: 0, paddingLeft: isRtl ? '16px' : '44px', paddingRight: isRtl ? '44px' : '16px' }}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ ...S.eyeBtn, [isRtl ? 'right' : 'left']: '12px' }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...S.loginBtn, opacity: loading ? 0.75 : 1 }}>
            {loading ? t(lang, 'checking') : t(lang, 'enterBtn')}
          </button>

          <p style={S.help}>
            {t(lang, 'loginProblem')}{' '}
            <a href="https://wa.me/00962790360675" target="_blank" rel="noreferrer" style={{ color: '#B86BFF', fontWeight: '600' }}>
              {t(lang, 'contactUs')}
            </a>
          </p>
        </form>
      </div>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getUser } = await import('../lib/users-store')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['ba_session']
  if (token) {
    const session = verifyToken(token)
    if (session) {
      const user = await getUser(session.username)
      if (user) {
        return { redirect: { destination: user.role === 'admin' ? '/admin' : '/dashboard', permanent: false } }
      }
    }
  }
  return { props: {} }
}

const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', position: 'relative', overflow: 'hidden', background: '#0E0A14'
  },
  blob1: {
    position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(184,107,255,0.08) 0%, transparent 70%)',
    top: '-150px', right: '-100px', pointerEvents: 'none'
  },
  blob2: {
    position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,184,107,0.05) 0%, transparent 70%)',
    bottom: '-80px', left: '-80px', pointerEvents: 'none'
  },
  blob3: {
    position: 'fixed', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(43,27,58,0.6) 0%, transparent 70%)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none'
  },
  langBtn: {
    position: 'fixed', top: '16px', left: '16px',
    background: 'rgba(184,107,255,0.08)', border: '1px solid rgba(184,107,255,0.3)',
    borderRadius: '8px', color: '#B86BFF', padding: '6px 14px',
    fontSize: '13px', fontWeight: '700', cursor: 'pointer', zIndex: 10
  },
  card: {
    position: 'relative', zIndex: 1,
    background: 'rgba(43,27,58,0.5)',
    border: '1px solid rgba(184,107,255,0.2)',
    borderRadius: '24px', padding: '2.5rem 2rem',
    width: '100%', maxWidth: '420px',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 60px rgba(184,107,255,0.06)'
  },
  logoWrap: { textAlign: 'center', marginBottom: '2rem' },
  logoCircle: {
    width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 14px',
    background: 'linear-gradient(135deg, #2B1B3A, #1a0f28)',
    border: '2px solid rgba(184,107,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 24px rgba(184,107,255,0.25)'
  },
  logoName: {
    fontSize: '17px', fontWeight: '900', color: '#B86BFF',
    letterSpacing: '1.5px', marginBottom: '6px', fontFamily: 'Inter, sans-serif'
  },
  logoSub: { color: 'rgba(240,234,245,0.5)', fontSize: '13px' },
  logoDivider: {
    width: '50px', height: '2px', margin: '14px auto 0',
    background: 'linear-gradient(90deg, transparent, #B86BFF, transparent)'
  },
  errorBox: {
    background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
    borderRadius: '10px', padding: '10px 14px',
    color: '#FF4757', fontSize: '13px', marginBottom: '1rem', textAlign: 'center'
  },
  fieldWrap: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(240,234,245,0.55)', marginBottom: '6px' },
  input: {
    width: '100%',
    background: 'rgba(14,10,20,0.7)',
    border: '1px solid rgba(184,107,255,0.15)',
    borderRadius: '12px', padding: '13px 16px',
    color: '#F0EAF5', fontSize: '15px', outline: 'none',
    transition: 'border 0.2s'
  },
  eyeBtn: {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'rgba(240,234,245,0.35)',
    fontSize: '18px', cursor: 'pointer', padding: '4px'
  },
  loginBtn: {
    width: '100%', padding: '14px', marginTop: '8px',
    background: 'linear-gradient(135deg, #B86BFF, #9B4FE8)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '16px', fontWeight: '800',
    cursor: 'pointer', letterSpacing: '0.5px',
    boxShadow: '0 4px 24px rgba(184,107,255,0.35)',
    transition: 'transform 0.15s, box-shadow 0.15s'
  },
  help: { textAlign: 'center', marginTop: '1.2rem', fontSize: '13px', color: 'rgba(240,234,245,0.35)' }
}
