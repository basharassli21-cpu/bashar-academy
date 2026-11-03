import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useTheme } from './_app'
import OpenCPool from '../components/OpenCPool'

// ─── Brand Palette (Forest Green — matches dashboard.js) ──────────────────
const C_DARK = {
  navy:'#0A0F0A', gold:'#4ADE80', goldL:'#7AE89F', goldD:'#22A35A',
  blue:'#0F2F0F', surface:'#0D1A0D', emerald:'#34D399', silver:'#8AAB8A',
  locked:'#2A3A2A', white:'#E8F0E8', red:'#F0807A', purple:'#A78BFA',
  g10:'rgba(74,222,128,0.08)', g15:'rgba(74,222,128,0.12)',
  g20:'rgba(74,222,128,0.16)', g30:'rgba(74,222,128,0.26)',
  w10:'rgba(232,240,232,0.10)', w20:'rgba(232,240,232,0.20)',
  w40:'rgba(232,240,232,0.40)', w50:'rgba(232,240,232,0.50)',
}
const C_LIGHT = {
  navy:'#F2F7F0', gold:'#1C8A4D', goldL:'#239B5A', goldD:'#146238',
  blue:'#E8F2E6', surface:'#FFFFFF', emerald:'#0F9D6E', silver:'#5B6B5B',
  locked:'#D7DED5', white:'#142016', red:'#C0463F', purple:'#7C5FD1',
  g10:'rgba(28,138,77,0.06)', g15:'rgba(28,138,77,0.10)',
  g20:'rgba(28,138,77,0.12)', g30:'rgba(28,138,77,0.22)',
  w10:'rgba(20,32,22,0.06)', w20:'rgba(20,32,22,0.12)',
  w40:'rgba(20,32,22,0.25)', w50:'rgba(20,32,22,0.35)',
}

const PACKAGES = [
  { value: 'elite',        labelAr: 'الباقة الكاملة — Elite',        labelEn: 'Elite Package'        },
  { value: 'professional', labelAr: 'الباقة المتوسطة — Professional', labelEn: 'Professional Package' },
  { value: 'starter',      labelAr: 'باقة التنفيذ — Starter',         labelEn: 'Starter Package'      },
]

const STATUS_META = {
  new:           { ar:'جديد',            en:'New',            color:'silver'  },
  contacted:     { ar:'تم التواصل',       en:'Contacted',      color:'gold'    },
  interested:    { ar:'مهتم',             en:'Interested',     color:'emerald' },
  unreachable:   { ar:'لا يرد',           en:'Unreachable',    color:'purple'  },
  not_interested:{ ar:'غير مهتم',         en:'Not Interested', color:'red'     },
  closed_sale:   { ar:'تم البيع',         en:'Closed Sale',    color:'emerald' },
  cancelled:     { ar:'ألغى الفكرة',      en:'Cancelled',      color:'red'     },
}
const STATUS_ORDER = ['new','contacted','interested','unreachable','not_interested','closed_sale','cancelled']

function statusColor(key, C) {
  return { silver:C.silver, gold:C.gold, emerald:C.emerald, red:C.red, purple:C.purple }[STATUS_META[key]?.color] || C.silver
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-JO',{ year:'numeric', month:'short', day:'numeric' })
}
function monthName(m) {
  return ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][m-1] || m
}

