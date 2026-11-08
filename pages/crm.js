import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { useTheme } from './_app'
import OpenCPool from '../components/OpenCPool'
import ImportLeadsPanel from '../components/ImportLeadsPanel'

// ─── Palette ──────────────────────────────────────────────────────────────────
const C_DARK = {
  navy:'#0A0F0A', gold:'#4ADE80', goldL:'#7AE89F', goldD:'#22A35A',
  blue:'#0F2F0F', surface:'#0D1A0D', emerald:'#34D399', silver:'#8AAB8A',
  locked:'#2A3A2A', white:'#E8F0E8', red:'#F0807A', purple:'#A78BFA',
  orange:'#FB923C',
  g10:'rgba(74,222,128,0.08)', g15:'rgba(74,222,128,0.12)',
  g20:'rgba(74,222,128,0.16)', g30:'rgba(74,222,128,0.26)',
  w10:'rgba(232,240,232,0.10)', w20:'rgba(232,240,232,0.20)',
}
const C_LIGHT = {
  navy:'#F2F7F0', gold:'#1C8A4D', goldL:'#239B5A', goldD:'#146238',
  blue:'#E8F2E6', surface:'#FFFFFF', emerald:'#0F9D6E', silver:'#5B6B5B',
  locked:'#D7DED5', white:'#142016', red:'#C0463F', purple:'#7C5FD1',
  orange:'#C2610A',
  g10:'rgba(28,138,77,0.06)', g15:'rgba(28,138,77,0.10)',
  g20:'rgba(28,138,77,0.12)', g30:'rgba(28,138,77,0.22)',
  w10:'rgba(20,32,22,0.06)', w20:'rgba(20,32,22,0.12)',
}

const PACKAGES = [
  { value:'elite',        labelAr:'Elite — الباقة الكاملة',        labelEn:'Elite'        },
  { value:'professional', labelAr:'Professional — الباقة المتوسطة', labelEn:'Professional' },
  { value:'starter',      labelAr:'Starter — باقة التنفيذ',         labelEn:'Starter'      },
]
const PAYMENT_METHODS = [
  { value:'bank_transfer', labelAr:'تحويل بنكي' },
  { value:'cash',          labelAr:'كاش'         },
  { value:'cliq',          labelAr:'Cliq'        },
  { value:'other',         labelAr:'أخرى'        },
]
const SALE_STATUSES = [
  { value:'paid',      labelAr:'مدفوع',   color:'emerald' },
  { value:'pending',   labelAr:'معلّق',    color:'orange'  },
  { value:'cancelled', labelAr:'ملغى',    color:'red'     },
]
const STATUS_META = {
  new:            { ar:'جديد',          color:'silver'  },
  contacted:      { ar:'تم التواصل',     color:'gold'    },
  interested:     { ar:'مهتم',           color:'emerald' },
  unreachable:    { ar:'لا يرد',         color:'purple'  },
  not_interested: { ar:'غير مهتم',       color:'red'     },
  closed_sale:    { ar:'تم البيع',       color:'emerald' },
  cancelled:      { ar:'ألغى الفكرة',    color:'red'     },
}
const STATUS_ORDER = ['new','contacted','interested','unreachable','not_interested','closed_sale','cancelled']
const NOTE_TYPES = [
  { value:'call',     labelAr:'📞 مكالمة' },
  { value:'whatsapp', labelAr:'💬 واتساب' },
  { value:'meeting',  labelAr:'🤝 اجتماع' },
  { value:'note',     labelAr:'📝 ملاحظة' },
]
const CALL_STATUSES = [
  { value:'answered',  labelAr:'رد'     },
  { value:'no_answer', labelAr:'لم يرد' },
  { value:'busy',      labelAr:'مشغول'  },
  { value:'failed',    labelAr:'فشل'    },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function sc(key, C) {
  const m = { silver:C.silver, gold:C.gold, emerald:C.emerald, red:C.red, purple:C.purple, orange:C.orange }
  return m[STATUS_META[key]?.color] || C.silver
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-JO',{ year:'numeric', month:'short', day:'numeric' })
}
function fmtTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('ar-JO',{ hour:'2-digit', minute:'2-digit' })
}
function fmtMoney(n) {
  if (!n && n !== 0) return '—'
  return Number(n).toLocaleString('ar-JO',{ minimumFractionDigits:0, maximumFractionDigits:0 }) + ' JOD'
}
function monthName(m) {
  return ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'][m-1] || m
}

// ─── Shared: Sidebar ──────────────────────────────────────────────────────────
function Sidebar({ C, user, view, setView, onLogout, navItems, collapsed, setCollapsed }) {
  const { theme, toggleTheme } = useTheme()
  return (
    <aside dir="rtl" style={{
      position:'fixed', right:0, top:0, height:'100%', width:collapsed?72:240,
      background:C.surface, borderLeft:`1px solid ${C.g20}`,
      display:'flex', flexDirection:'column', justifyContent:'space-between',
      zIndex:40, boxShadow:'-4px 0 30px rgba(0,0,0,0.35)',
      transition:'width 0.2s', overflow:'hidden',
    }}>
      <div>
        <div style={{ padding:collapsed?'20px 0 16px':'20px 20px 16px', borderBottom:`1px solid ${C.g20}`, display:'flex', alignItems:'center', justifyContent:collapsed?'center':'space-between' }}>
          {!collapsed && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', border:`1px solid ${C.gold}`, background:C.g15, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ color:C.gold, fontWeight:700, fontSize:18 }}>ب</span>
              </div>
              <div>
                <p style={{ color:C.gold, fontWeight:900, fontSize:12, marginBottom:2 }}>CRM</p>
                <p style={{ color:C.silver, fontSize:11 }}>EBAY ACADEMY</p>
              </div>
            </div>
          )}
          <button onClick={()=>setCollapsed(!collapsed)} style={{ width:28, height:28, borderRadius:7, background:'none', border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>☰</button>
        </div>
        {!collapsed && (
          <div style={{ padding:'12px 16px 8px', borderBottom:`1px solid ${C.g10}` }}>
            <p style={{ color:C.silver, fontSize:11 }}>مرحباً،</p>
            <p style={{ color:C.white, fontWeight:700, fontSize:13 }}>{user.name}</p>
            <p style={{ color:C.silver, fontSize:11 }}>@{user.username} — {user.role === 'admin' ? 'أدمن' : 'موظف'}</p>
          </div>
        )}
        <nav style={{ padding:10, display:'flex', flexDirection:'column', gap:4 }}>
          {navItems.map((item,i) => {
            const active = view === item.id
            return (
              <button key={i} onClick={()=>setView(item.id)} title={collapsed?item.label:undefined} style={{
                display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start',
                gap:12, padding:collapsed?10:'10px 14px', borderRadius:12,
                background:active?C.g20:'transparent', border:`1px solid ${active?C.g30:'transparent'}`,
                color:active?C.gold:C.silver, fontSize:13, fontWeight:600, cursor:'pointer', width:'100%',
                position:'relative',
              }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                {!collapsed && <span style={{ flex:1, textAlign:'right' }}>{item.label}</span>}
                {!collapsed && item.badge > 0 && (
                  <span style={{ background:C.red, color:'#fff', fontSize:10, fontWeight:700, borderRadius:99, padding:'1px 6px', minWidth:18, textAlign:'center' }}>{item.badge}</span>
                )}
                {collapsed && item.badge > 0 && (
                  <span style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:C.red }} />
                )}
              </button>
            )
          })}
        </nav>
      </div>
      <div style={{ padding:collapsed?'12px 8px':12, borderTop:`1px solid ${C.g20}`, display:'flex', flexDirection:'column', gap:6 }}>
        <button onClick={toggleTheme} title={collapsed?(theme==='dark'?'وضع الفاتح':'وضع الداكن'):undefined} style={{
          width:'100%', padding:collapsed?8:'8px 14px', borderRadius:10,
          background:'none', border:`1px solid ${C.g20}`, color:C.silver,
          fontSize:12, fontWeight:600, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8,
        }}>
          <span>{theme==='dark'?'☀️':'🌙'}</span>
          {!collapsed && <span>{theme==='dark'?'الوضع الفاتح':'الوضع الداكن'}</span>}
        </button>
        <button onClick={onLogout} title={collapsed?'تسجيل الخروج':undefined} style={{
          width:'100%', padding:collapsed?8:'8px 14px', borderRadius:10,
          background:'none', border:`1px solid ${C.red}33`, color:C.red,
          fontSize:12, fontWeight:600, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:collapsed?'center':'flex-start', gap:8,
        }}>
          <span>🚪</span>
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Shared: StatCard ─────────────────────────────────────────────────────────
function StatCard({ C, label, value, sub, accent, icon }) {
  const color = accent==='gold'?C.gold:accent==='emerald'?C.emerald:accent==='purple'?C.purple:accent==='orange'?C.orange:C.silver
  return (
    <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <p style={{ color:C.silver, fontSize:12, fontWeight:600 }}>{label}</p>
        {icon && <span style={{ fontSize:20, opacity:0.6 }}>{icon}</span>}
      </div>
      <p style={{ color, fontSize:26, fontWeight:900, lineHeight:1 }}>{value??'—'}</p>
      {sub && <p style={{ color:C.silver, fontSize:11 }}>{sub}</p>}
    </div>
  )
}

// ─── Shared: ProgressBar ──────────────────────────────────────────────────────
function ProgressBar({ C, pct }) {
  const p = Math.min(pct || 0, 100)
  const color = p >= 100 ? '#4ADE80' : p >= 60 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ background:C.g20, borderRadius:20, height:8, overflow:'hidden', width:'100%' }}>
      <div style={{ width:`${p}%`, height:'100%', borderRadius:20, background:color, transition:'width 0.4s' }} />
    </div>
  )
}

