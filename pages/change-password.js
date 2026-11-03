import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [newPw, setNewPw]       = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (newPw.length < 8) return setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    if (newPw !== confirmPw) return setError('كلمتا المرور غير متطابقتان')

    setLoading(true)
    const res = await fetch('/api/auth/change-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: newPw }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'حدث خطأ'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <>
      <Head><title>تغيير كلمة المرور</title></Head>
      <div dir="rtl" style={{ minHeight:'100vh', background:'#0A0F0A', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:"'Cairo',sans-serif" }}>
        <div style={{ background:'#0D1A0D', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'20px', padding:'36px', maxWidth:'420px', width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <p style={{ fontSize:'36px', marginBottom:'12px' }}>🔐</p>
            <h1 style={{ color:'#4ADE80', fontWeight:'900', fontSize:'22px', marginBottom:'8px' }}>أنشئ كلمة مرور جديدة</h1>
            <p style={{ color:'#8AAB8A', fontSize:'13px' }}>مرحباً بك! يرجى تغيير كلمة المرور المبدئية قبل البدء.</p>
          </div>

          {error && (
            <div style={{ background:'rgba(240,128,122,0.15)', border:'1px solid rgba(240,128,122,0.4)', borderRadius:'10px', padding:'10px 14px', color:'#F0807A', fontSize:'13px', marginBottom:'16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={{ color:'#8AAB8A', fontSize:'12px', display:'block', marginBottom:'6px' }}>كلمة المرور الجديدة</label>
              <input
                type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} required
                placeholder="8 أحرف على الأقل"
                style={{ width:'100%', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', padding:'11px 14px', color:'#E8F0E8', fontSize:'14px', fontFamily:'inherit', boxSizing:'border-box', direction:'ltr' }}
              />
            </div>
            <div>
              <label style={{ color:'#8AAB8A', fontSize:'12px', display:'block', marginBottom:'6px' }}>تأكيد كلمة المرور</label>
              <input
                type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} required
                placeholder="أعد كتابة كلمة المرور"
                style={{ width:'100%', background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', padding:'11px 14px', color:'#E8F0E8', fontSize:'14px', fontFamily:'inherit', boxSizing:'border-box', direction:'ltr' }}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{ padding:'12px', borderRadius:'12px', background:loading?'rgba(74,222,128,0.15)':'#4ADE80', border:'none', color:loading?'#8AAB8A':'#0A0F0A', fontSize:'15px', fontWeight:'700', cursor:loading?'not-allowed':'pointer', marginTop:'4px' }}
            >
              {loading ? '⏳ جارٍ الحفظ...' : '✅ حفظ كلمة المرور والمتابعة'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const cookies = parse(req.headers.cookie || '')
  const session = verifyToken(cookies['ba_session'])
  // Must be logged in; non-students (admin/employee) don't need this page
  if (!session || session.role !== 'student') {
    return { redirect: { destination: session ? '/dashboard' : '/', permanent: false } }
  }
  return { props: {} }
}