// ─── Shared Sidebar ───────────────────────────────────────────────────────
function Sidebar({ C, user, view, setView, onLogout, navItems, collapsed, setCollapsed }) {
  return (
    <aside dir="rtl" style={{
      position:'fixed', right:0, top:0, height:'100%', width:collapsed?'72px':'240px',
      background:C.surface, borderLeft:`1px solid ${C.g20}`,
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      zIndex:40, boxShadow:'-4px 0 30px rgba(0,0,0,0.4)',
      transition:'width 0.2s', overflow:'hidden',
    }}>
      <div>
        <div style={{ padding:collapsed?'20px 0 16px':'20px 20px 16px', borderBottom:`1px solid ${C.g20}`, display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between' }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', border:`1px solid ${C.gold}`, background:C.g15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:C.gold, fontWeight:'700', fontSize:'18px' }}>ب</span>
              </div>
              <div>
                <p style={{ color:C.gold, fontWeight:'900', fontSize:'12px', marginBottom:'2px' }}>بشار العسلي</p>
                <p style={{ color:C.silver, fontSize:'11px' }}>EBAY ACADEMY</p>
              </div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{ width:'28px', height:'28px', borderRadius:'7px', background:'none', border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>☰</button>
        </div>

        {!collapsed && (
          <div style={{ padding:'12px 16px 8px', borderBottom:`1px solid ${C.g10}` }}>
            <p style={{ color:C.silver, fontSize:'11px' }}>مرحباً،</p>
            <p style={{ color:C.white, fontWeight:'700', fontSize:'13px' }}>{user.name}</p>
            <p style={{ color:C.silver, fontSize:'11px' }}>@{user.username}</p>
          </div>
        )}

        <nav style={{ padding:'10px', display:'flex', flexDirection:'column', gap:'4px' }}>
          {navItems.map((item, i) => {
            const active = view === item.id
            return (
              <button key={i} onClick={() => setView(item.id)} title={collapsed?item.label:undefined} style={{
                display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start',
                gap:'12px', padding:collapsed?'10px':'10px 14px', borderRadius:'12px',
                background:active?C.g20:'transparent', border:`1px solid ${active?C.g30:'transparent'}`,
                color:active?C.gold:C.silver, fontSize:'13px', fontWeight:'600', cursor:'pointer', width:'100%',
              }}>
                <span style={{ fontSize:'18px', flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex:1, textAlign:'right' }}>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>

      <div style={{ padding:collapsed?'12px 8px':'12px', borderTop:`1px solid ${C.g20}` }}>
        <button onClick={onLogout} title={collapsed?'تسجيل الخروج':undefined} style={{
          width:'100%', padding:collapsed?'8px':' 8px 14px', borderRadius:'10px',
          background:'none', border:`1px solid ${C.red}33`, color:C.red,
          fontSize:'12px', fontWeight:'600', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:'8px',
        }}>
          <span>🚪</span>
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Add Sale Form (Employee) ─────────────────────────────────────────────
function AddSaleForm({ C, onSuccess, onCancel }) {
  const [studentName, setStudentName]   = useState('')
  const [studentPhone, setStudentPhone] = useState('')
  const [packageName, setPackageName]   = useState('')
  const [notes, setNotes]               = useState('')
  const [proofFile, setProofFile]       = useState(null)
  const [previewUrl, setPreviewUrl]     = useState(null)
  const [uploading, setUploading]       = useState(false)
  const [error, setError]               = useState('')
  const fileRef = useRef()

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('حجم الصورة يجب أن يكون أقل من 10MB'); return }
    setProofFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!studentName.trim()) return setError('اسم الطالب مطلوب')
    if (!studentPhone.trim()) return setError('رقم الهاتف مطلوب')
    if (!packageName) return setError('الرجاء اختيار الباقة')
    if (!proofFile) return setError('صورة إثبات البيعة مطلوبة')

    setUploading(true)
    try {
      // 1. Upload proof image
      const base64 = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(proofFile)
      })
      const upRes = await fetch('/api/sales/upload', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ base64, contentType: proofFile.type, filename: proofFile.name }),
      })
      if (!upRes.ok) {
        const d = await upRes.json()
        throw new Error(d.error || 'فشل رفع الصورة')
      }
      const { url: proofImageUrl } = await upRes.json()

      // 2. Create sale record + student account
      const saleRes = await fetch('/api/sales/records', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ studentName, studentPhone, packageName, notes, proofImageUrl }),
      })
      const saleData = await saleRes.json()
      if (!saleRes.ok) throw new Error(saleData.error || 'فشل تسجيل البيعة')

      onSuccess(saleData)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'10px', padding:'10px 14px', color:C.white, fontSize:'14px', width:'100%', outline:'none', boxSizing:'border-box', fontFamily:'inherit', direction:'rtl' }

  return (
    <form onSubmit={handleSubmit} dir="rtl" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {error && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:'10px', padding:'10px 14px', color:C.red, fontSize:'13px' }}>{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
        <div>
          <label style={{ color:C.silver, fontSize:'12px', display:'block', marginBottom:'6px' }}>اسم الطالب كاملاً *</label>
          <input style={inp} placeholder="أحمد محمد العلي" value={studentName} onChange={e=>setStudentName(e.target.value)} required />
        </div>
        <div>
          <label style={{ color:C.silver, fontSize:'12px', display:'block', marginBottom:'6px' }}>رقم الهاتف *</label>
          <input style={inp} placeholder="0791234567" value={studentPhone} onChange={e=>setStudentPhone(e.target.value)} required dir="ltr" />
          <p style={{ color:C.silver, fontSize:'11px', marginTop:'4px' }}>أردني: 077/078/079</p>
        </div>
      </div>

      <div>
        <label style={{ color:C.silver, fontSize:'12px', display:'block', marginBottom:'6px' }}>الباقة *</label>
        <select style={{ ...inp, appearance:'none' }} value={packageName} onChange={e=>setPackageName(e.target.value)} required>
          <option value="">— اختر الباقة —</option>
          {PACKAGES.map(p => <option key={p.value} value={p.value}>{p.labelAr}</option>)}
        </select>
      </div>

      <div>
        <label style={{ color:C.silver, fontSize:'12px', display:'block', marginBottom:'6px' }}>ملاحظات (اختياري)</label>
        <textarea style={{ ...inp, resize:'vertical', minHeight:'80px' }} placeholder="أي تفاصيل إضافية..." value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>

      <div>
        <label style={{ color:C.silver, fontSize:'12px', display:'block', marginBottom:'6px' }}>صورة إثبات البيعة *</label>
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border:`2px dashed ${proofFile?C.gold:C.g30}`, borderRadius:'12px', padding:'20px', textAlign:'center', cursor:'pointer', background:proofFile?C.g10:'transparent', transition:'all 0.2s' }}
        >
          {previewUrl ? (
            <div>
              <img src={previewUrl} alt="إثبات البيعة" style={{ maxWidth:'100%', maxHeight:'200px', borderRadius:'8px', marginBottom:'8px' }} />
              <p style={{ color:C.gold, fontSize:'12px' }}>✅ تم اختيار الصورة — انقر للتغيير</p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize:'28px', marginBottom:'8px' }}>📷</p>
              <p style={{ color:C.white, fontSize:'13px', fontWeight:'600' }}>انقر لاختيار صورة الإثبات</p>
              <p style={{ color:C.silver, fontSize:'11px', marginTop:'4px' }}>JPG, PNG, WebP — بحد أقصى 10MB</p>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
      </div>

      <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'8px' }}>
        <button type="button" onClick={onCancel} style={{ padding:'10px 20px', borderRadius:'10px', background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:'13px', cursor:'pointer' }}>
          إلغاء
        </button>
        <button type="submit" disabled={uploading} style={{ padding:'10px 28px', borderRadius:'10px', background:uploading?C.g15:C.gold, border:'none', color:uploading?C.silver:C.navy, fontSize:'14px', fontWeight:'700', cursor:uploading?'not-allowed':'pointer', opacity:uploading?0.7:1 }}>
          {uploading ? '⏳ جارٍ الحفظ...' : '✅ تسجيل البيعة'}
        </button>
      </div>
    </form>
  )
}