// ─── EMPLOYEE: HomeDashboard ──────────────────────────────────────────────────
function HomeDashboard({ C, employeeName }) {
  const [stats, setStats]   = useState(null)
  const [empInfo, setEmpInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales/dashboard')
      .then(r=>r.json())
      .then(d=>{ setStats(d.stats); setEmpInfo(d.employee); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign:'center', padding:80, color:C.silver }}>جارٍ التحميل...</div>
  if (!stats) return <div style={{ textAlign:'center', padding:80, color:C.red }}>خطأ في تحميل البيانات</div>

  const cards = [
    { label:'Fresh Leads',        value:stats.freshLeads,     accent:'gold',    icon:'🌱' },
    { label:'Calls Today',        value:stats.callsToday,     accent:'emerald', icon:'📞' },
    { label:'Calls This Month',   value:stats.callsThisMonth, accent:'emerald', icon:'📊' },
    { label:'Sales Today',        value:stats.salesToday,     accent:'gold',    icon:'💰' },
    { label:'Sales This Month',   value:stats.salesThisMonth, accent:'gold',    icon:'📈' },
    { label:'Sales This Year',    value:stats.salesThisYear,  accent:'gold',    icon:'🏆' },
    { label:'Conversion Rate',    value:`${stats.conversionRate}%`, accent:'purple', icon:'🎯' },
    { label:'Closing Rate',       value:`${stats.closingRate}%`,    accent:'purple', icon:'✅' },
  ]

  return (
    <div dir="rtl">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.white, fontWeight:900, fontSize:22, marginBottom:4 }}>مرحباً، {employeeName} 👋</h1>
        <p style={{ color:C.silver, fontSize:13 }}>{new Date().toLocaleDateString('ar-JO',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {cards.map((c,i) => <StatCard key={i} C={C} {...c} />)}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
        <StatCard C={C} label="Revenue Today"      value={fmtMoney(stats.revenueToday)}     accent="emerald" icon="💵" />
        <StatCard C={C} label="Revenue This Month" value={fmtMoney(stats.revenueThisMonth)} accent="emerald" icon="📅" />
        <StatCard C={C} label="Revenue This Year"  value={fmtMoney(stats.revenueThisYear)}  accent="emerald" icon="🗓" />
      </div>

      {empInfo?.monthlyTarget > 0 && (
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, padding:'18px 22px', marginBottom:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ color:C.white, fontWeight:700, fontSize:14 }}>🎯 الهدف الشهري</span>
            <span style={{ color:C.gold, fontWeight:900, fontSize:16 }}>
              {fmtMoney(stats.revenueThisMonth)} <span style={{ color:C.silver, fontWeight:400, fontSize:13 }}>/ {fmtMoney(empInfo.monthlyTarget)}</span>
            </span>
          </div>
          <ProgressBar C={C} pct={empInfo.targetProgress} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ color:C.silver, fontSize:11 }}>{empInfo.targetProgress}%</span>
            <span style={{ color:C.silver, fontSize:11 }}>متبقي: {fmtMoney(Math.max(0, empInfo.monthlyTarget - stats.revenueThisMonth))}</span>
          </div>
        </div>
      )}

      {stats.dueToday?.length > 0 && (
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, padding:'18px 20px', marginBottom:24 }}>
          <h2 style={{ color:C.gold, fontWeight:700, fontSize:14, marginBottom:14 }}>📅 متابعات اليوم ({stats.dueToday.length})</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {stats.dueToday.map(f => (
              <div key={f.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', background:C.g15, borderRadius:10 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:sc(f.status,C), flexShrink:0 }} />
                <span style={{ color:C.white, fontSize:13, fontWeight:600, flex:1 }}>{f.customer_name}</span>
                <span style={{ color:C.silver, fontSize:12 }}>{f.phone}</span>
                <span style={{ color:sc(f.status,C), fontSize:11, background:`${sc(f.status,C)}20`, padding:'2px 8px', borderRadius:20 }}>{STATUS_META[f.status]?.ar}</span>
                <span style={{ color:C.orange, fontSize:11 }}>{fmtDate(f.next_followup_date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
            <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>📞 آخر المكالمات</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:C.g15 }}>
              {['العميل','التاريخ'].map(h=><th key={h} style={{ padding:'8px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(stats.recentCalls||[]).length===0
                ? <tr><td colSpan={2} style={{ padding:20, textAlign:'center', color:C.silver, fontSize:13 }}>لا توجد مكالمات</td></tr>
                : (stats.recentCalls||[]).map((c,i)=><tr key={i} style={{ borderTop:`1px solid ${C.g15}` }}>
                    <td style={{ padding:'9px 14px', color:C.white, fontSize:13 }}>{c.customer_name||'—'}</td>
                    <td style={{ padding:'9px 14px', color:C.silver, fontSize:12 }}>{fmtDate(c.created_at)}</td>
                  </tr>)
              }
            </tbody>
          </table>
        </div>
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
            <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>💰 آخر البيعات</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:C.g15 }}>
              {['العميل','المبلغ','الحالة'].map(h=><th key={h} style={{ padding:'8px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(stats.recentSales||[]).length===0
                ? <tr><td colSpan={3} style={{ padding:20, textAlign:'center', color:C.silver, fontSize:13 }}>لا توجد بيعات</td></tr>
                : (stats.recentSales||[]).map((s,i)=>{
                  const ss = SALE_STATUSES.find(x=>x.value===s.sale_status)
                  const sColor = ss?C[ss.color]:C.silver
                  return <tr key={i} style={{ borderTop:`1px solid ${C.g15}` }}>
                    <td style={{ padding:'9px 14px', color:C.white, fontSize:13 }}>{s.student_name}</td>
                    <td style={{ padding:'9px 14px', color:C.gold, fontSize:12, fontWeight:700 }}>{fmtMoney(s.amount_paid)}</td>
                    <td style={{ padding:'9px 14px' }}>
                      <span style={{ color:sColor, fontSize:11, background:`${sColor}20`, padding:'2px 8px', borderRadius:20 }}>{ss?.labelAr||s.sale_status}</span>
                    </td>
                  </tr>
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── EMPLOYEE: Lead Detail Panel ──────────────────────────────────────────────
function LeadDetailPanel({ C, leadId, onClose, onUpdated }) {
  const [lead, setLead]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [noteType, setNoteType]     = useState('call')
  const [callStatus, setCallStatus] = useState('answered')
  const [duration, setDuration]     = useState('')
  const [note, setNote]         = useState('')
  const [nextDate, setNextDate]     = useState('')
  const [busy, setBusy]         = useState(false)
  const [err, setErr]           = useState('')

  useEffect(() => {
    if (!leadId) return
    setLoading(true)
    fetch(`/api/sales/lead-detail?id=${leadId}`)
      .then(r=>r.json()).then(d=>{ setLead(d.lead); setStatus(d.lead?.status||''); setNextDate(d.lead?.next_followup_date||''); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [leadId])

  async function save() {
    setErr(''); setBusy(true)
    const body = { status, noteType, callStatus, duration:duration?parseInt(duration):undefined, note:note.trim()||undefined, nextFollowupDate:nextDate||undefined }
    const r = await fetch(`/api/sales/leads/${leadId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { setErr(d.error||'خطأ'); setBusy(false); return }
    setNote(''); setDuration('')
    setLead(prev=>({ ...prev, status, next_followup_date:nextDate, notes:[d.lead?.notes?.[0],...(prev?.notes||[])].filter(Boolean) }))
    setBusy(false)
    if (onUpdated) onUpdated()
  }

  const noteIcons = { call:'📞', whatsapp:'💬', meeting:'🤝', note:'📝' }
  const sel = { width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }} onClick={onClose}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.5)' }} />
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ width:440, background:C.surface, height:'100%', display:'flex', flexDirection:'column', borderRight:`1px solid ${C.g20}`, boxShadow:'-8px 0 40px rgba(0,0,0,0.4)', overflowY:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.g20}`, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
          <div style={{ flex:1 }}>
            {loading ? <p style={{ color:C.silver }}>جارٍ التحميل...</p> : (<>
              <p style={{ color:C.white, fontWeight:700, fontSize:16, marginBottom:2 }}>{lead?.customer_name}</p>
              <p style={{ color:C.silver, fontSize:12 }} dir="ltr">{lead?.phone}</p>
            </>)}
          </div>
        </div>
        {loading ? <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.silver }}>جارٍ التحميل...</div>
        : lead ? (<>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['تاريخ الإضافة',fmtDate(lead.created_at)],['آخر تواصل',fmtDate(lead.last_contact_date)],['موعد المتابعة',fmtDate(lead.next_followup_date)]].map(([l,v])=>(
              <div key={l}><p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>{l}</p><p style={{ color:C.white, fontSize:13 }}>{v}</p></div>
            ))}
          </div>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ color:C.gold, fontWeight:700, fontSize:13 }}>تسجيل نشاط</p>
            {err && <div style={{ color:C.red, fontSize:12, padding:'6px 10px', background:`${C.red}15`, borderRadius:8 }}>{err}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>نوع النشاط</label>
                <select value={noteType} onChange={e=>setNoteType(e.target.value)} style={sel}>{NOTE_TYPES.map(t=><option key={t.value} value={t.value}>{t.labelAr}</option>)}</select></div>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>الحالة</label>
                <select value={status} onChange={e=>setStatus(e.target.value)} style={sel}>{STATUS_ORDER.map(s=><option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}</select></div>
            </div>
            {noteType==='call' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>نتيجة المكالمة</label>
                  <select value={callStatus} onChange={e=>setCallStatus(e.target.value)} style={sel}>{CALL_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}</select></div>
                <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>المدة (دقيقة)</label>
                  <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} min="0" style={{ ...sel }} /></div>
              </div>
            )}
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>موعد المتابعة</label>
              <input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} style={{ ...sel, boxSizing:'border-box' }} /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>ملاحظة</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} style={{ ...sel, resize:'vertical', boxSizing:'border-box', direction:'rtl' }} placeholder="أضف ملاحظة..." /></div>
            <button onClick={save} disabled={busy} style={{ width:'100%', padding:10, borderRadius:10, background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:13, fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>
              {busy?'⏳ جارٍ الحفظ...':'💾 حفظ النشاط'}
            </button>
          </div>
          <div style={{ padding:'14px 20px', flex:1 }}>
            <p style={{ color:C.gold, fontWeight:700, fontSize:13, marginBottom:12 }}>📋 سجل النشاط</p>
            {(lead.notes||[]).length===0 ? <p style={{ color:C.silver, fontSize:13, textAlign:'center', padding:20 }}>لا يوجد سجل نشاط بعد</p>
            : (lead.notes||[]).map((n,i)=>(
              <div key={i} style={{ display:'flex', gap:12, marginBottom:14 }}>
                <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:C.g15, border:`1px solid ${C.g20}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{noteIcons[n.note_type]||'📝'}</div>
                  {i<lead.notes.length-1 && <div style={{ width:1, flex:1, background:C.g20, marginTop:4, minHeight:16 }} />}
                </div>
                <div style={{ flex:1, paddingBottom:i<lead.notes.length-1?8:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ color:C.white, fontSize:12, fontWeight:600 }}>{NOTE_TYPES.find(t=>t.value===n.note_type)?.labelAr||'📝'}</span>
                    {n.call_status&&<span style={{ color:C.silver, fontSize:11 }}>• {CALL_STATUSES.find(s=>s.value===n.call_status)?.labelAr}</span>}
                    {n.duration_minutes&&<span style={{ color:C.silver, fontSize:11 }}>• {n.duration_minutes} دقيقة</span>}
                  </div>
                  {n.text&&<p style={{ color:C.white, fontSize:13, marginBottom:4 }}>{n.text}</p>}
                  <p style={{ color:C.silver, fontSize:11 }}>{fmtDate(n.created_at)} — {fmtTime(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </>) : <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.red }}>لم يتم العثور على العميل</div>}
      </div>
    </div>
  )
}

// ─── EMPLOYEE: Leads Page ─────────────────────────────────────────────────────
function LeadsPage({ C }) {
  const [tab, setTab]         = useState('fresh')
  const [leads, setLeads]     = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [opencCount, setOpencCount] = useState(0)
  const timer = useRef()

  const load = useCallback(async (t, q, pg) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/sales/leads-page?tab=${t}&q=${encodeURIComponent(q)}&page=${pg}&limit=30`)
      const d = await r.json()
      setLeads(d.leads||[]); setTotal(d.total||0)
      // Keep badge count up to date when viewing the openc tab
      if (t === 'openc') setOpencCount(d.total||0)
    } catch(e) {
      setLeads([]); setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load OpenC count for badge on mount and after any update
  useEffect(()=>{
    fetch('/api/sales/leads-page?tab=openc&limit=1')
      .then(r=>r.json()).then(d=>setOpencCount(d.total||0)).catch(()=>{})
    alert('DEBUG v3: LeadsPage loaded OK — tabs=' + 4)
  }, [])

  useEffect(()=>{ load(tab,search,page) },[tab,search,page])

  function handleSearch(v) {
    setSearchVal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(()=>{ setSearch(v); setPage(1) }, 400)
  }

  function switchTab(id) {
    setTab(id); setPage(1); setSearch(''); setSearchVal('')
  }

  function afterUpdate() {
    load(tab, search, page)
    // Refresh OpenC badge
    fetch('/api/sales/leads-page?tab=openc&limit=1')
      .then(r=>r.json()).then(d=>setOpencCount(d.total||0)).catch(()=>{})
  }

  const tabs = [
    { id:'fresh',     label:'Fresh',      icon:'🌱',  badge:0 },
    { id:'openc',     label:'بركة OpenC', icon:'🌊',  badge:opencCount },
    { id:'all',       label:'My Leads',   icon:'👤',  badge:0 },
    { id:'followups', label:'Follow-ups', icon:'📅',  badge:0 },
  ]
  const cols = ['NAME','PHONE','CREATED','STATUS','LAST CALL','FOLLOW-UP']
  const th = { padding:'11px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }
  const td = { padding:'11px 14px', fontSize:13 }

  return (
    <div dir="rtl">
      <div style={{ marginBottom:16 }}>
        <input value={searchVal} onChange={e=>handleSearch(e.target.value)} placeholder="ابحث بالاسم أو الرقم..."
          style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'10px 14px', color:C.white, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
      </div>
      {tab === 'openc' && (
        <div style={{ marginBottom:14, background:`${C.purple}12`, border:`1px solid ${C.purple}35`, borderRadius:12, padding:'10px 16px', color:C.purple, fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
          <span>♻️</span>
          <span>أرقام سحبتها من OpenC Pool — بمجرد تسجيل أي تواصل معها تنتقل تلقائياً إلى <strong>My Leads</strong></span>
        </div>
      )}
      <div style={{ color:C.white, fontSize:12, marginBottom:4 }}>DEBUG tabs={tabs.length}</div>
      <div style={{ display:'flex', flexDirection:'row', gap:4, marginBottom:16, background:C.g10, borderRadius:12, padding:4, width:'fit-content' }}>
        {tabs.map(t=>{
          const active = tab===t.id
          const isOpenc = t.id==='openc'
          return (
            <button key={t.id} onClick={()=>switchTab(t.id)} style={{ padding:'8px 18px', borderRadius:10, border:isOpenc&&!active?`2px solid ${C.purple}`:'none', cursor:'pointer', background:active?(isOpenc?C.purple:C.gold):(isOpenc?C.purple+'22':'transparent'), color:active?(isOpenc?'#fff':C.navy):(isOpenc?C.purple:C.silver), fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6, position:'relative' }}>
              <span>{t.icon}</span><span>{t.label}</span>
              {t.badge > 0 && <span style={{ background:active?'rgba(255,255,255,0.3)':C.purple, color:'#fff', borderRadius:20, fontSize:10, fontWeight:700, padding:'1px 7px', marginRight:2 }}>{t.badge}</span>}
            </button>
          )
        })}
      </div>
      <div style={{ color:'red', fontWeight:700, fontSize:13, marginBottom:8 }}>HARDCODED: <button onClick={()=>switchTab('openc')} style={{background:'red',color:'white',padding:'4px 10px'}}>🌊 أرقام البركة HC</button></div>
      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.g15 }}>{cols.map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={cols.length} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            : leads.length===0 ? <tr><td colSpan={cols.length} style={{ padding:50, textAlign:'center', color:C.silver }}>لا توجد نتائج</td></tr>
            : leads.map(lead=>(
              <tr key={lead.id} onClick={()=>setSelectedId(lead.id)} style={{ borderTop:`1px solid ${C.g15}`, cursor:'pointer' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.g10}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ ...td, color:C.white, fontWeight:600 }}>{lead.customer_name}</td>
                <td style={{ ...td, color:C.silver }} dir="ltr">{lead.phone}</td>
                <td style={{ ...td, color:C.silver, whiteSpace:'nowrap' }}>{fmtDate(lead.created_at)}</td>
                <td style={{ ...td }}><span style={{ color:sc(lead.status,C), fontSize:11, background:`${sc(lead.status,C)}20`, padding:'3px 10px', borderRadius:20 }}>{STATUS_META[lead.status]?.ar}</span></td>
                <td style={{ ...td, color:C.silver, whiteSpace:'nowrap' }}>{fmtDate(lead.last_contact_date)}</td>
                <td style={{ ...td, color:lead.next_followup_date?C.orange:C.silver, whiteSpace:'nowrap' }}>{fmtDate(lead.next_followup_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {total>30 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16, alignItems:'center' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 14px', borderRadius:8, background:page===1?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page===1?C.silver:C.white, cursor:page===1?'default':'pointer', fontSize:13 }}>السابق</button>
          <span style={{ color:C.silver, fontSize:13 }}>صفحة {page} من {Math.ceil(total/30)}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/30)} style={{ padding:'6px 14px', borderRadius:8, background:page>=Math.ceil(total/30)?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page>=Math.ceil(total/30)?C.silver:C.white, cursor:page>=Math.ceil(total/30)?'default':'pointer', fontSize:13 }}>التالي</button>
        </div>
      )}
      {selectedId && <LeadDetailPanel C={C} leadId={selectedId} onClose={()=>setSelectedId(null)} onUpdated={afterUpdate} />}
    </div>
  )
}

// ─── EMPLOYEE: Create Sale Modal ──────────────────────────────────────────────
function CreateSaleModal({ C, onClose, onSuccess, employees, isAdmin }) {
  const [f, setF] = useState({ studentName:'', studentPhone:'', packageName:'', amountPaid:'', deposit:'', paymentMethod:'bank_transfer', saleStatus:'paid', notes:'', employeeId:'' })
  const [proofFile, setProofFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 10*1024*1024) { setErr('حجم الصورة أكثر من 10MB'); return }
    setProofFile(file); setPreviewUrl(URL.createObjectURL(file)); setErr('')
  }

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!f.studentName.trim()) return setErr('اسم الطالب مطلوب')
    if (!f.studentPhone.trim()) return setErr('رقم الهاتف مطلوب')
    if (!f.packageName) return setErr('اختر الباقة')
    if (isAdmin && !f.employeeId) return setErr('اختر الموظف')
    if (!proofFile) return setErr('صورة إثبات البيعة مطلوبة')
    setUploading(true)
    try {
      const base64 = await new Promise((res,rej)=>{ const reader=new FileReader(); reader.onload=()=>res(reader.result.split(',')[1]); reader.onerror=rej; reader.readAsDataURL(proofFile) })
      const upR = await fetch('/api/sales/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ base64, contentType:proofFile.type, filename:proofFile.name }) })
      if (!upR.ok) {
        let upErr = 'فشل رفع الصورة'
        try { const d=await upR.json(); upErr = d.error||upErr } catch {}
        throw new Error(upErr)
      }
      const { url:proofImageUrl } = await upR.json()
      const body = { ...f, proofImageUrl }
      if (isAdmin && f.employeeId) body.employeeId = parseInt(f.employeeId)
      const saleR = await fetch('/api/sales/records', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
      let saleD
      try { saleD = await saleR.json() } catch { throw new Error('فشل تسجيل البيعة') }
      if (!saleR.ok) throw new Error(saleD?.error||'فشل تسجيل البيعة')
      onSuccess(saleD)
    } catch(ex) { setErr(ex.message) } finally { setUploading(false) }
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'9px 12px', color:C.white, fontSize:13, width:'100%', fontFamily:'inherit', boxSizing:'border-box', direction:'rtl', outline:'none' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20, overflowY:'auto' }} onClick={onClose}>
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:28, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:C.white, fontWeight:900, fontSize:18 }}>+ تسجيل بيعة جديدة</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {err && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:10, padding:'9px 14px', color:C.red, fontSize:13 }}>{err}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>اسم الطالب *</label><input style={inp} value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} required /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>رقم الهاتف *</label><input style={{ ...inp, direction:'ltr' }} value={f.studentPhone} onChange={e=>setF({...f,studentPhone:e.target.value})} required /></div>
          </div>
          <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>الباقة *</label>
            <select style={{ ...inp, appearance:'none' }} value={f.packageName} onChange={e=>setF({...f,packageName:e.target.value})} required>
              <option value="">— اختر الباقة —</option>
              {PACKAGES.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>الموظف *</label>
              <select style={{ ...inp, appearance:'none' }} value={f.employeeId} onChange={e=>setF({...f,employeeId:e.target.value})} required>
                <option value="">— اختر الموظف —</option>
                {(employees||[]).map(emp=><option key={emp.id} value={emp.id}>{emp.name}</option>)}
              </select>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>المبلغ (JOD)</label><input type="number" style={{ ...inp, direction:'ltr' }} min="0" step="0.01" value={f.amountPaid} onChange={e=>setF({...f,amountPaid:e.target.value})} /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>العربون (JOD)</label><input type="number" style={{ ...inp, direction:'ltr' }} min="0" step="0.01" value={f.deposit} onChange={e=>setF({...f,deposit:e.target.value})} /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>طريقة الدفع</label>
              <select style={{ ...inp, appearance:'none' }} value={f.paymentMethod} onChange={e=>setF({...f,paymentMethod:e.target.value})}>
                {PAYMENT_METHODS.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>حالة البيعة</label>
              <select style={{ ...inp, appearance:'none' }} value={f.saleStatus} onChange={e=>setF({...f,saleStatus:e.target.value})}>
                {SALE_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}
              </select>
            </div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>ملاحظات</label><textarea style={{ ...inp, resize:'vertical', minHeight:38 }} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} /></div>
          </div>
          <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>صورة إثبات البيعة *</label>
            <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${proofFile?C.gold:C.g30}`, borderRadius:12, padding:18, textAlign:'center', cursor:'pointer', background:proofFile?C.g10:'transparent' }}>
              {previewUrl ? (<div><img src={previewUrl} alt="proof" style={{ maxWidth:'100%', maxHeight:150, borderRadius:8, marginBottom:6 }} /><p style={{ color:C.gold, fontSize:12 }}>✅ انقر للتغيير</p></div>)
              : (<div><p style={{ fontSize:24, marginBottom:6 }}>📷</p><p style={{ color:C.white, fontSize:13 }}>انقر لاختيار صورة الإثبات</p></div>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'10px 20px', borderRadius:10, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:13, cursor:'pointer' }}>إلغاء</button>
            <button type="submit" disabled={uploading} style={{ padding:'10px 28px', borderRadius:10, background:uploading?C.g15:C.gold, border:'none', color:uploading?C.silver:C.navy, fontSize:14, fontWeight:700, cursor:uploading?'not-allowed':'pointer' }}>
              {uploading?'⏳ جارٍ الحفظ...':'✅ تسجيل البيعة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SaleSuccessModal({ C, data, onClose }) {
  const { studentAccount, record, pendingApproval } = data

  // Pending approval case (employee submitted, waiting for admin)
  if (pendingApproval) {
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:110, padding:20 }}>
        <div dir="rtl" style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:32, maxWidth:420, width:'100%' }}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:44, marginBottom:10 }}>⏳</div>
            <h2 style={{ color:C.orange, fontWeight:900, fontSize:20, marginBottom:6 }}>بيعتك في انتظار الموافقة</h2>
            <p style={{ color:C.silver, fontSize:13 }}>سيتم إنشاء حساب الطالب بعد مراجعة الأدمن وقبول البيعة.</p>
          </div>
          <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:16, marginBottom:18 }}>
            {[['اسم الطالب',record?.student_name],['رقم الهاتف',record?.student_phone],['الباقة',PACKAGES.find(p=>p.value===record?.package_name)?.labelAr||record?.package_name]].map(([l,v,mono])=>(
              <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:C.silver, fontSize:12 }}>{l}</span>
                <span style={{ color:C.white, fontSize:13, fontWeight:700, fontFamily:mono?'monospace':'inherit', direction:'ltr' }}>{v||'—'}</span>
              </div>
            ))}
          </div>
          <div style={{ color:C.orange, fontSize:13, padding:'8px 12px', background:`${C.orange}15`, borderRadius:10, marginBottom:14 }}>⚠️ لن يتمكن الطالب من الوصول للدروس حتى تُقبل البيعة.</div>
          <button onClick={onClose} style={{ width:'100%', padding:12, borderRadius:12, background:C.gold, border:'none', color:C.navy, fontSize:15, fontWeight:700, cursor:'pointer' }}>حسناً</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:110, padding:20 }}>
      <div dir="rtl" style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:32, maxWidth:420, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🎉</div>
          <h2 style={{ color:C.gold, fontWeight:900, fontSize:20, marginBottom:4 }}>تم تسجيل البيعة!</h2>
        </div>
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:16, marginBottom:18 }}>
          {[['الاسم',studentAccount?.studentName],['اسم المستخدم',studentAccount?.username,true],['الباقة',PACKAGES.find(p=>p.value===record?.package_name)?.labelAr||record?.package_name]].map(([l,v,mono])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:C.silver, fontSize:12 }}>{l}</span>
              <span style={{ color:C.white, fontSize:13, fontWeight:700, fontFamily:mono?'monospace':'inherit', direction:'ltr' }}>{v||'—'}</span>
            </div>
          ))}
        </div>
        {studentAccount?.created && <div style={{ color:C.emerald, fontSize:13, padding:'8px 12px', background:`${C.emerald}15`, borderRadius:10, marginBottom:14 }}>✅ تم إنشاء حساب جديد</div>}
        {studentAccount?.existing && <div style={{ color:C.purple, fontSize:13, padding:'8px 12px', background:`${C.purple}15`, borderRadius:10, marginBottom:14 }}>ℹ️ حساب موجود مسبقاً</div>}
        <button onClick={onClose} style={{ width:'100%', padding:12, borderRadius:12, background:C.gold, border:'none', color:C.navy, fontSize:15, fontWeight:700, cursor:'pointer' }}>حسناً</button>
      </div>
    </div>
  )
}

// ─── Edit Sale Modal ──────────────────────────────────────────────────────────
function EditSaleModal({ C, record, onClose, onSuccess }) {
  const [f, setF] = useState({
    studentName:   record.student_name   || '',
    studentPhone:  record.student_phone  || '',
    packageName:   record.package_name   || '',
    amountPaid:    record.amount_paid    != null ? String(record.amount_paid)  : '',
    deposit:       record.deposit        != null ? String(record.deposit)      : '',
    paymentMethod: record.payment_method || 'bank_transfer',
    saleStatus:    record.sale_status    || 'paid',
    notes:         record.notes          || '',
  })
  const [proofFile, setProofFile]   = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [err, setErr]               = useState('')
  const fileRef = useRef()

  function handleFile(e) {
    const file = e.target.files[0]; if (!file) return
    if (file.size > 10*1024*1024) { setErr('حجم الصورة أكثر من 10MB'); return }
    setProofFile(file); setPreviewUrl(URL.createObjectURL(file)); setErr('')
  }

  async function submit(e) {
    e.preventDefault(); setErr('')
    if (!f.studentName.trim()) return setErr('اسم الطالب مطلوب')
    if (!f.studentPhone.trim()) return setErr('رقم الهاتف مطلوب')
    if (!f.packageName) return setErr('اختر الباقة')
    setUploading(true)
    try {
      let proofImageUrl = record.proof_image_url
      if (proofFile) {
        const base64 = await new Promise((res,rej)=>{ const reader=new FileReader(); reader.onload=()=>res(reader.result.split(',')[1]); reader.onerror=rej; reader.readAsDataURL(proofFile) })
        const upR = await fetch('/api/sales/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ base64, contentType:proofFile.type, filename:proofFile.name }) })
        if (!upR.ok) { const d=await upR.json(); throw new Error(d.error||'فشل رفع الصورة') }
        const up = await upR.json(); proofImageUrl = up.url
      }
      const r = await fetch(`/api/sales/records?id=${record.id}`, {
        method:'PATCH', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...f, proofImageUrl }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||'فشل التعديل')
      onSuccess(d.record)
    } catch(ex) { setErr(ex.message) } finally { setUploading(false) }
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'9px 12px', color:C.white, fontSize:13, width:'100%', fontFamily:'inherit', boxSizing:'border-box', direction:'rtl', outline:'none' }
  const currentImg = previewUrl || record.proof_image_url

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20, overflowY:'auto' }} onClick={onClose}>
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:28, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:C.white, fontWeight:900, fontSize:18 }}>✏️ تعديل البيعة</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {err && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:10, padding:'9px 14px', color:C.red, fontSize:13 }}>{err}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>اسم الطالب *</label><input style={inp} value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} required /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>رقم الهاتف *</label><input style={{ ...inp, direction:'ltr' }} value={f.studentPhone} onChange={e=>setF({...f,studentPhone:e.target.value})} required /></div>
          </div>
          <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>الباقة *</label>
            <select style={{ ...inp, appearance:'none' }} value={f.packageName} onChange={e=>setF({...f,packageName:e.target.value})} required>
              <option value="">— اختر الباقة —</option>
              {PACKAGES.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>المبلغ (JOD)</label><input type="number" style={{ ...inp, direction:'ltr' }} min="0" step="0.01" value={f.amountPaid} onChange={e=>setF({...f,amountPaid:e.target.value})} /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>العربون (JOD)</label><input type="number" style={{ ...inp, direction:'ltr' }} min="0" step="0.01" value={f.deposit} onChange={e=>setF({...f,deposit:e.target.value})} /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>طريقة الدفع</label>
              <select style={{ ...inp, appearance:'none' }} value={f.paymentMethod} onChange={e=>setF({...f,paymentMethod:e.target.value})}>
                {PAYMENT_METHODS.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>حالة البيعة</label>
              <select style={{ ...inp, appearance:'none' }} value={f.saleStatus} onChange={e=>setF({...f,saleStatus:e.target.value})}>
                {SALE_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}
              </select>
            </div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>ملاحظات</label><textarea style={{ ...inp, resize:'vertical', minHeight:38 }} value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} /></div>
          </div>
          <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>صورة إثبات البيعة</label>
            <div onClick={()=>fileRef.current?.click()} style={{ border:`2px dashed ${proofFile?C.gold:C.g30}`, borderRadius:12, padding:14, textAlign:'center', cursor:'pointer', background:C.g10 }}>
              {currentImg ? (<div><img src={currentImg} alt="proof" style={{ maxWidth:'100%', maxHeight:120, borderRadius:8, marginBottom:4 }} /><p style={{ color:proofFile?C.gold:C.silver, fontSize:11 }}>{proofFile?'✅ صورة جديدة — انقر للتغيير':'📷 انقر لاستبدال الصورة'}</p></div>)
              : (<div><p style={{ fontSize:22, marginBottom:4 }}>📷</p><p style={{ color:C.silver, fontSize:12 }}>انقر لاختيار صورة</p></div>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding:'10px 20px', borderRadius:10, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:13, cursor:'pointer' }}>إلغاء</button>
            <button type="submit" disabled={uploading} style={{ padding:'10px 28px', borderRadius:10, background:uploading?C.g15:C.gold, border:'none', color:uploading?C.silver:C.navy, fontSize:14, fontWeight:700, cursor:uploading?'not-allowed':'pointer' }}>
              {uploading?'⏳ جارٍ الحفظ...':'✅ حفظ التعديلات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── EMPLOYEE: Sales Page ─────────────────────────────────────────────────────
function SalesPage({ C }) {
  const [records, setRecords]   = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [month, setMonth]       = useState(new Date().getMonth()+1)
  const [year, setYear]         = useState(new Date().getFullYear())
  const [showCreate, setShowCreate] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [stats, setStats]       = useState(null)
  const [editRecord, setEditRecord] = useState(null)

  useEffect(()=>{ loadRecords() },[month,year])
  useEffect(()=>{ fetch('/api/sales/dashboard').then(r=>r.json()).then(d=>setStats(d.stats)).catch(()=>{}) },[])

  async function loadRecords() {
    setLoading(true)
    try {
      const r = await fetch(`/api/sales/records?month=${month}&year=${year}`)
      const d = await r.json()
      setRecords(d.records||[]); setTotal(d.total||0)
    } catch { setRecords([]); setTotal(0) } finally { setLoading(false) }
  }

  const years = [new Date().getFullYear(), new Date().getFullYear()-1]
  const months = Array.from({length:12},(_,i)=>i+1)
  const thStyle = { padding:'10px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap', borderBottom:`1px solid ${C.g20}` }
  const tdStyle = { padding:'11px 14px', fontSize:13 }

  return (
    <div dir="rtl">
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:18 }}>
          {[
            { label:'Sales Today', value:stats.salesToday, accent:'gold' },
            { label:'Sales Month', value:stats.salesThisMonth, accent:'gold' },
            { label:'Sales Year', value:stats.salesThisYear, accent:'gold' },
            { label:'Revenue Today', value:fmtMoney(stats.revenueToday), accent:'emerald' },
            { label:'Revenue Month', value:fmtMoney(stats.revenueThisMonth), accent:'emerald' },
            { label:'Revenue Year', value:fmtMoney(stats.revenueThisYear), accent:'emerald' },
          ].map((c,i)=><StatCard key={i} C={C} {...c} />)}
        </div>
      )}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ marginRight:'auto', background:C.g15, border:`1px solid ${C.g30}`, borderRadius:8, padding:'8px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>{total} بيعة</div>
        <button onClick={()=>setShowCreate(true)} style={{ padding:'8px 18px', borderRadius:10, background:C.gold, border:'none', color:C.navy, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ Create Sale</button>
      </div>
      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.g15 }}>
            {['CUSTOMER','PHONE','PRODUCT','AMOUNT','DEPOSIT','PAYMENT','DATE','STATUS',''].map(h=><th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={9} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            : records.length===0 ? <tr><td colSpan={9} style={{ padding:60, textAlign:'center', color:C.silver }}>لا توجد بيعات في هذه الفترة</td></tr>
            : records.map(r=>{
              const ss = SALE_STATUSES.find(x=>x.value===r.sale_status)
              const sColor = ss?C[ss.color]:C.silver
              return (
                <tr key={r.id} style={{ borderTop:`1px solid ${C.g15}` }}>
                  <td style={{ ...tdStyle, color:C.white, fontWeight:600 }}>{r.student_name}</td>
                  <td style={{ ...tdStyle, color:C.silver }} dir="ltr">{r.student_phone}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PACKAGES.find(p=>p.value===r.package_name)?.labelEn||r.package_name}</td>
                  <td style={{ ...tdStyle, color:C.gold, fontWeight:700 }}>{fmtMoney(r.amount_paid)}</td>
                  <td style={{ ...tdStyle, color:C.silver }}>{fmtMoney(r.deposit)}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PAYMENT_METHODS.find(p=>p.value===r.payment_method)?.labelAr||r.payment_method}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(r.sale_date)}</td>
                  <td style={{ ...tdStyle }}><span style={{ color:sColor, fontSize:11, background:`${sColor}20`, padding:'3px 10px', borderRadius:20 }}>{ss?.labelAr||r.sale_status}</span></td>
                  <td style={{ ...tdStyle }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>setEditRecord(r)} style={{ padding:'4px 12px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, cursor:'pointer' }}>✏️ تعديل</button>
                      {r.proof_image_url && <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" style={{ padding:'4px 12px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, textDecoration:'none', display:'inline-block' }}>📷</a>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {showCreate && <CreateSaleModal C={C} onClose={()=>setShowCreate(false)} onSuccess={d=>{setShowCreate(false);setSuccessData(d);loadRecords()}} />}
      {successData && <SaleSuccessModal C={C} data={successData} onClose={()=>setSuccessData(null)} />}
      {editRecord && <EditSaleModal C={C} record={editRecord} onClose={()=>setEditRecord(null)} onSuccess={()=>{ setEditRecord(null); loadRecords() }} />}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN SECTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── ADMIN: Company Dashboard ─────────────────────────────────────────────────
function AdminDashboard({ C }) {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]     = useState('')

  useEffect(()=>{
    fetch('/api/crm/stats')
      .then(r=>{ if(!r.ok) throw new Error(r.status+' '+r.statusText); return r.json() })
      .then(d=>{ setData(d); setLoading(false) })
      .catch(e=>{ setErr(e.message); setLoading(false) })
  },[])

  if (loading) return <div style={{ textAlign:'center', padding:80, color:C.silver }}>جارٍ التحميل...</div>
  if (err || !data) return <div style={{ textAlign:'center', padding:80, color:C.red }}>خطأ في تحميل البيانات{err?' — '+err:''}</div>

  return (
    <div dir="rtl">
      <h1 style={{ color:C.white, fontWeight:900, fontSize:20, marginBottom:20 }}>📊 لوحة تحكم الشركة</h1>

      {/* Company Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        <StatCard C={C} label="إجمالي Leads"     value={data.totalLeads}               accent="gold"    icon="👥" />
        <StatCard C={C} label="OpenC Pool"         value={data.opencOpen}                accent="purple"  icon="♻️" />
        <StatCard C={C} label="بيعات اليوم"       value={data.salesToday}               accent="gold"    icon="💰" />
        <StatCard C={C} label="بيعات الشهر"       value={data.salesMonth}               accent="gold"    icon="📈" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:28 }}>
        <StatCard C={C} label="إيراد اليوم"   value={fmtMoney(data.revenueToday)}  accent="emerald" icon="💵" />
        <StatCard C={C} label="إيراد الشهر"   value={fmtMoney(data.revenueMonth)}  accent="emerald" icon="📅" />
        <StatCard C={C} label="إيراد السنة"   value={fmtMoney(data.revenueYear)}   accent="emerald" icon="🗓" />
      </div>

      {/* Leads by Status */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:28 }}>
        {/* Employee Table */}
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
            <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>👥 أداء الموظفين هذا الشهر</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr style={{ background:C.g15 }}>
              {['الاسم','الإيراد','المكالمات','الهدف','التقدم'].map(h=><th key={h} style={{ padding:'9px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {(data.employeeStats||[]).length===0
                ? <tr><td colSpan={5} style={{ padding:24, textAlign:'center', color:C.silver }}>لا يوجد موظفون</td></tr>
                : (data.employeeStats||[]).map(emp=>(
                  <tr key={emp.id} style={{ borderTop:`1px solid ${C.g15}` }}>
                    <td style={{ padding:'11px 14px', color:C.white, fontSize:13, fontWeight:600 }}>{emp.name}</td>
                    <td style={{ padding:'11px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>{fmtMoney(emp.revenueMonth)}</td>
                    <td style={{ padding:'11px 14px', color:C.silver, fontSize:13 }}>{emp.callsMonth}</td>
                    <td style={{ padding:'11px 14px', color:C.silver, fontSize:12 }}>{emp.monthlyTarget>0?fmtMoney(emp.monthlyTarget):'—'}</td>
                    <td style={{ padding:'11px 14px', minWidth:120 }}>
                      {emp.monthlyTarget>0 ? (<>
                        <ProgressBar C={C} pct={emp.targetProgress} />
                        <span style={{ color:C.silver, fontSize:10, marginTop:3, display:'block' }}>{emp.targetProgress}%</span>
                      </>) : <span style={{ color:C.silver, fontSize:12 }}>—</span>}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Leads by Status */}
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, padding:'18px 20px' }}>
          <h2 style={{ color:C.white, fontWeight:700, fontSize:14, marginBottom:16 }}>📋 Leads حسب الحالة</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {(data.leadsByStatus||[]).map(row=>{
              const meta = STATUS_META[row.status]
              const color = meta ? (C[meta.color]||C.silver) : C.silver
              return (
                <div key={row.status} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color, fontSize:11, background:`${color}20`, padding:'2px 8px', borderRadius:20, minWidth:80, textAlign:'center' }}>{meta?.ar||row.status}</span>
                  <div style={{ flex:1, background:C.g20, borderRadius:20, height:8, overflow:'hidden' }}>
                    <div style={{ width:`${Math.min((row.n/data.totalLeads)*100,100)}%`, height:'100%', background:color, borderRadius:20 }} />
                  </div>
                  <span style={{ color:C.white, fontSize:12, fontWeight:700, minWidth:30, textAlign:'left' }}>{row.n}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Sales */}
      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
          <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>💰 آخر البيعات</h2>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.g15 }}>
            {['الطالب','الموظف','الباقة','المبلغ','التاريخ'].map(h=><th key={h} style={{ padding:'9px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {(data.recentSales||[]).map((s,i)=>(
              <tr key={i} style={{ borderTop:`1px solid ${C.g15}` }}>
                <td style={{ padding:'11px 14px', color:C.white, fontSize:13 }}>{s.student_name}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12 }}>{s.employee_name||'—'}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12 }}>{PACKAGES.find(p=>p.value===s.package_name)?.labelEn||s.package_name||'—'}</td>
                <td style={{ padding:'11px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>{fmtMoney(s.amount_paid)}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(s.sale_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── ADMIN: Lead Detail Panel ─────────────────────────────────────────────────
function AdminLeadDetailPanel({ C, leadId, onClose, onUpdated, employees }) {
  const [lead, setLead]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [noteType, setNoteType]   = useState('note')
  const [note, setNote]       = useState('')
  const [nextDate, setNextDate]   = useState('')
  const [assignTo, setAssignTo]   = useState('')
  const [busy, setBusy]       = useState(false)
  const [err, setErr]         = useState('')

  useEffect(()=>{
    if (!leadId) return
    setLoading(true)
    fetch(`/api/crm/leads/${leadId}`)
      .then(r=>r.json()).then(d=>{
        setLead(d.lead); setStatus(d.lead?.status||''); setNextDate(d.lead?.next_followup_date||'')
        setAssignTo(d.lead?.employee_id||''); setLoading(false)
      }).catch(()=>setLoading(false))
  },[leadId])

  async function save() {
    setErr(''); setBusy(true)
    const body = { status, note:note.trim()||undefined, noteType, nextFollowupDate:nextDate||undefined, assignEmployeeId:assignTo?parseInt(assignTo):null }
    const r = await fetch(`/api/crm/leads/${leadId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { setErr(d.error||'خطأ'); setBusy(false); return }
    setNote(''); setLead(d.lead); setBusy(false)
    if (onUpdated) onUpdated()
  }

  const sel = { width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit' }
  const noteIcons = { call:'📞', whatsapp:'💬', meeting:'🤝', note:'📝' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }} onClick={onClose}>
      <div style={{ flex:1, background:'rgba(0,0,0,0.5)' }} />
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ width:480, background:C.surface, height:'100%', display:'flex', flexDirection:'column', borderRight:`1px solid ${C.g20}`, boxShadow:'-8px 0 40px rgba(0,0,0,0.4)', overflowY:'auto' }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.g20}`, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
          <div style={{ flex:1 }}>
            {loading ? <p style={{ color:C.silver }}>جارٍ التحميل...</p> : (<>
              <p style={{ color:C.white, fontWeight:700, fontSize:16, marginBottom:2 }}>{lead?.customer_name}</p>
              <p style={{ color:C.silver, fontSize:12 }} dir="ltr">{lead?.phone} <span style={{ color:C.gold, marginRight:8 }}>• {lead?.employee_name||'غير محدد'}</span></p>
            </>)}
          </div>
        </div>
        {loading ? <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.silver }}>جارٍ التحميل...</div>
        : lead ? (<>
          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['تاريخ الإضافة',fmtDate(lead.created_at)],['آخر تواصل',fmtDate(lead.last_contact_date)],['موعد المتابعة',fmtDate(lead.next_followup_date)]].map(([l,v])=>(
              <div key={l}><p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>{l}</p><p style={{ color:C.white, fontSize:13 }}>{v}</p></div>
            ))}
          </div>

          <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ color:C.gold, fontWeight:700, fontSize:13 }}>⚙️ تعديل الـ Lead</p>
            {err && <div style={{ color:C.red, fontSize:12, padding:'6px 10px', background:`${C.red}15`, borderRadius:8 }}>{err}</div>}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>الحالة</label>
                <select value={status} onChange={e=>setStatus(e.target.value)} style={sel}>{STATUS_ORDER.map(s=><option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}</select></div>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>تعيين لموظف</label>
                <select value={assignTo} onChange={e=>setAssignTo(e.target.value)} style={sel}>
                  <option value="">— بدون موظف —</option>
                  {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
                </select></div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>نوع الملاحظة</label>
                <select value={noteType} onChange={e=>setNoteType(e.target.value)} style={sel}>{NOTE_TYPES.map(t=><option key={t.value} value={t.value}>{t.labelAr}</option>)}</select></div>
              <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>موعد المتابعة</label>
                <input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} style={{ ...sel, boxSizing:'border-box' }} /></div>
            </div>

            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>ملاحظة</label>
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} style={{ ...sel, resize:'vertical', boxSizing:'border-box', direction:'rtl' }} placeholder="أضف ملاحظة للأدمن..." /></div>

            <button onClick={save} disabled={busy} style={{ width:'100%', padding:10, borderRadius:10, background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:13, fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>
              {busy?'⏳ جارٍ الحفظ...':'💾 حفظ التغييرات'}
            </button>
          </div>

          <div style={{ padding:'14px 20px', flex:1 }}>
            <p style={{ color:C.gold, fontWeight:700, fontSize:13, marginBottom:12 }}>📋 سجل النشاط</p>
            {(lead.notes||[]).length===0 ? <p style={{ color:C.silver, fontSize:13, textAlign:'center', padding:20 }}>لا يوجد سجل نشاط بعد</p>
            : (lead.notes||[]).map((n,i)=>(
              <div key={i} style={{ display:'flex', gap:12, marginBottom:14 }}>
                <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:C.g15, border:`1px solid ${C.g20}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>{noteIcons[n.note_type]||'📝'}</div>
                  {i<lead.notes.length-1 && <div style={{ width:1, flex:1, background:C.g20, marginTop:4, minHeight:16 }} />}
                </div>
                <div style={{ flex:1, paddingBottom:i<lead.notes.length-1?8:0 }}>
                  <span style={{ color:C.white, fontSize:12, fontWeight:600 }}>{NOTE_TYPES.find(t=>t.value===n.note_type)?.labelAr||'📝'}</span>
                  {n.text&&<p style={{ color:C.white, fontSize:13, margin:'4px 0' }}>{n.text}</p>}
                  <p style={{ color:C.silver, fontSize:11 }}>{fmtDate(n.created_at)} — {fmtTime(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </>) : <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.red }}>لم يتم العثور على العميل</div>}
      </div>
    </div>
  )
}

// ─── ADMIN: Transfer Leads Modal ─────────────────────────────────────────────
function TransferLeadsModal({ C, employees, onClose, onDone }) {
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState('')
  const [result, setResult] = useState(null)

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'9px 12px', color:C.white, fontSize:13, width:'100%', fontFamily:'inherit', boxSizing:'border-box', appearance:'none' }

  async function doTransfer() {
    setErr(''); setBusy(true); setResult(null)
    if (!from || !to) { setErr('اختر الموظف المصدر والهدف'); setBusy(false); return }
    if (from === to) { setErr('الموظف المصدر والهدف متطابقان'); setBusy(false); return }
    try {
      const r = await fetch('/api/crm/leads/transfer', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ fromEmployeeId:parseInt(from), toEmployeeId:parseInt(to), status:status||undefined }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||'فشل النقل')
      setResult(d.transferred)
    } catch(e) { setErr(e.message) } finally { setBusy(false) }
  }

  const fromName = (employees||[]).find(e=>String(e.id)===from)?.name || ''
  const toName   = (employees||[]).find(e=>String(e.id)===to)?.name   || ''

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }} onClick={onClose}>
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:28, maxWidth:460, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:C.white, fontWeight:900, fontSize:17 }}>🔄 نقل ليدز بين موظفين</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        {result !== null ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <p style={{ color:C.gold, fontWeight:900, fontSize:20, marginBottom:8 }}>تم النقل!</p>
            <p style={{ color:C.silver, fontSize:14 }}>تم نقل <span style={{ color:C.white, fontWeight:700 }}>{result}</span> lead من <span style={{ color:C.gold }}>{fromName}</span> إلى <span style={{ color:C.emerald }}>{toName}</span></p>
            <button onClick={onDone} style={{ marginTop:20, padding:'10px 32px', borderRadius:12, background:C.gold, border:'none', color:C.navy, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>حسناً</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {err && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:10, padding:'9px 14px', color:C.red, fontSize:13 }}>{err}</div>}
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>من موظف *</label>
              <select style={inp} value={from} onChange={e=>setFrom(e.target.value)}>
                <option value="">— اختر الموظف المصدر —</option>
                {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>إلى موظف *</label>
              <select style={inp} value={to} onChange={e=>setTo(e.target.value)}>
                <option value="">— اختر الموظف الهدف —</option>
                {(employees||[]).filter(e=>String(e.id)!==from).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>حالة الليدز (اختياري — فارغ = كل الحالات)</label>
              <select style={inp} value={status} onChange={e=>setStatus(e.target.value)}>
                <option value="">كل الحالات</option>
                {STATUS_ORDER.map(s=><option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}
              </select>
            </div>
            {from && to && (
              <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'10px 14px', color:C.silver, fontSize:13 }}>
                سيتم نقل {status ? `ليدز "${STATUS_META[status]?.ar}"` : 'جميع الليدز'} من <span style={{ color:C.gold, fontWeight:700 }}>{fromName}</span> إلى <span style={{ color:C.emerald, fontWeight:700 }}>{toName}</span>
              </div>
            )}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <button type="button" onClick={onClose} style={{ padding:'10px 20px', borderRadius:10, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:13, cursor:'pointer' }}>إلغاء</button>
              <button onClick={doTransfer} disabled={busy||!from||!to} style={{ padding:'10px 28px', borderRadius:10, background:busy||!from||!to?C.g15:C.purple, border:'none', color:busy||!from||!to?C.silver:'#fff', fontSize:14, fontWeight:700, cursor:busy||!from||!to?'not-allowed':'pointer', fontFamily:'inherit' }}>
                {busy ? '⏳ جارٍ النقل...' : '🔄 نقل الليدز'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN: Transfer Selected Leads Modal ─────────────────────────────────────
function TransferSelectedModal({ C, employees, leadIds, onClose, onDone }) {
  const [to, setTo]     = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr]   = useState('')
  const [done, setDone] = useState(null)

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'9px 12px', color:C.white, fontSize:13, width:'100%', fontFamily:'inherit', boxSizing:'border-box', appearance:'none' }

  async function doTransfer() {
    if (!to) { setErr('اختر موظفاً'); return }
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/crm/leads/transfer', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ leadIds, toEmployeeId:parseInt(to) }) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error||'فشل النقل')
      setDone(d.transferred)
    } catch(e) { setErr(e.message); setBusy(false) }
  }

  const toName = (employees||[]).find(e=>String(e.id)===to)?.name || ''

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }} onClick={onClose}>
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:28, maxWidth:420, width:'100%' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:C.white, fontWeight:900, fontSize:17 }}>🔀 نقل الليدز المحددة</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        {done !== null ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <p style={{ color:C.gold, fontWeight:900, fontSize:20, marginBottom:8 }}>تم النقل!</p>
            <p style={{ color:C.silver, fontSize:14 }}>تم نقل <span style={{ color:C.white, fontWeight:700 }}>{done}</span> lead إلى <span style={{ color:C.emerald }}>{toName}</span></p>
            <button onClick={()=>onDone(done)} style={{ marginTop:20, padding:'10px 32px', borderRadius:12, background:C.gold, border:'none', color:C.navy, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>حسناً</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'10px 14px', color:C.silver, fontSize:13 }}>
              <span style={{ color:C.purple, fontWeight:700 }}>{leadIds.length}</span> lead محددة جاهزة للنقل
            </div>
            {err && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:10, padding:'9px 14px', color:C.red, fontSize:13 }}>{err}</div>}
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>إلى موظف *</label>
              <select style={inp} value={to} onChange={e=>setTo(e.target.value)}>
                <option value="">— اختر الموظف الهدف —</option>
                {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
              <button type="button" onClick={onClose} style={{ padding:'10px 20px', borderRadius:10, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:13, cursor:'pointer' }}>إلغاء</button>
              <button onClick={doTransfer} disabled={busy||!to} style={{ padding:'10px 28px', borderRadius:10, background:busy||!to?C.g15:C.purple, border:'none', color:busy||!to?C.silver:'#fff', fontSize:14, fontWeight:700, cursor:busy||!to?'not-allowed':'pointer', fontFamily:'inherit' }}>
                {busy ? '⏳ جارٍ النقل...' : `🔀 نقل ${leadIds.length} lead`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ADMIN: Leads Management ──────────────────────────────────────────────────
function AdminLeadsPage({ C, employees }) {
  const [leads, setLeads]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [empFilter, setEmpFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState(new Set())
  const [showTransferSelected, setShowTransferSelected] = useState(false)
  const timer = useRef()
  const LIMIT = 40

  const load = useCallback(async (q, eid, st, pg) => {
    setLoading(true)
    setSelectedLeads(new Set())
    try {
      const params = new URLSearchParams({ q, page:pg, limit:LIMIT })
      if (eid) params.set('employeeId', eid)
      if (st) params.set('status', st)
      const r = await fetch(`/api/crm/leads?${params}`)
      const d = await r.json()
      setLeads(d.leads||[]); setTotal(d.total||0)
    } catch(e) {
      console.error('leads load error:', e)
      setLeads([]); setTotal(0)
    } finally {
      setLoading(false)
    }
  },[])

  useEffect(()=>{ load(search, empFilter, statusFilter, page) },[search, empFilter, statusFilter, page])

  function handleSearch(v) {
    setSearchVal(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(()=>{ setSearch(v); setPage(1) }, 400)
  }

  const th = { padding:'11px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }
  const td = { padding:'11px 14px', fontSize:13 }
  const sel = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }

  return (
    <div dir="rtl">
      <h1 style={{ color:C.white, fontWeight:900, fontSize:18, marginBottom:16 }}>🎯 إدارة العملاء المحتملين</h1>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={searchVal} onChange={e=>handleSearch(e.target.value)} placeholder="ابحث بالاسم أو الرقم..."
          style={{ flex:1, minWidth:220, background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'8px 14px', color:C.white, fontSize:13, fontFamily:'inherit', outline:'none' }} />
        <select value={empFilter} onChange={e=>{setEmpFilter(e.target.value);setPage(1)}} style={sel}>
          <option value="">كل الموظفين</option>
          {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1)}} style={sel}>
          <option value="">كل الحالات</option>
          {STATUS_ORDER.map(s=><option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}
        </select>
        <div style={{ background:C.g15, border:`1px solid ${C.g30}`, borderRadius:8, padding:'8px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>{total.toLocaleString()} lead</div>
        <button onClick={()=>setShowTransfer(true)} style={{ padding:'8px 16px', borderRadius:8, background:'none', border:`1px solid ${C.purple}44`, color:C.purple, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>🔄 نقل ليدز</button>
      </div>

      {selectedLeads.size > 0 && (
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, background:`${C.purple}18`, border:`1px solid ${C.purple}44`, borderRadius:12, padding:'10px 16px' }}>
          <span style={{ color:C.purple, fontWeight:700, fontSize:14 }}>{selectedLeads.size} lead محدد</span>
          <span style={{ flex:1 }} />
          <button onClick={()=>setSelectedLeads(new Set())} style={{ padding:'6px 14px', borderRadius:8, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>إلغاء التحديد</button>
          <button onClick={()=>setShowTransferSelected(true)} style={{ padding:'6px 16px', borderRadius:8, background:C.purple, border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🔀 نقل المحدد</button>
        </div>
      )}

      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.g15 }}>
            <th style={{ ...th, width:38, padding:'11px 8px 11px 14px' }}>
              <input type="checkbox"
                checked={leads.length>0 && leads.every(l=>selectedLeads.has(l.id))}
                ref={el=>{ if(el) el.indeterminate = leads.some(l=>selectedLeads.has(l.id)) && !leads.every(l=>selectedLeads.has(l.id)) }}
                onChange={()=>{
                  const allSel = leads.every(l=>selectedLeads.has(l.id))
                  setSelectedLeads(prev=>{ const s=new Set(prev); leads.forEach(l=>allSel?s.delete(l.id):s.add(l.id)); return s })
                }}
                style={{ cursor:'pointer', accentColor:C.purple, width:15, height:15 }}
              />
            </th>
            {['NAME','PHONE','الموظف','CREATED','STATUS','FOLLOW-UP'].map(h=><th key={h} style={th}>{h}</th>)}
            <th style={{ ...th, width:40 }} />
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            : leads.length===0 ? <tr><td colSpan={8} style={{ padding:50, textAlign:'center', color:C.silver }}>لا توجد نتائج</td></tr>
            : leads.map(lead=>{
              const isSel = selectedLeads.has(lead.id)
              return (
                <tr key={lead.id} onClick={()=>setSelectedId(lead.id)} style={{ borderTop:`1px solid ${C.g15}`, cursor:'pointer', background:isSel?`${C.purple}12`:'' }}
                  onMouseEnter={e=>e.currentTarget.style.background=isSel?`${C.purple}1E`:C.g10}
                  onMouseLeave={e=>e.currentTarget.style.background=isSel?`${C.purple}12`:''}>
                  <td style={{ padding:'11px 8px 11px 14px' }} onClick={e=>{ e.stopPropagation(); setSelectedLeads(prev=>{ const s=new Set(prev); isSel?s.delete(lead.id):s.add(lead.id); return s }) }}>
                    <input type="checkbox" checked={isSel} onChange={()=>{}} style={{ cursor:'pointer', accentColor:C.purple, width:15, height:15 }} />
                  </td>
                  <td style={{ ...td, color:C.white, fontWeight:600 }}>{lead.customer_name}</td>
                  <td style={{ ...td, color:C.silver }} dir="ltr">{lead.phone}</td>
                  <td style={{ ...td, color:C.gold, fontSize:12 }}>{lead.employee_name||<span style={{ color:C.silver }}>—</span>}</td>
                  <td style={{ ...td, color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(lead.created_at)}</td>
                  <td style={{ ...td }}><span style={{ color:sc(lead.status,C), fontSize:11, background:`${sc(lead.status,C)}20`, padding:'3px 10px', borderRadius:20 }}>{STATUS_META[lead.status]?.ar}</span></td>
                  <td style={{ ...td, color:lead.next_followup_date?C.orange:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(lead.next_followup_date)}</td>
                  <td style={{ padding:'4px 8px' }} onClick={e=>e.stopPropagation()}>
                    <button onClick={async()=>{
                      if (!confirm(`حذف "${lead.customer_name}"؟`)) return
                      await fetch(`/api/crm/leads/${lead.id}`, { method:'DELETE' })
                      setLeads(prev=>prev.filter(l=>l.id!==lead.id))
                      setTotal(prev=>prev-1)
                      setSelectedLeads(prev=>{ const s=new Set(prev); s.delete(lead.id); return s })
                    }} style={{ width:28, height:28, borderRadius:7, background:`${C.red}15`, border:`1px solid ${C.red}30`, color:C.red, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🗑</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {total > LIMIT && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16, alignItems:'center' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 14px', borderRadius:8, background:page===1?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page===1?C.silver:C.white, cursor:page===1?'default':'pointer', fontSize:13 }}>السابق</button>
          <span style={{ color:C.silver, fontSize:13 }}>صفحة {page} من {Math.ceil(total/LIMIT)}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/LIMIT)} style={{ padding:'6px 14px', borderRadius:8, background:page>=Math.ceil(total/LIMIT)?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page>=Math.ceil(total/LIMIT)?C.silver:C.white, cursor:page>=Math.ceil(total/LIMIT)?'default':'pointer', fontSize:13 }}>التالي</button>
        </div>
      )}

      {showTransfer && <TransferLeadsModal C={C} employees={employees} onClose={()=>setShowTransfer(false)} onDone={()=>{ setShowTransfer(false); load(search,empFilter,statusFilter,page) }} />}
      {showTransferSelected && <TransferSelectedModal C={C} employees={employees} leadIds={[...selectedLeads]} onClose={()=>setShowTransferSelected(false)} onDone={()=>{ setShowTransferSelected(false); setSelectedLeads(new Set()); load(search,empFilter,statusFilter,page) }} />}
      {selectedId && <AdminLeadDetailPanel C={C} leadId={selectedId} onClose={()=>setSelectedId(null)} onUpdated={()=>load(search,empFilter,statusFilter,page)} employees={employees} />}
    </div>
  )
}

// ─── ADMIN: Employees ─────────────────────────────────────────────────────────
function AdminEmployeesPage({ C, onEmployeesChange }) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ username:'', password:'', name:'', monthlyTarget:0 })
  const [busy, setBusy]           = useState(false)
  const [error, setError]         = useState('')

  async function load() {
    setLoading(true)
    const r = await fetch('/api/admin/employees'); const d = await r.json()
    setEmployees(d.employees||[])
    if (onEmployeesChange) onEmployeesChange(d.employees||[])
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  async function create(e) {
    e.preventDefault(); setError(''); setBusy(true)
    const r = await fetch('/api/admin/employees', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const d = await r.json()
    if (!r.ok) { setError(d.error||'خطأ'); setBusy(false); return }
    setShowForm(false); setForm({username:'',password:'',name:'',monthlyTarget:0}); await load(); setBusy(false)
  }

  async function del(id, name) {
    if (!confirm(`⚠️ حذف ${name}؟`)) return
    await fetch(`/api/admin/employees?id=${id}`, { method:'DELETE' })
    await load()
  }

  async function updateTarget(id, target) {
    await fetch('/api/admin/employees', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, monthlyTarget:Number(target) }) })
    await load()
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'9px 12px', color:C.white, fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box', width:'100%' }

  return (
    <div dir="rtl">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h1 style={{ color:C.white, fontWeight:900, fontSize:18 }}>👥 إدارة الموظفين</h1>
        <button onClick={()=>setShowForm(!showForm)} style={{ padding:'8px 18px', borderRadius:10, background:C.gold, border:'none', color:C.navy, fontSize:13, fontWeight:700, cursor:'pointer' }}>+ إضافة موظف</button>
      </div>

      {showForm && (
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, padding:20, marginBottom:20 }}>
          <h3 style={{ color:C.gold, fontWeight:700, fontSize:14, marginBottom:14 }}>موظف جديد</h3>
          <form onSubmit={create} style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>الاسم الكامل *</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>اسم المستخدم *</label><input style={{ ...inp, direction:'ltr' }} value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>كلمة المرور (12+ حرف)</label><input type="password" style={{ ...inp, direction:'ltr' }} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
            <div><label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>الهدف الشهري (JOD)</label><input type="number" style={inp} value={form.monthlyTarget} onChange={e=>setForm({...form,monthlyTarget:Number(e.target.value)})} min="0" placeholder="مثال: 5000" /></div>
            {error && <div style={{ gridColumn:'1/-1', color:C.red, fontSize:12, padding:'6px 10px', background:`${C.red}15`, borderRadius:8 }}>{error}</div>}
            <div style={{ gridColumn:'1/-1', display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" onClick={()=>setShowForm(false)} style={{ padding:'8px 18px', borderRadius:8, background:'none', border:`1px solid ${C.g30}`, color:C.silver, fontSize:13, cursor:'pointer' }}>إلغاء</button>
              <button type="submit" disabled={busy} style={{ padding:'8px 22px', borderRadius:8, background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:13, fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>{busy?'⏳ جارٍ الحفظ...':'✅ إضافة'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign:'center', padding:40, color:C.silver }}>جارٍ التحميل...</div>
      : employees.length===0 ? <div style={{ textAlign:'center', padding:60, color:C.silver }}>لا يوجد موظفون. أضف موظفاً الآن.</div>
      : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:14 }}>
          {employees.map(emp=>(
            <div key={emp.id} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:18 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:C.g20, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontWeight:700, fontSize:18, flexShrink:0 }}>{emp.name[0]}</div>
                <div style={{ flex:1 }}>
                  <p style={{ color:C.white, fontWeight:700, fontSize:15 }}>{emp.name}</p>
                  <p style={{ color:C.silver, fontSize:12 }}>@{emp.username}</p>
                </div>
                <button onClick={()=>del(emp.id,emp.name)} style={{ width:30, height:30, borderRadius:8, background:`${C.red}15`, border:`1px solid ${C.red}40`, color:C.red, cursor:'pointer', fontSize:13 }}>🗑</button>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div style={{ background:C.g15, borderRadius:10, padding:'10px 14px' }}>
                  <p style={{ color:C.silver, fontSize:11, marginBottom:4 }}>إيراد الشهر</p>
                  <p style={{ color:C.gold, fontSize:14, fontWeight:700 }}>{fmtMoney(emp.stats?.revenueThisMonth||0)}</p>
                </div>
                <div style={{ background:C.g15, borderRadius:10, padding:'10px 14px' }}>
                  <p style={{ color:C.silver, fontSize:11, marginBottom:4 }}>مكالمات الشهر</p>
                  <p style={{ color:C.white, fontSize:14, fontWeight:700 }}>{emp.stats?.totalCalls||0}</p>
                </div>
              </div>

              {/* Target */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ color:C.silver, fontSize:11 }}>الهدف الشهري (JOD)</span>
                  <span style={{ color:C.gold, fontSize:12, fontWeight:700 }}>{emp.stats?.targetProgress||0}%</span>
                </div>
                <ProgressBar C={C} pct={emp.stats?.targetProgress||0} />
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                  <input type="number" min="0"
                    defaultValue={emp.monthly_target||0}
                    onBlur={e=>updateTarget(emp.id, e.target.value)}
                    style={{ flex:1, background:C.g20, border:`1px solid ${C.g30}`, borderRadius:8, padding:'6px 10px', color:C.white, fontSize:12, fontFamily:'inherit', outline:'none' }}
                    placeholder="الهدف (JOD)"
                  />
                  <span style={{ color:C.silver, fontSize:11 }}>JOD</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── ADMIN: OpenC Management ──────────────────────────────────────────────────
function AdminOpenCPage({ C }) {
  return (
    <div dir="rtl">
      <h1 style={{ color:C.white, fontWeight:900, fontSize:18, marginBottom:20 }}>♻️ إدارة OpenC Pool</h1>
      <OpenCPool C={C} lang="ar" role="admin" />
    </div>
  )
}

// ─── ADMIN: All Sales ─────────────────────────────────────────────────────────
function AdminSalesPage({ C, employees, onPendingCountChange }) {
  const [records, setRecords]       = useState([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [month, setMonth]           = useState(new Date().getMonth()+1)
  const [year, setYear]             = useState(new Date().getFullYear())
  const [empFilter, setEmpFilter]   = useState('')
  const [stats, setStats]           = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [editRecord, setEditRecord]   = useState(null)
  const [pendingSales, setPendingSales]       = useState([])
  const [loadingPending, setLoadingPending]   = useState(true)
  const [approveLoading, setApproveLoading]   = useState(null) // id being processed
  const [approveResult, setApproveResult]     = useState(null) // { type:'approve'|'reject', sale }

  useEffect(()=>{ loadRecords() },[month, year, empFilter])
  useEffect(()=>{ fetch('/api/crm/stats').then(r=>r.json()).then(d=>setStats(d)).catch(()=>{}) },[])
  useEffect(()=>{ loadPending() },[])

  async function loadPending() {
    setLoadingPending(true)
    try {
      const r = await fetch('/api/sales/records?approvalStatus=pending')
      const d = await r.json()
      const list = d.records||[]
      setPendingSales(list)
      onPendingCountChange?.(list.length)
    } catch { setPendingSales([]) } finally { setLoadingPending(false) }
  }

  async function loadRecords() {
    setLoading(true)
    try {
      let url = `/api/sales/records?month=${month}&year=${year}&limit=200`
      if (empFilter) url += `&employeeId=${empFilter}`
      const r = await fetch(url); const d = await r.json()
      setRecords(d.records||[]); setTotal(d.total||0)
    } catch { setRecords([]); setTotal(0) } finally { setLoading(false) }
  }

  async function handleApprove(id) {
    setApproveLoading(id)
    try {
      const r = await fetch('/api/sales/records/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, action:'approve' }) })
      const d = await r.json()
      if (!r.ok) { alert(d.error||'خطأ في الموافقة'); return }
      setApproveResult({ type:'approve', sale: pendingSales.find(s=>s.id===id), account: d.studentAccount })
      await loadPending()
      await loadRecords()
    } catch (e) { alert(e.message) } finally { setApproveLoading(null) }
  }

  async function handleReject(id) {
    if (!confirm('هل تريد رفض هذه البيعة؟')) return
    setApproveLoading(id)
    try {
      const r = await fetch('/api/sales/records/approve', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id, action:'reject' }) })
      const d = await r.json()
      if (!r.ok) { alert(d.error||'خطأ في الرفض'); return }
      setApproveResult({ type:'reject', sale: pendingSales.find(s=>s.id===id) })
      await loadPending()
      await loadRecords()
    } catch (e) { alert(e.message) } finally { setApproveLoading(null) }
  }

  const years = [new Date().getFullYear(), new Date().getFullYear()-1]
  const months = Array.from({length:12},(_,i)=>i+1)
  const thStyle = { padding:'10px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap', borderBottom:`1px solid ${C.g20}` }
  const tdStyle = { padding:'11px 14px', fontSize:13 }

  return (
    <div dir="rtl">
      <h1 style={{ color:C.white, fontWeight:900, fontSize:18, marginBottom:18 }}>💰 جميع البيعات</h1>

      {/* ── Pending Sales Section ───────────────────────────────────────── */}
      {(loadingPending || pendingSales.length > 0) && (
        <div style={{ marginBottom:28, background:`${C.orange}10`, border:`1px solid ${C.orange}40`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.orange}30`, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:16 }}>⏳</span>
            <span style={{ color:C.orange, fontWeight:800, fontSize:15 }}>مبيعات بانتظار الموافقة</span>
            {!loadingPending && <span style={{ background:C.orange, color:'#fff', borderRadius:20, fontSize:11, fontWeight:700, padding:'2px 10px', marginRight:4 }}>{pendingSales.length}</span>}
          </div>
          {loadingPending ? (
            <div style={{ padding:30, textAlign:'center', color:C.silver }}>جارٍ التحميل...</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr style={{ background:`${C.orange}08` }}>
                {['الطالب','الهاتف','الموظف','الباقة','المبلغ','التاريخ','الإجراء'].map(h=><th key={h} style={{ ...thStyle, color:C.orange }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {pendingSales.map(s=>(
                  <tr key={s.id} style={{ borderTop:`1px solid ${C.orange}20` }}>
                    <td style={{ ...tdStyle, color:C.white, fontWeight:600 }}>{s.student_name}</td>
                    <td style={{ ...tdStyle, color:C.silver }} dir="ltr">{s.student_phone}</td>
                    <td style={{ ...tdStyle, color:C.gold, fontSize:12 }}>{s.employee_name||'—'}</td>
                    <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PACKAGES.find(p=>p.value===s.package_name)?.labelAr||s.package_name}</td>
                    <td style={{ ...tdStyle, color:C.gold, fontWeight:700 }}>{fmtMoney(s.amount_paid)}</td>
                    <td style={{ ...tdStyle, color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(s.sale_date)}</td>
                    <td style={{ ...tdStyle }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button
                          disabled={approveLoading===s.id}
                          onClick={()=>handleApprove(s.id)}
                          style={{ background:C.emerald, color:'#fff', border:'none', borderRadius:8, padding:'5px 14px', fontSize:12, fontWeight:700, cursor:'pointer', opacity:approveLoading===s.id?0.6:1, fontFamily:'inherit' }}
                        >{approveLoading===s.id?'...':'✓ قبول'}</button>
                        <button
                          disabled={approveLoading===s.id}
                          onClick={()=>handleReject(s.id)}
                          style={{ background:C.red, color:'#fff', border:'none', borderRadius:8, padding:'5px 14px', fontSize:12, fontWeight:700, cursor:'pointer', opacity:approveLoading===s.id?0.6:1, fontFamily:'inherit' }}
                        >{approveLoading===s.id?'...':'✗ رفض'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Approve result toast ─────────────────────────────────────────── */}
      {approveResult && (
        <div style={{ position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)', zIndex:200, background:approveResult.type==='approve'?C.emerald:C.red, color:'#fff', borderRadius:14, padding:'12px 24px', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 24px rgba(0,0,0,0.3)' }}>
          {approveResult.type==='approve' ? `✅ تم قبول بيعة ${approveResult.sale?.student_name} — حساب: ${approveResult.account?.username||''}` : `❌ تم رفض بيعة ${approveResult.sale?.student_name}`}
          <button onClick={()=>setApproveResult(null)} style={{ background:'rgba(255,255,255,0.3)', border:'none', borderRadius:8, color:'#fff', cursor:'pointer', padding:'2px 10px', fontSize:14, fontFamily:'inherit' }}>✕</button>
        </div>
      )}

      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          <StatCard C={C} label="بيعات الشهر"  value={stats.salesMonth}               accent="gold"    />
          <StatCard C={C} label="إيراد الشهر"  value={fmtMoney(stats.revenueMonth)}   accent="emerald" />
          <StatCard C={C} label="بيعات السنة"  value={stats.salesMonth*12}            accent="gold"    />
          <StatCard C={C} label="إيراد السنة"  value={fmtMoney(stats.revenueYear)}    accent="emerald" />
        </div>
      )}

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          <option value="">كل الموظفين</option>
          {(employees||[]).map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div style={{ marginRight:'auto', background:C.g15, border:`1px solid ${C.g30}`, borderRadius:8, padding:'8px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>{total} بيعة</div>
        <button onClick={()=>setShowCreate(true)} style={{ background:C.gold, color:C.navy, border:'none', borderRadius:8, padding:'8px 18px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>+ بيعة جديدة</button>
      </div>

      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:C.g15 }}>
            {['CUSTOMER','PHONE','EMPLOYEE','PRODUCT','AMOUNT','DEPOSIT','PAYMENT','DATE','STATUS',''].map(h=><th key={h} style={thStyle}>{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={10} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            : records.length===0 ? <tr><td colSpan={10} style={{ padding:60, textAlign:'center', color:C.silver }}>لا توجد بيعات</td></tr>
            : records.map(r=>{
              const ss = SALE_STATUSES.find(x=>x.value===r.sale_status)
              const sColor = ss?C[ss.color]:C.silver
              return (
                <tr key={r.id} style={{ borderTop:`1px solid ${C.g15}` }}>
                  <td style={{ ...tdStyle, color:C.white, fontWeight:600 }}>{r.student_name}</td>
                  <td style={{ ...tdStyle, color:C.silver }} dir="ltr">{r.student_phone}</td>
                  <td style={{ ...tdStyle, color:C.gold, fontSize:12 }}>{r.employee_name||'—'}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PACKAGES.find(p=>p.value===r.package_name)?.labelEn||r.package_name}</td>
                  <td style={{ ...tdStyle, color:C.gold, fontWeight:700 }}>{fmtMoney(r.amount_paid)}</td>
                  <td style={{ ...tdStyle, color:C.silver }}>{fmtMoney(r.deposit)}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PAYMENT_METHODS.find(p=>p.value===r.payment_method)?.labelAr||r.payment_method}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(r.sale_date)}</td>
                  <td style={{ ...tdStyle }}><span style={{ color:sColor, fontSize:11, background:`${sColor}20`, padding:'3px 10px', borderRadius:20 }}>{ss?.labelAr||r.sale_status}</span></td>
                  <td style={{ ...tdStyle }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>setEditRecord(r)} style={{ padding:'4px 12px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, cursor:'pointer' }}>✏️ تعديل</button>
                      {r.proof_image_url && <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" style={{ padding:'4px 10px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, textDecoration:'none' }}>📷</a>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {showCreate && <CreateSaleModal C={C} employees={employees} isAdmin={true} onClose={()=>setShowCreate(false)} onSuccess={d=>{setShowCreate(false);setSuccessData(d);loadRecords()}} />}
      {successData && <SaleSuccessModal C={C} data={successData} onClose={()=>setSuccessData(null)} />}
      {editRecord && <EditSaleModal C={C} record={editRecord} onClose={()=>setEditRecord(null)} onSuccess={()=>{ setEditRecord(null); loadRecords() }} />}
    </div>
  )
}

// ─── ADMIN: Import Leads ──────────────────────────────────────────────────────
function AdminImportPage({ C, employees }) {
  return (
    <div dir="rtl">
      <h1 style={{ color:C.white, fontWeight:900, fontSize:18, marginBottom:20 }}>📥 استيراد العملاء المحتملين</h1>
      <ImportLeadsPanel C={C} lang="ar" employees={employees||[]} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PORTALS
// ═══════════════════════════════════════════════════════════════════════════════

function EmployeePortal({ C, user }) {
  const [view, setView]       = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [followupCount, setFollowupCount] = useState(0)
  const [opencCount, setOpencCount]       = useState(0)

  useEffect(()=>{
    fetch('/api/sales/leads-page?tab=followups&limit=1')
      .then(r=>r.json()).then(d=>setFollowupCount(d.total||0)).catch(()=>{})
    fetch('/api/sales/leads-page?tab=openc&limit=1')
      .then(r=>r.json()).then(d=>setOpencCount(d.total||0)).catch(()=>{})
  },[])

  const navItems = [
    { id:'home',   icon:'🏠', label:'الرئيسية',            badge:0 },
    { id:'leads',  icon:'🎯', label:'العملاء المحتملون',    badge:followupCount + opencCount },
    { id:'openc',  icon:'♻️', label:'OpenC Pool',          badge:0 },
    { id:'sales',  icon:'💰', label:'البيعات',              badge:0 },
  ]
  const titles = { home:'الرئيسية', leads:'العملاء المحتملون', openc:'OpenC Pool', sales:'البيعات' }

  async function logout() { await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/' }

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.navy, fontFamily:"'Cairo',sans-serif" }}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={logout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex:1, marginRight:collapsed?72:240, transition:'margin 0.2s', display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ background:C.surface, borderBottom:`1px solid ${C.g20}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <span style={{ color:C.gold, fontWeight:700, fontSize:16 }}>{titles[view]}</span>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ color:C.silver, fontSize:13 }}>{user.name}</span>
            <a href="/dashboard" style={{ color:C.silver, fontSize:12, textDecoration:'none', padding:'4px 10px', border:`1px solid ${C.g20}`, borderRadius:8 }}>← الأكاديمية</a>
          </div>
        </header>
        <div style={{ padding:24, flex:1 }}>
          {view==='home'  && <HomeDashboard C={C} employeeName={user.name} />}
          {view==='leads' && <LeadsPage C={C} />}
          {view==='openc' && <OpenCPool C={C} lang="ar" role="employee" currentEmployee={user} />}
          {view==='sales' && <SalesPage C={C} />}
        </div>
      </main>
    </div>
  )
}

function AdminPortal({ C, user }) {
  const [view, setView]           = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [employees, setEmployees] = useState([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(()=>{
    fetch('/api/admin/employees').then(r=>r.json()).then(d=>setEmployees(d.employees||[])).catch(()=>{})
    fetch('/api/sales/records?approvalStatus=pending').then(r=>r.json()).then(d=>setPendingCount((d.records||[]).length)).catch(()=>{})
  },[])

  const navItems = [
    { id:'dashboard',  icon:'📊', label:'لوحة التحكم',         badge:0 },
    { id:'leads',      icon:'🎯', label:'إدارة Leads',          badge:0 },
    { id:'employees',  icon:'👥', label:'الموظفون',              badge:0 },
    { id:'openc',      icon:'♻️', label:'OpenC Pool',           badge:0 },
    { id:'sales',      icon:'💰', label:'جميع البيعات',          badge:pendingCount },
    { id:'import',     icon:'📥', label:'استيراد Leads',         badge:0 },
  ]
  const titles = { dashboard:'لوحة تحكم الشركة', leads:'إدارة العملاء المحتملين', employees:'الموظفون', openc:'OpenC Pool', sales:'جميع البيعات', import:'استيراد Leads' }

  async function logout() { await fetch('/api/auth/logout',{method:'POST'}); window.location.href='/' }

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.navy, fontFamily:"'Cairo',sans-serif" }}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={logout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex:1, marginRight:collapsed?72:240, transition:'margin 0.2s', display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ background:C.surface, borderBottom:`1px solid ${C.g20}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <span style={{ color:C.gold, fontWeight:700, fontSize:16 }}>{titles[view]}</span>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <span style={{ color:C.silver, fontSize:13 }}>أدمن: {user.name}</span>
            <a href="/admin" style={{ color:C.silver, fontSize:12, textDecoration:'none', padding:'4px 10px', border:`1px solid ${C.g20}`, borderRadius:8 }}>← الإدارة</a>
          </div>
        </header>
        <div style={{ padding:24, flex:1 }}>
          {view==='dashboard' && <AdminDashboard C={C} />}
          {view==='leads'     && <AdminLeadsPage C={C} employees={employees} />}
          {view==='employees' && <AdminEmployeesPage C={C} onEmployeesChange={setEmployees} />}
          {view==='openc'     && <AdminOpenCPage C={C} />}
          {view==='sales'     && <AdminSalesPage C={C} employees={employees} onPendingCountChange={setPendingCount} />}
          {view==='import'    && <AdminImportPage C={C} employees={employees} />}
        </div>
      </main>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CrmPage({ user }) {
  const { theme } = useTheme()
  const C = theme === 'dark' ? C_DARK : C_LIGHT

  if (!user) return null

  return (
    <>
      <Head>
        <title>CRM — بشار العسلي أكاديمي</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet" />
      </Head>
      {user.role === 'admin' && <AdminPortal C={C} user={user} />}
      {user.role === 'employee' && <EmployeePortal C={C} user={user} />}
      {user.role !== 'admin' && user.role !== 'employee' && (
        <div dir="rtl" style={{ textAlign:'center', padding:80, color:'#8AAB8A', fontFamily:"'Cairo',sans-serif" }}>
          <p style={{ fontSize:20 }}>⛔ غير مسموح بالوصول</p>
        </div>
      )}
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies.ba_session
  if (!token) return { redirect: { destination: '/login', permanent: false } }
  try {
    const user = verifyToken(token)
    if (user.role !== 'admin' && user.role !== 'employee') return { redirect: { destination: '/dashboard', permanent: false } }
    return { props: { user } }
  } catch {
    return { redirect: { destination: '/login', permanent: false } }
  }
}
