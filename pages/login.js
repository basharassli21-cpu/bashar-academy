import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang, useTheme } from './_app'
import { t } from '../lib/i18n'

// ── Brand colors — Forest Green ────────────────────────────────────────────
const G_DARK = {
  bg:      '#0A0F0A',
  bg2:     '#0D1A0D',
  bg3:     '#122012',
  gold:    '#4ADE80',
  goldL:   '#7AE89F',
  goldD:   '#22A35A',
  inkOnGold: '#0A150D',
  line:    'rgba(74,222,128,0.20)',
  lineS:   'rgba(232,240,232,0.08)',
  ink:     '#E8F0E8',
  muted:   '#8AAB8A',
  muted2:  '#5C6E5C',
}
const G_LIGHT = {
  bg:      '#F2F7F0',
  bg2:     '#FFFFFF',
  bg3:     '#E8F2E6',
  gold:    '#1C8A4D',
  goldL:   '#239B5A',
  goldD:   '#146238',
  inkOnGold: '#FFFFFF',
  line:    'rgba(28,138,77,0.20)',
  lineS:   'rgba(20,32,22,0.08)',
  ink:     '#142016',
  muted:   '#5B6B5B',
  muted2:  '#7A8A7A',
}
let G = G_DARK

function buildStyles(G) {
  return {
    page: {
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      background: G.bg,
      position: 'relative',
      overflow: 'hidden',
    },
    langBtn: {
      position: 'fixed', top: '20px', right: '20px',
      background: 'transparent',
      border: `1px solid ${G.line}`,
      borderRadius: '999px', padding: '5px 16px',
      color: G.gold, cursor: 'pointer', zIndex: 10,
      transition: '.25s',
      minWidth: '52px', textAlign: 'center',
    },
    themeBtn: {
      position: 'fixed', top: '20px', right: '92px',
      background: 'transparent',
      border: `1px solid ${G.line}`,
      borderRadius: '999px', padding: '5px 12px',
      cursor: 'pointer', zIndex: 10,
      fontSize: '15px', lineHeight: 1,
    },
    card: {
      position: 'relative', zIndex: 1,
      background: G.bg2,
      border: `1px solid ${G.line}`,
      borderRadius: '22px',
      padding: '40px 36px',
      width: '100%', maxWidth: '440px',
      boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.05)`,
    },
    logoMark: {
      width: '64px', height: '64px',
      border: `1px solid ${G.gold}`,
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
      position: 'relative',
      background: `radial-gradient(circle at 30% 30%, rgba(74,222,128,0.12), transparent)`,
    },
    fieldWrap: { marginBottom: '18px' },
    label: {
      display: 'block', fontSize: '12px', fontWeight: '600',
      color: G.muted, marginBottom: '8px', letterSpacing: '0.06em',
    },
    input: {
      width: '100%',
      background: G.bg3,
      border: `1px solid rgba(74,222,128,0.15)`,
      borderRadius: '12px',
      padding: '13px 16px',
      color: G.ink, fontSize: '15px',
      outline: 'none', transition: 'border .2s, box-shadow .2s',
      fontFamily: "'Tajawal', sans-serif",
    },
    eyeBtn: {
      position: 'absolute', top: '50%', transform: 'translateY(-50%)',
      background: 'none', border: 'none',
      color: G.muted2, cursor: 'pointer', padding: '4px',
      display: 'flex', alignItems: 'center',
    },
    submitBtn: {
      width: '100%', padding: '15px',
      background: `linear-gradient(160deg, ${G.goldL}, ${G.gold} 60%, ${G.goldD})`,
      border: 'none', borderRadius: '12px',
      color: G.inkOnGold, fontSize: '15px', fontWeight: '800',
      cursor: 'pointer', letterSpacing: '0.03em',
      boxShadow: `0 8px 28px -8px rgba(74,222,128,0.55)`,
      transition: 'transform .2s, box-shadow .2s',
      fontFamily: "'Tajawal', sans-serif",
    },
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  G = theme === 'light' ? G_LIGHT : G_DARK
  const S = buildStyles(G)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (!username || !password) {
      setError(lang === 'ar' ? 'يرجى إدخال بيانات الدخول' : 'Please enter your credentials')
      return
    }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: username.trim(), password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || (lang === 'ar' ? 'خطأ في تسجيل الدخول' : 'Login error')); setLoading(false); return }
      router.push(data.user.role === 'admin' ? '/admin' : data.user.role === 'employee' ? '/sales' : '/dashboard')
    } catch {
      setError(lang === 'ar' ? 'خطأ في الاتصال. حاول مرة ثانية.' : 'Connection error. Try again.')
      setLoading(false)
    }
  }

  const isRtl = lang === 'ar'

  return (
    <>
      <Head>
        <title>{lang === 'ar' ? 'تسجيل الدخول — بشار العسلي' : 'Login — Bashar Al-Asali'}</title>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Tajawal:wght@400;500;700;800&family=Cormorant+Garamond:ital,wght@1,500&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        * { margin:0; padding:0; box-sizing:border-box }
        body { background:${G.bg}; font-family:'Tajawal',system-ui,sans-serif; -webkit-font-smoothing:antialiased }
        input:-webkit-autofill { -webkit-box-shadow:0 0 0 40px ${G.bg3} inset !important; -webkit-text-fill-color:${G.ink} !important }
        input:focus { border-color:${G.gold} !important; box-shadow:0 0 0 3px rgba(74,222,128,0.12) !important }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .login-card { animation: fadeUp .6s cubic-bezier(.2,.7,.2,1) both }
        .logo-mark { animation: float 3.5s ease-in-out infinite }
        .spin { animation: spin .8s linear infinite }
      `}</style>

      <div style={S.page}>

        {/* ── Decorative glows ── */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', background:'radial-gradient(circle,rgba(74,222,128,0.09),transparent 65%)', filter:'blur(30px)' }} />
          <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle,rgba(74,222,128,0.06),transparent 65%)', filter:'blur(25px)' }} />
          <div style={{ position:'absolute', top:'40%', left:'30%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(74,222,128,0.04),transparent 65%)', filter:'blur(20px)' }} />
        </div>

        {/* ── Back to home ── */}
        <a href="/" style={{ position:'fixed', top:'20px', left:'20px', display:'flex', alignItems:'center', gap:'8px', color:G.muted, fontSize:'13px', fontWeight:'600', textDecoration:'none', zIndex:10, transition:'color .2s' }}
          onMouseEnter={e=>e.currentTarget.style.color=G.gold} onMouseLeave={e=>e.currentTarget.style.color=G.muted}>
          <span style={{ fontSize:'16px' }}>{isRtl ? '→' : '←'}</span>
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </a>

        {/* ── Theme toggle ── */}
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={S.themeBtn}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* ── Lang toggle ── */}
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={S.langBtn}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'16px' }}>
            {lang === 'ar' ? 'EN' : 'ع'}
          </span>
        </button>

        {/* ── Card ── */}
        <form onSubmit={handleLogin} className="login-card" style={S.card}>

          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div className="logo-mark" style={S.logoMark}>
              <span style={{ fontFamily:"'El Messiri',serif", fontSize:'24px', fontWeight:'700', color:G.gold }}>ب</span>
              <div style={{ position:'absolute', inset:'5px', border:`1px solid rgba(74,222,128,0.3)`, borderRadius:'50%' }} />
            </div>
            <h1 style={{ fontFamily:"'El Messiri',serif", fontSize:'20px', fontWeight:'700', color:G.ink, letterSpacing:'0.02em', marginBottom:'5px' }}>
              {lang === 'ar' ? 'بشار العسلي' : 'Bashar Al-Asali'}
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'14px', color:G.muted, letterSpacing:'0.15em' }}>
              EBAY ACADEMY
            </p>
            <div style={{ width:'40px', height:'1px', background:`linear-gradient(90deg,transparent,${G.gold},transparent)`, margin:'14px auto 0' }} />
          </div>

          {/* Title */}
          <div style={{ marginBottom:'24px' }}>
            <p style={{ fontSize:'13px', letterSpacing:'0.22em', color:G.gold, textTransform:'uppercase', fontWeight:'600', display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
              <span style={{ width:'22px', height:'1px', background:G.gold, display:'inline-block' }} />
              {lang === 'ar' ? 'منطقة الطلاب' : 'Student Area'}
            </p>
            <h2 style={{ fontFamily:"'El Messiri',serif", fontSize:'24px', fontWeight:'700', color:G.ink }}>
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(220,60,60,0.1)', border:'1px solid rgba(220,60,60,0.3)', borderRight:`3px solid #e05555`, borderRadius:'10px', padding:'11px 14px', color:'#e07070', fontSize:'13px', marginBottom:'18px', display:'flex', alignItems:'center', gap:'8px' }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Username */}
          <div style={S.fieldWrap}>
            <label style={S.label}>{t(lang, 'usernameLabel')}</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              style={{ ...S.input, textAlign: isRtl ? 'right' : 'left' }}
              placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'}
            />
          </div>

          {/* Password */}
          <div style={S.fieldWrap}>
            <label style={S.label}>{t(lang, 'passwordLabel')}</label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ ...S.input, marginBottom:0, paddingLeft: isRtl ? '16px' : '44px', paddingRight: isRtl ? '44px' : '16px' }}
                placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ ...S.eyeBtn, [isRtl ? 'right' : 'left']: '12px' }}>
                {showPass
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={S.submitBtn}>
            {loading
              ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  {lang === 'ar' ? 'جاري التحقق…' : 'Verifying…'}
                </span>
              : <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                  {lang === 'ar' ? 'دخول إلى الأكاديمية' : 'Enter the Academy'}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </span>
            }
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'22px 0' }}>
            <div style={{ flex:1, height:'1px', background:G.lineS }} />
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', color:G.muted2, fontSize:'14px' }}>✦</span>
            <div style={{ flex:1, height:'1px', background:G.lineS }} />
          </div>

          {/* Help */}
          <p style={{ textAlign:'center', fontSize:'13px', color:G.muted2, lineHeight:'1.7' }}>
            {lang === 'ar' ? 'تواجه مشكلة في الدخول؟ ' : 'Having trouble? '}
            <a href="https://wa.me/00962790360675" target="_blank" rel="noreferrer"
              style={{ color:G.gold, fontWeight:'700', textDecoration:'none' }}>
              {lang === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}
            </a>
          </p>

        </form>
      </div>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse }       = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getUser }     = await import('../lib/users-store')
  const cookies = parse(req.headers.cookie || '')
  const token   = cookies['ba_session']
  if (token) {
    const session = verifyToken(token)
    if (session) {
      const user = await getUser(session.username)
      if (user) return { redirect: { destination: user.role === 'admin' ? '/admin' : '/dashboard', permanent: false } }
    }
  }
  return { props: {} }
}