// ─── Success Modal after adding a sale ───────────────────────────────────
function SuccessModal({ C, data, onClose }) {
  const { studentAccount, record } = data
  const isNew = studentAccount.created
  const isExisting = studentAccount.existing

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'20px' }}>
      <div dir="rtl" style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:'20px', padding:'32px', maxWidth:'480px', width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'48px', marginBottom:'12px' }}>🎉</div>
          <h2 style={{ color:C.gold, fontWeight:'900', fontSize:'20px', marginBottom:'6px' }}>تم تسجيل البيعة بنجاح!</h2>
          <p style={{ color:C.silver, fontSize:'13px' }}>{fmtDate(record.created_at)}</p>
        </div>

        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'14px', padding:'18px', marginBottom:'20px' }}>
          <p style={{ color:C.silver, fontSize:'11px', marginBottom:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px' }}>بيانات دخول الطالب</p>
          <div style={{ display:'grid', gap:'10px' }}>
            <Row C={C} label="اسم الطالب" value={studentAccount.studentName} />
            <Row C={C} label="اسم المستخدم (Username)" value={studentAccount.username} mono />
            <Row C={C} label="كلمة المرور المبدئية" value={studentAccount.password} mono />
            <Row C={C} label="الباقة" value={PACKAGES.find(p=>p.value===record.package_name)?.labelAr || record.package_name} />
          </div>
        </div>

        {isExisting && (
          <div style={{ background:`${C.purple}20`, border:`1px solid ${C.purple}40`, borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', color:C.purple, fontSize:'13px' }}>
            ℹ️ الطالب لديه حساب مسبقاً — تم ربط البيعة بحسابه الموجود.
          </div>
        )}
        {isNew && (
          <div style={{ background:`${C.emerald}15`, border:`1px solid ${C.emerald}40`, borderRadius:'10px', padding:'10px 14px', marginBottom:'16px', color:C.emerald, fontSize:'13px' }}>
            ✅ تم إنشاء حساب جديد للطالب — سيُطلب منه تغيير كلمة المرور عند أول دخول.
          </div>
        )}

        <button onClick={onClose} style={{ width:'100%', padding:'12px', borderRadius:'12px', background:C.gold, border:'none', color:C.navy, fontSize:'15px', fontWeight:'700', cursor:'pointer' }}>
          حسناً
        </button>
      </div>
    </div>
  )
}

function Row({ C, label, value, mono }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
      <span style={{ color:C.silver, fontSize:'12px', flexShrink:0 }}>{label}</span>
      <span style={{ color:C.white, fontSize:'13px', fontWeight:'700', fontFamily:mono?'monospace':'inherit', background:mono?C.g10:'transparent', padding:mono?'2px 8px':'0', borderRadius:mono?'6px':'0', direction:'ltr' }}>{value}</span>
    </div>
  )
}

// ─── My Sales List (Employee) ────────────────────────────────────────────
function MySalesList({ C, employeeId }) {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [month, setMonth]         = useState(new Date().getMonth() + 1)
  const [year, setYear]           = useState(new Date().getFullYear())
  const [expanded, setExpanded]   = useState(null)

  useEffect(() => { load() }, [month, year])

  async function load() {
    setLoading(true)
    const r = await fetch(`/api/sales/records?month=${month}&year=${year}`)
    const d = await r.json()
    setRecords(d.records || [])
    setTotal(d.total || 0)
    setLoading(false)
  }

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1]
  const months = Array.from({length:12}, (_,i) => i+1)

  return (
    <div dir="rtl">
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'7px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          {months.map(m => <option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'7px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ marginRight:'auto', background:C.g15, border:`1px solid ${C.g30}`, borderRadius:'8px', padding:'7px 14px', color:C.gold, fontSize:'13px', fontWeight:'700' }}>
          إجمالي: {total} بيعة
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:C.silver }}>جارٍ التحميل...</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:C.silver }}>
          <p style={{ fontSize:'32px', marginBottom:'12px' }}>📋</p>
          <p>لا توجد بيعات في هذه الفترة</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {records.map(r => (
            <div key={r.id} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'14px', overflow:'hidden' }}>
              <div onClick={() => setExpanded(expanded===r.id?null:r.id)} style={{ padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:C.g20, border:`1px solid ${C.g30}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:'700', fontSize:'16px', flexShrink:0 }}>
                  {r.student_name[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:C.white, fontWeight:'700', fontSize:'14px', marginBottom:'2px' }}>{r.student_name}</p>
                  <p style={{ color:C.silver, fontSize:'12px' }}>{r.student_phone} — {PACKAGES.find(p=>p.value===r.package_name)?.labelAr}</p>
                </div>
                <div style={{ textAlign:'left', flexShrink:0 }}>
                  <p style={{ color:C.gold, fontSize:'12px', fontWeight:'600' }}>{fmtDate(r.sale_date)}</p>
                  {r.student_account_created && <span style={{ fontSize:'10px', color:C.emerald }}>✅ حساب جديد</span>}
                  {r.student_account_existing && <span style={{ fontSize:'10px', color:C.purple }}>🔗 حساب موجود</span>}
                </div>
                <span style={{ color:C.silver, fontSize:'16px' }}>{expanded===r.id?'▲':'▼'}</span>
              </div>

              {expanded === r.id && (
                <div style={{ padding:'0 18px 16px', borderTop:`1px solid ${C.g15}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px', paddingTop:'12px' }}>
                    <InfoCell C={C} label="اسم المستخدم" value={r.student_username || '—'} mono />
                    <InfoCell C={C} label="كلمة المرور المبدئية" value={r.student_username || '—'} mono />
                    {r.notes && <InfoCell C={C} label="ملاحظات" value={r.notes} span />}
                  </div>
                  {r.proof_image_url && (
                    <div>
                      <p style={{ color:C.silver, fontSize:'11px', marginBottom:'8px' }}>صورة الإثبات:</p>
                      <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer">
                        <img src={r.proof_image_url} alt="إثبات البيعة" style={{ maxWidth:'100%', maxHeight:'300px', borderRadius:'10px', border:`1px solid ${C.g20}` }} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function InfoCell({ C, label, value, mono, span }) {
  return (
    <div style={{ gridColumn:span?'1/-1':'auto' }}>
      <p style={{ color:C.silver, fontSize:'11px', marginBottom:'3px' }}>{label}</p>
      <p style={{ color:C.white, fontSize:'13px', fontWeight:'600', fontFamily:mono?'monospace':'inherit', direction:mono?'ltr':'inherit' }}>{value}</p>
    </div>
  )
}

// ─── Employee Portal ──────────────────────────────────────────────────────
function EmployeePortal({ C, user }) {
  const [view, setView]         = useState('my_sales')
  const [showForm, setShowForm] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [salesCount, setSalesCount] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const m = new Date().getMonth()+1, y = new Date().getFullYear()
    fetch(`/api/sales/records?month=${m}&year=${y}`)
      .then(r=>r.json()).then(d=>setSalesCount(d.total||0))
  }, [])

  function handleSaleSuccess(data) {
    setShowForm(false)
    setSuccessData(data)
    setSalesCount(c => c+1)
  }

  const navItems = [
    { id:'my_sales', icon:'📋', label:'بيعاتي' },
    { id:'leads',    icon:'🎯', label:'العملاء المحتملون' },
    { id:'openc',    icon:'♻️', label:'OpenC' },
  ]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' })
    window.location.href = '/'
  }

  const sidebarW = collapsed ? 72 : 240

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.navy, fontFamily:"'Cairo',sans-serif" }}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={handleLogout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{ flex:1, marginRight:`${sidebarW}px`, transition:'margin 0.2s', display:'flex', flexDirection:'column' }}>
        {/* Header */}
        <header style={{ background:C.surface, borderBottom:`1px solid ${C.g20}`, padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <span style={{ color:C.gold, fontWeight:'700', fontSize:'16px' }}>
            {view==='my_sales'?'بيعاتي':view==='leads'?'العملاء المحتملون':'OpenC'}
          </span>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ background:C.g15, border:`1px solid ${C.g30}`, borderRadius:'20px', padding:'4px 14px', color:C.gold, fontSize:'12px', fontWeight:'700' }}>
              {salesCount} بيعة هذا الشهر
            </div>
            {view === 'my_sales' && (
              <button onClick={() => setShowForm(true)} style={{ padding:'8px 18px', borderRadius:'10px', background:C.gold, border:'none', color:C.navy, fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                ＋ بيعة جديدة
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ padding:'24px', flex:1 }}>
          {view === 'my_sales' && <MySalesList C={C} />}
          {view === 'leads' && <LeadsView C={C} />}
          {view === 'openc' && <OpenCPool C={C} lang="ar" role="employee" currentEmployee={user} />}
        </div>
      </main>

      {/* Add Sale Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:'20px', overflowY:'auto' }}>
          <div dir="rtl" style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:'20px', padding:'28px', maxWidth:'560px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ color:C.white, fontWeight:'900', fontSize:'18px' }}>تسجيل بيعة جديدة</h2>
              <button onClick={() => setShowForm(false)} style={{ width:'32px', height:'32px', borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:'16px' }}>✕</button>
            </div>
            <AddSaleForm C={C} onSuccess={handleSaleSuccess} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {successData && <SuccessModal C={C} data={successData} onClose={() => setSuccessData(null)} />}
    </div>
  )
}

// ─── Leads View (shared between employee & admin) ─────────────────────────
const STATUS_ORDER_LEADS = ['new','contacted','interested','unreachable','not_interested','closed_sale','cancelled']

function LeadsView({ C }) {
  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [busy, setBusy]         = useState(null)
  const [search, setSearch]     = useState('')

  async function fetchLeads() {
    setLoading(true)
    const r = await fetch('/api/sales/leads')
    if (r.ok) { const d = await r.json(); setLeads(d.leads || []) }
    setLoading(false)
  }
  useEffect(() => { fetchLeads() }, [])

  async function update(id, body) {
    setBusy(id)
    await fetch(`/api/sales/leads/${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    await fetchLeads()
    setBusy(null)
  }

  const filtered = leads.filter(l => !search || l.customer_name?.includes(search) || l.phone?.includes(search))

  if (loading) return <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>جارٍ التحميل...</div>

  return (
    <div dir="rtl">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم العميل أو الرقم..." style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'10px', padding:'10px 14px', color:C.white, fontSize:'14px', marginBottom:'16px', fontFamily:'inherit', boxSizing:'border-box' }} />
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>لا توجد عملاء</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map(lead => (
            <LeadCard key={lead.id} C={C} lead={lead} expanded={expanded===lead.id} busy={busy===lead.id}
              onToggle={() => setExpanded(expanded===lead.id?null:lead.id)}
              onUpdate={(body) => update(lead.id, body)} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeadCard({ C, lead, expanded, busy, onToggle, onUpdate }) {
  const [status, setStatus]   = useState(lead.status)
  const [note, setNote]       = useState('')
  const [noteType, setNoteType] = useState('note')
  const [nextDate, setNextDate] = useState(lead.next_followup_date || '')

  const color = statusColor(lead.status, C)
  const locked = lead.locked

  return (
    <div style={{ background:locked?C.locked:C.g10, border:`1px solid ${locked?'transparent':C.g20}`, borderRadius:'12px', opacity:locked?0.6:1 }}>
      <div onClick={locked?undefined:onToggle} style={{ padding:'12px 16px', cursor:locked?'default':'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:color, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <span style={{ color:C.white, fontWeight:'700', fontSize:'14px' }}>{lead.customer_name}</span>
          <span style={{ color:C.silver, fontSize:'12px', marginRight:'10px' }}>{lead.phone}</span>
        </div>
        <span style={{ color, fontSize:'11px', background:`${color}20`, padding:'2px 8px', borderRadius:'20px' }}>
          {STATUS_META[lead.status]?.ar}
        </span>
        {locked && <span style={{ color:C.silver, fontSize:'11px' }}>🔒</span>}
        {!locked && <span style={{ color:C.silver, fontSize:'14px' }}>{expanded?'▲':'▼'}</span>}
      </div>

      {expanded && !locked && (
        <div style={{ padding:'0 16px 16px', borderTop:`1px solid ${C.g15}` }}>
          {lead.notes?.length > 0 && (
            <div style={{ marginTop:'12px', marginBottom:'12px' }}>
              {lead.notes.map((n, i) => (
                <div key={i} style={{ background:C.g10, borderRadius:'8px', padding:'8px 12px', marginBottom:'6px', fontSize:'12px', color:C.silver }}>
                  {n.text}
                </div>
              ))}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop:'12px' }}>
            <select value={status} onChange={e=>setStatus(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 10px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
              {STATUS_ORDER_LEADS.map(s => <option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}
            </select>
            <input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 10px', color:C.white, fontSize:'13px', fontFamily:'inherit' }} />
          </div>

          <select value={noteType} onChange={e=>setNoteType(e.target.value)} style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 10px', color:C.white, fontSize:'13px', fontFamily:'inherit', marginTop:'8px' }}>
            <option value="note">📝 ملاحظة</option>
            <option value="call">📞 مكالمة</option>
            <option value="whatsapp">💬 واتساب</option>
            <option value="meeting">🤝 اجتماع</option>
          </select>

          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="أضف ملاحظة..." style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 10px', color:C.white, fontSize:'13px', fontFamily:'inherit', resize:'vertical', minHeight:'70px', marginTop:'8px', boxSizing:'border-box', direction:'rtl' }} />

          <button disabled={busy} onClick={() => onUpdate({ status, note:note.trim()||undefined, nextFollowupDate:nextDate||undefined, noteType })} style={{ width:'100%', marginTop:'8px', padding:'9px', borderRadius:'8px', background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:'13px', fontWeight:'700', cursor:busy?'not-allowed':'pointer' }}>
            {busy?'⏳ جارٍ الحفظ...':'💾 حفظ التغييرات'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Admin Sales Records View ─────────────────────────────────────────────
function AdminSalesView({ C, employees }) {
  const [records, setRecords]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [total, setTotal]       = useState(0)
  const [empFilter, setEmpFilter] = useState('')
  const [month, setMonth]       = useState(new Date().getMonth()+1)
  const [year, setYear]         = useState(new Date().getFullYear())
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { load() }, [empFilter, month, year])

  async function load() {
    setLoading(true)
    let url = `/api/sales/records?month=${month}&year=${year}`
    if (empFilter) url += `&employeeId=${empFilter}`
    const r = await fetch(url)
    const d = await r.json()
    setRecords(d.records || [])
    setTotal(d.total || 0)
    setLoading(false)
  }

  const years = [new Date().getFullYear(), new Date().getFullYear()-1]
  const months = Array.from({length:12},(_,i)=>i+1)

  return (
    <div dir="rtl">
      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center' }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'7px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'7px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'7px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          <option value="">جميع الموظفين</option>
          {employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div style={{ background:C.g15, border:`1px solid ${C.g30}`, borderRadius:'8px', padding:'7px 14px', color:C.gold, fontSize:'13px', fontWeight:'700', marginRight:'auto' }}>
          الإجمالي: {total} بيعة
        </div>
      </div>

      {/* Stats per employee */}
      {!empFilter && employees.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:'10px', marginBottom:'24px' }}>
          {employees.map(e => {
            const cnt = records.filter(r=>r.employee_id===e.id).length
            return (
              <div key={e.id} onClick={() => setEmpFilter(String(e.id))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'12px', padding:'14px', cursor:'pointer', textAlign:'center' }}>
                <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:C.g20, margin:'0 auto 8px', display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:'700' }}>{e.name[0]}</div>
                <p style={{ color:C.white, fontSize:'13px', fontWeight:'700', marginBottom:'4px' }}>{e.name}</p>
                <p style={{ color:C.gold, fontSize:'22px', fontWeight:'900' }}>{cnt}</p>
                <p style={{ color:C.silver, fontSize:'11px' }}>بيعة</p>
              </div>
            )
          })}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>جارٍ التحميل...</div>
      ) : records.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>
          <p style={{ fontSize:'32px', marginBottom:'12px' }}>📋</p>
          <p>لا توجد بيعات في هذه الفترة</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {records.map(r => (
            <div key={r.id} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'14px', overflow:'hidden' }}>
              <div onClick={()=>setExpanded(expanded===r.id?null:r.id)} style={{ padding:'14px 18px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:C.g20, border:`1px solid ${C.g30}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:'700', fontSize:'16px', flexShrink:0 }}>{r.student_name[0]}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ color:C.white, fontWeight:'700', fontSize:'14px', marginBottom:'2px' }}>{r.student_name}</p>
                  <p style={{ color:C.silver, fontSize:'12px' }}>{r.student_phone} — {PACKAGES.find(p=>p.value===r.package_name)?.labelAr}</p>
                </div>
                <div style={{ textAlign:'left', flexShrink:0 }}>
                  <p style={{ color:C.silver, fontSize:'11px', marginBottom:'3px' }}>{r.employee_name}</p>
                  <p style={{ color:C.gold, fontSize:'12px' }}>{fmtDate(r.sale_date)}</p>
                </div>
                <span style={{ color:C.silver, fontSize:'16px' }}>{expanded===r.id?'▲':'▼'}</span>
              </div>
              {expanded === r.id && (
                <div style={{ padding:'0 18px 16px', borderTop:`1px solid ${C.g15}` }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', paddingTop:'12px', marginBottom:'12px' }}>
                    <InfoCell C={C} label="الموظف" value={r.employee_name} />
                    <InfoCell C={C} label="اسم المستخدم" value={r.student_username||'—'} mono />
                    <InfoCell C={C} label="رقم الهاتف" value={r.student_phone} />
                    <InfoCell C={C} label="حالة الحساب" value={r.student_account_created?'✅ حساب جديد':r.student_account_existing?'🔗 موجود مسبقاً':'—'} />
                    {r.notes && <InfoCell C={C} label="ملاحظات" value={r.notes} span />}
                  </div>
                  {r.proof_image_url && (
                    <div>
                      <p style={{ color:C.silver, fontSize:'11px', marginBottom:'8px' }}>صورة الإثبات:</p>
                      <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer">
                        <img src={r.proof_image_url} alt="إثبات البيعة" style={{ maxWidth:'100%', maxHeight:'300px', borderRadius:'10px', border:`1px solid ${C.g20}` }} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Admin Employees View ─────────────────────────────────────────────────
function AdminEmployeesView({ C, onEmployeesChange }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ username:'', password:'', name:'', monthlyTarget:0 })
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')

  async function load() {
    setLoading(true)
    const r = await fetch('/api/admin/employees')
    const d = await r.json()
    setEmployees(d.employees||[])
    if (onEmployeesChange) onEmployeesChange(d.employees||[])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function create(e) {
    e.preventDefault(); setError(''); setBusy(true)
    const r = await fetch('/api/admin/employees', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setError(d.error); setBusy(false); return }
    setShowForm(false); setForm({ username:'', password:'', name:'', monthlyTarget:0 }); await load(); setBusy(false)
  }

  async function del(id, name) {
    if (!confirm(`حذف الموظف "${name}"؟ هذا لا يمكن التراجع عنه.`)) return
    await fetch('/api/admin/employees', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    load()
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'9px 12px', color:C.white, fontSize:'13px', width:'100%', fontFamily:'inherit', boxSizing:'border-box', direction:'rtl' }

  return (
    <div dir="rtl">
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'16px' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'9px 20px', borderRadius:'10px', background:C.gold, border:'none', color:C.navy, fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
          {showForm ? '✕ إلغاء' : '＋ موظف جديد'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'14px', padding:'20px', marginBottom:'20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {error && <div style={{ gridColumn:'1/-1', color:C.red, fontSize:'13px', padding:'8px 12px', background:`${C.red}15`, borderRadius:'8px' }}>{error}</div>}
          <div><label style={{ color:C.silver, fontSize:'11px', display:'block', marginBottom:'5px' }}>الاسم *</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div><label style={{ color:C.silver, fontSize:'11px', display:'block', marginBottom:'5px' }}>اسم المستخدم *</label><input style={{ ...inp, direction:'ltr' }} value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></div>
          <div><label style={{ color:C.silver, fontSize:'11px', display:'block', marginBottom:'5px' }}>كلمة المرور * (12 حرف+)</label><input type="password" style={{ ...inp, direction:'ltr' }} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
          <div><label style={{ color:C.silver, fontSize:'11px', display:'block', marginBottom:'5px' }}>الهدف الشهري</label><input type="number" style={inp} value={form.monthlyTarget} onChange={e=>setForm({...form,monthlyTarget:Number(e.target.value)})} min="0" /></div>
          <div style={{ gridColumn:'1/-1', display:'flex', justifyContent:'flex-end' }}>
            <button type="submit" disabled={busy} style={{ padding:'9px 24px', borderRadius:'8px', background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:'13px', fontWeight:'700', cursor:busy?'not-allowed':'pointer' }}>
              {busy?'⏳ جارٍ الحفظ...':'✅ إضافة'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:C.silver }}>جارٍ التحميل...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {employees.map(emp => (
            <div key={emp.id} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'12px', padding:'14px 18px', display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:C.g20, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:'700', fontSize:'16px', flexShrink:0 }}>{emp.name[0]}</div>
              <div style={{ flex:1 }}>
                <p style={{ color:C.white, fontWeight:'700', fontSize:'14px' }}>{emp.name}</p>
                <p style={{ color:C.silver, fontSize:'12px' }}>@{emp.username}</p>
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ color:C.gold, fontSize:'16px', fontWeight:'900' }}>{emp.stats?.closedSales || 0}</p>
                <p style={{ color:C.silver, fontSize:'11px' }}>بيعة هذا الشهر</p>
              </div>
              <button onClick={() => del(emp.id, emp.name)} style={{ width:'32px', height:'32px', borderRadius:'8px', background:`${C.red}15`, border:`1px solid ${C.red}40`, color:C.red, cursor:'pointer', fontSize:'14px', flexShrink:0 }}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Admin Portal ─────────────────────────────────────────────────────────
function AdminPortal({ C, user }) {
  const [view, setView]         = useState('sales')
  const [employees, setEmployees] = useState([])
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { id:'sales',     icon:'💰', label:'سجل البيعات' },
    { id:'leads',     icon:'🎯', label:'العملاء المحتملون' },
    { id:'employees', icon:'👥', label:'الموظفون' },
    { id:'openc',     icon:'♻️', label:'OpenC' },
  ]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' })
    window.location.href = '/'
  }

  const sidebarW = collapsed ? 72 : 240

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.navy, fontFamily:"'Cairo',sans-serif" }}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={handleLogout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main style={{ flex:1, marginRight:`${sidebarW}px`, transition:'margin 0.2s', display:'flex', flexDirection:'column' }}>
        <header style={{ background:C.surface, borderBottom:`1px solid ${C.g20}`, padding:'0 24px', height:'60px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <span style={{ color:C.gold, fontWeight:'700', fontSize:'16px' }}>
            {view==='sales'?'سجل البيعات':view==='leads'?'العملاء المحتملون':view==='employees'?'إدارة الموظفين':'OpenC'}
          </span>
          <span style={{ color:C.silver, fontSize:'13px' }}>مرحباً، {user.name}</span>
        </header>

        <div style={{ padding:'24px', flex:1 }}>
          {view === 'sales'     && <AdminSalesView C={C} employees={employees} />}
          {view === 'leads'     && <AdminLeadsView C={C} />}
          {view === 'employees' && <AdminEmployeesView C={C} onEmployeesChange={setEmployees} />}
          {view === 'openc'     && <OpenCPool C={C} lang="ar" role="admin" />}
        </div>
      </main>
    </div>
  )
}

// Admin version of leads view (can see all employees' leads) — uses same component but with admin API
function AdminLeadsView({ C }) {
  const [allLeads, setAllLeads]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [empFilter, setEmpFilter]   = useState('')
  const [employees, setEmployees]   = useState([])
  const [search, setSearch]         = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/employees').then(r=>r.json()),
      fetch('/api/admin/leads').then(r=>r.json()),
    ]).then(([empData, leadsData]) => {
      setEmployees(empData.employees||[])
      setAllLeads(leadsData.leads||[])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = allLeads.filter(l => {
    if (empFilter && String(l.employee_id) !== empFilter) return false
    if (search && !l.customer_name?.includes(search) && !l.phone?.includes(search)) return false
    return true
  })

  if (loading) return <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>جارٍ التحميل...</div>

  return (
    <div dir="rtl">
      <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث..." style={{ flex:1, minWidth:'200px', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }} />
        <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'8px', padding:'8px 12px', color:C.white, fontSize:'13px', fontFamily:'inherit' }}>
          <option value="">جميع الموظفين ({allLeads.length} عميل)</option>
          {employees.map(e=><option key={e.id} value={String(e.id)}>{e.name} ({allLeads.filter(l=>l.employee_id===e.id).length})</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:C.silver }}>لا توجد نتائج</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          {filtered.map(l => (
            <div key={l.id} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:'10px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:statusColor(l.status,C), flexShrink:0 }} />
              <span style={{ color:C.white, fontWeight:'600', flex:1 }}>{l.customer_name}</span>
              <span style={{ color:C.silver, fontSize:'12px' }}>{l.phone}</span>
              <span style={{ color:statusColor(l.status,C), fontSize:'11px', background:`${statusColor(l.status,C)}20`, padding:'2px 8px', borderRadius:'20px' }}>{STATUS_META[l.status]?.ar}</span>
              <span style={{ color:C.silver, fontSize:'11px' }}>{employees.find(e=>e.id===l.employee_id)?.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SalesPage({ initialUser }) {
  const { theme } = useTheme()
  const C = theme === 'dark' ? C_DARK : C_LIGHT

  return (
    <>
      <Head>
        <title>نظام المبيعات — Bashar Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${C.navy}; }
          select option { background: #1a2a1a; color: #e8f0e8; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: ${C.g20}; border-radius: 3px; }
        `}</style>
      </Head>
      {initialUser.role === 'employee'
        ? <EmployeePortal C={C} user={initialUser} />
        : <AdminPortal C={C} user={initialUser} />
      }
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getEmployeeByUsername, employeeAvatar } = await import('../lib/sales-db')
  const { getUser } = await import('../lib/users-store')

  const cookies = parse(req.headers.cookie || '')
  const session = verifyToken(cookies['ba_session'])
  if (!session) return { redirect: { destination: '/', permanent: false } }

  // Employee login
  if (session.role === 'employee') {
    const employee = await getEmployeeByUsername(session.username)
    if (!employee) return { redirect: { destination: '/', permanent: false } }
    return { props: { initialUser: {
      username: employee.username, name: employee.name,
      avatar: employeeAvatar(employee.name), role: 'employee',
    }}}
  }

  // Admin login — access CRM
  if (session.role === 'admin') {
    const user = await getUser(session.username)
    return { props: { initialUser: {
      username: session.username, name: user?.name || 'مدير',
      role: 'admin',
    }}}
  }

  // Students go to dashboard
  return { redirect: { destination: '/dashboard', permanent: false } }
}
