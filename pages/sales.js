import { useState, useEffect, useRef, useCallback } from 'react'
import Head from 'next/head'
import { useTheme } from './_app'
import OpenCPool from '../components/OpenCPool'

// ─── Brand Palette ────────────────────────────────────────────────────────
const C_DARK = {
  navy:'#0A0F0A', gold:'#4ADE80', goldL:'#7AE89F', goldD:'#22A35A',
  blue:'#0F2F0F', surface:'#0D1A0D', emerald:'#34D399', silver:'#8AAB8A',
  locked:'#2A3A2A', white:'#E8F0E8', red:'#F0807A', purple:'#A78BFA',
  orange:'#FB923C',
  g10:'rgba(74,222,128,0.08)', g15:'rgba(74,222,128,0.12)',
  g20:'rgba(74,222,128,0.16)', g30:'rgba(74,222,128,0.26)',
  w10:'rgba(232,240,232,0.10)', w20:'rgba(232,240,232,0.20)',
  w40:'rgba(232,240,232,0.40)', w50:'rgba(232,240,232,0.50)',
}
const C_LIGHT = {
  navy:'#F2F7F0', gold:'#1C8A4D', goldL:'#239B5A', goldD:'#146238',
  blue:'#E8F2E6', surface:'#FFFFFF', emerald:'#0F9D6E', silver:'#5B6B5B',
  locked:'#D7DED5', white:'#142016', red:'#C0463F', purple:'#7C5FD1',
  orange:'#C2610A',
  g10:'rgba(28,138,77,0.06)', g15:'rgba(28,138,77,0.10)',
  g20:'rgba(28,138,77,0.12)', g30:'rgba(28,138,77,0.22)',
  w10:'rgba(20,32,22,0.06)', w20:'rgba(20,32,22,0.12)',
  w40:'rgba(20,32,22,0.25)', w50:'rgba(20,32,22,0.35)',
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
  new:            { ar:'جديد',          en:'New',            color:'silver'  },
  contacted:      { ar:'تم التواصل',     en:'Contacted',      color:'gold'    },
  interested:     { ar:'مهتم',           en:'Interested',     color:'emerald' },
  unreachable:    { ar:'لا يرد',         en:'Unreachable',    color:'purple'  },
  not_interested: { ar:'غير مهتم',       en:'Not Interested', color:'red'     },
  closed_sale:    { ar:'تم البيع',       en:'Closed Sale',    color:'emerald' },
  cancelled:      { ar:'ألغى الفكرة',    en:'Cancelled',      color:'red'     },
}
const STATUS_ORDER = ['new','contacted','interested','unreachable','not_interested','closed_sale','cancelled']
const NOTE_TYPES = [
  { value:'call',      labelAr:'📞 مكالمة',  },
  { value:'whatsapp',  labelAr:'💬 واتساب', },
  { value:'meeting',   labelAr:'🤝 اجتماع', },
  { value:'note',      labelAr:'📝 ملاحظة', },
]
const CALL_STATUSES = [
  { value:'answered',  labelAr:'رد' },
  { value:'no_answer', labelAr:'لم يرد' },
  { value:'busy',      labelAr:'مشغول' },
  { value:'failed',    labelAr:'فشل' },
]

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

// ─── Sidebar ──────────────────────────────────────────────────────────────
function Sidebar({ C, user, view, setView, onLogout, navItems, collapsed, setCollapsed }) {
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
                <p style={{ color:C.gold, fontWeight:900, fontSize:12, marginBottom:2 }}>بشار العسلي</p>
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
            <p style={{ color:C.silver, fontSize:11 }}>@{user.username}</p>
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
      <div style={{ padding:collapsed?'12px 8px':12, borderTop:`1px solid ${C.g20}` }}>
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

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({ C, label, value, sub, accent, icon }) {
  const color = accent === 'gold' ? C.gold : accent === 'emerald' ? C.emerald : accent === 'purple' ? C.purple : accent === 'orange' ? C.orange : C.silver
  return (
    <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <p style={{ color:C.silver, fontSize:12, fontWeight:600 }}>{label}</p>
        {icon && <span style={{ fontSize:20, opacity:0.6 }}>{icon}</span>}
      </div>
      <p style={{ color, fontSize:28, fontWeight:900, lineHeight:1 }}>{value ?? '—'}</p>
      {sub && <p style={{ color:C.silver, fontSize:11 }}>{sub}</p>}
    </div>
  )
}

// ─── Home Dashboard ───────────────────────────────────────────────────────
function HomeDashboard({ C, employeeName }) {
  const [stats, setStats] = useState(null)
  const [empInfo, setEmpInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/sales/dashboard')
      .then(r => r.json())
      .then(d => { setStats(d.stats); setEmpInfo(d.employee); setLoading(false) })
      .catch(() => setLoading(false))
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
      {/* Greeting */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:C.white, fontWeight:900, fontSize:22, marginBottom:4 }}>مرحباً، {employeeName} 👋</h1>
        <p style={{ color:C.silver, fontSize:13 }}>{new Date().toLocaleDateString('ar-JO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* 8 Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
        {cards.map((c,i) => <StatCard key={i} C={C} {...c} />)}
      </div>

      {/* Revenue Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:12 }}>
        <StatCard C={C} label="Revenue Today"      value={fmtMoney(stats.revenueToday)}     accent="emerald" icon="💵" />
        <StatCard C={C} label="Revenue This Month" value={fmtMoney(stats.revenueThisMonth)} accent="emerald" icon="📅" />
        <StatCard C={C} label="Revenue This Year"  value={fmtMoney(stats.revenueThisYear)}  accent="emerald" icon="🗓" />
      </div>

      {/* Monthly Target Progress */}
      {empInfo?.monthlyTarget > 0 && (
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, padding:'18px 22px', marginBottom:28 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
            <span style={{ color:C.white, fontWeight:700, fontSize:14 }}>🎯 الهدف الشهري</span>
            <span style={{ color:C.gold, fontWeight:900, fontSize:16 }}>
              {fmtMoney(stats.revenueThisMonth)} <span style={{ color:C.silver, fontWeight:400, fontSize:13 }}>/ {fmtMoney(empInfo.monthlyTarget)}</span>
            </span>
          </div>
          <div style={{ background:C.g20, borderRadius:20, height:14, overflow:'hidden' }}>
            <div style={{
              width:`${empInfo.targetProgress}%`, height:'100%', borderRadius:20,
              background: empInfo.targetProgress >= 100 ? '#4ADE80' : empInfo.targetProgress >= 60 ? '#F59E0B' : '#EF4444',
              transition:'width 0.6s ease'
            }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
            <span style={{ color:C.silver, fontSize:11 }}>التقدم: {empInfo.targetProgress}%</span>
            <span style={{ color:C.silver, fontSize:11 }}>المتبقي: {fmtMoney(Math.max(0, empInfo.monthlyTarget - stats.revenueThisMonth))}</span>
          </div>
        </div>
      )}

      {/* Today's Follow-ups */}
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

      {/* Recent activity: 2 tables side-by-side */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        {/* Recent Calls */}
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
            <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>📞 آخر المكالمات</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.g15 }}>
                {['العميل','التاريخ'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.recentCalls||[]).length === 0
                ? <tr><td colSpan={2} style={{ padding:24, textAlign:'center', color:C.silver, fontSize:13 }}>لا توجد مكالمات</td></tr>
                : (stats.recentCalls||[]).map((c,i) => (
                  <tr key={i} style={{ borderTop:`1px solid ${C.g15}` }}>
                    <td style={{ padding:'9px 14px', color:C.white, fontSize:13 }}>{c.customer_name || '—'}</td>
                    <td style={{ padding:'9px 14px', color:C.silver, fontSize:12 }}>{fmtDate(c.created_at)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        {/* Recent Sales */}
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.g20}` }}>
            <h2 style={{ color:C.white, fontWeight:700, fontSize:14 }}>💰 آخر البيعات</h2>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:C.g15 }}>
                {['العميل','المبلغ','الحالة'].map(h => (
                  <th key={h} style={{ padding:'8px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.recentSales||[]).length === 0
                ? <tr><td colSpan={3} style={{ padding:24, textAlign:'center', color:C.silver, fontSize:13 }}>لا توجد بيعات</td></tr>
                : (stats.recentSales||[]).map((s,i) => {
                  const ss = SALE_STATUSES.find(x=>x.value===s.sale_status)
                  const sColor = ss ? C[ss.color] : C.silver
                  return (
                    <tr key={i} style={{ borderTop:`1px solid ${C.g15}` }}>
                      <td style={{ padding:'9px 14px', color:C.white, fontSize:13 }}>{s.student_name}</td>
                      <td style={{ padding:'9px 14px', color:C.gold, fontSize:12, fontWeight:700 }}>{fmtMoney(s.amount_paid)}</td>
                      <td style={{ padding:'9px 14px' }}>
                        <span style={{ color:sColor, fontSize:11, background:`${sColor}20`, padding:'2px 8px', borderRadius:20 }}>{ss?.labelAr || s.sale_status}</span>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Lead Detail Panel (slide-in from left) ───────────────────────────────
function LeadDetailPanel({ C, leadId, onClose, onUpdated }) {
  const [lead, setLead]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus]   = useState('')
  const [noteType, setNoteType]    = useState('call')
  const [callStatus, setCallStatus] = useState('answered')
  const [duration, setDuration]    = useState('')
  const [note, setNote]        = useState('')
  const [nextDate, setNextDate]    = useState('')
  const [busy, setBusy]        = useState(false)
  const [err, setErr]          = useState('')

  useEffect(() => {
    if (!leadId) return
    setLoading(true)
    fetch(`/api/sales/lead-detail?id=${leadId}`)
      .then(r=>r.json())
      .then(d=>{
        setLead(d.lead)
        setStatus(d.lead?.status||'')
        setNextDate(d.lead?.next_followup_date||'')
        setLoading(false)
      })
      .catch(()=>setLoading(false))
  }, [leadId])

  async function save() {
    setErr(''); setBusy(true)
    const body = { status, noteType, callStatus, duration:duration?parseInt(duration):undefined, note:note.trim()||undefined, nextFollowupDate:nextDate||undefined }
    const r = await fetch(`/api/sales/leads/${leadId}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) })
    const d = await r.json()
    if (!r.ok) { setErr(d.error||'خطأ'); setBusy(false); return }
    setNote(''); setDuration('')
    setLead(prev => ({ ...prev, status, next_followup_date:nextDate, notes:[d.lead?.notes?.[0],...(prev?.notes||[])].filter(Boolean) }))
    setBusy(false)
    if (onUpdated) onUpdated()
  }

  const noteIcons = { call:'📞', whatsapp:'💬', meeting:'🤝', note:'📝' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }} onClick={onClose}>
      {/* Backdrop */}
      <div style={{ flex:1, background:'rgba(0,0,0,0.5)' }} />

      {/* Panel */}
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{
        width:440, background:C.surface, height:'100%', display:'flex', flexDirection:'column',
        borderRight:`1px solid ${C.g20}`, boxShadow:'-8px 0 40px rgba(0,0,0,0.4)',
        overflowY:'auto',
      }}>
        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.g20}`, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
          <div style={{ flex:1 }}>
            {loading ? <p style={{ color:C.silver }}>جارٍ التحميل...</p> : (
              <>
                <p style={{ color:C.white, fontWeight:700, fontSize:16, marginBottom:2 }}>{lead?.customer_name}</p>
                <p style={{ color:C.silver, fontSize:12 }} dir="ltr">{lead?.phone}</p>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.silver }}>جارٍ التحميل...</div>
        ) : lead ? (
          <>
            {/* Lead Info */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>المصدر</p>
                <p style={{ color:C.white, fontSize:13 }}>{lead.source || '—'}</p>
              </div>
              <div>
                <p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>تاريخ الإضافة</p>
                <p style={{ color:C.white, fontSize:13 }}>{fmtDate(lead.created_at)}</p>
              </div>
              <div>
                <p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>آخر تواصل</p>
                <p style={{ color:C.white, fontSize:13 }}>{fmtDate(lead.last_contact_date)}</p>
              </div>
              <div>
                <p style={{ color:C.silver, fontSize:11, marginBottom:3 }}>موعد المتابعة</p>
                <p style={{ color:lead.next_followup_date ? C.orange : C.silver, fontSize:13 }}>{fmtDate(lead.next_followup_date)}</p>
              </div>
            </div>

            {/* Update Form */}
            <div style={{ padding:'14px 20px', borderBottom:`1px solid ${C.g15}`, display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:13 }}>تسجيل نشاط</p>

              {err && <div style={{ color:C.red, fontSize:12, padding:'6px 10px', background:`${C.red}15`, borderRadius:8 }}>{err}</div>}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>نوع النشاط</label>
                  <select value={noteType} onChange={e=>setNoteType(e.target.value)} style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
                    {NOTE_TYPES.map(t=><option key={t.value} value={t.value}>{t.labelAr}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>الحالة</label>
                  <select value={status} onChange={e=>setStatus(e.target.value)} style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
                    {STATUS_ORDER.map(s=><option key={s} value={s}>{STATUS_META[s]?.ar}</option>)}
                  </select>
                </div>
              </div>

              {noteType === 'call' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div>
                    <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>نتيجة المكالمة</label>
                    <select value={callStatus} onChange={e=>setCallStatus(e.target.value)} style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
                      {CALL_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>المدة (دقيقة)</label>
                    <input type="number" value={duration} onChange={e=>setDuration(e.target.value)} min="0" style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
                  </div>
                </div>
              )}

              <div>
                <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>موعد المتابعة</label>
                <input type="date" value={nextDate} onChange={e=>setNextDate(e.target.value)} style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>

              <div>
                <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:4 }}>ملاحظة</label>
                <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="أضف ملاحظة..." style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 10px', color:C.white, fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box', direction:'rtl' }} />
              </div>

              <button onClick={save} disabled={busy} style={{ width:'100%', padding:10, borderRadius:10, background:busy?C.g15:C.gold, border:'none', color:busy?C.silver:C.navy, fontSize:13, fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>
                {busy?'⏳ جارٍ الحفظ...':'💾 حفظ النشاط'}
              </button>
            </div>

            {/* Activity Timeline */}
            <div style={{ padding:'14px 20px', flex:1 }}>
              <p style={{ color:C.gold, fontWeight:700, fontSize:13, marginBottom:12 }}>📋 سجل النشاط</p>
              {(lead.notes||[]).length === 0
                ? <p style={{ color:C.silver, fontSize:13, textAlign:'center', padding:20 }}>لا يوجد سجل نشاط بعد</p>
                : (lead.notes||[]).map((n,i) => (
                  <div key={i} style={{ display:'flex', gap:12, marginBottom:14 }}>
                    <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:C.g15, border:`1px solid ${C.g20}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                        {noteIcons[n.note_type] || '📝'}
                      </div>
                      {i < lead.notes.length-1 && <div style={{ width:1, flex:1, background:C.g20, marginTop:4, minHeight:16 }} />}
                    </div>
                    <div style={{ flex:1, paddingBottom:i < lead.notes.length-1 ? 8 : 0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ color:C.white, fontSize:12, fontWeight:600 }}>{NOTE_TYPES.find(t=>t.value===n.note_type)?.labelAr || '📝 ملاحظة'}</span>
                        {n.call_status && <span style={{ color:C.silver, fontSize:11 }}>• {CALL_STATUSES.find(s=>s.value===n.call_status)?.labelAr}</span>}
                        {n.duration_minutes && <span style={{ color:C.silver, fontSize:11 }}>• {n.duration_minutes} دقيقة</span>}
                      </div>
                      {n.text && <p style={{ color:C.white, fontSize:13, marginBottom:4 }}>{n.text}</p>}
                      <p style={{ color:C.silver, fontSize:11 }}>{fmtDate(n.created_at)} — {fmtTime(n.created_at)}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:C.red }}>لم يتم العثور على العميل</div>
        )}
      </div>
    </div>
  )
}

// ─── Leads Page ───────────────────────────────────────────────────────────
function LeadsPage({ C }) {
  const [tab, setTab]           = useState('fresh')
  const [leads, setLeads]       = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const searchTimer = useRef()

  const load = useCallback(async (t, q, pg) => {
    setLoading(true)
    const r = await fetch(`/api/sales/leads-page?tab=${t}&q=${encodeURIComponent(q)}&page=${pg}&limit=30`)
    const d = await r.json()
    setLeads(d.leads||[])
    setTotal(d.total||0)
    setLoading(false)
  }, [])

  useEffect(() => { load(tab, search, page) }, [tab, search, page])

  function handleSearch(v) {
    setSearchVal(v)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setSearch(v); setPage(1) }, 400)
  }

  const tabs = [
    { id:'fresh',    label:'Fresh',      icon:'🌱' },
    { id:'all',      label:'My Leads',   icon:'👤' },
    { id:'followups', label:'Follow-ups', icon:'📅' },
  ]

  const cols = ['NAME','PHONE','SOURCE','CREATED','STATUS','LAST CALL','FOLLOW-UP']

  return (
    <div dir="rtl">
      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <input
          value={searchVal}
          onChange={e=>handleSearch(e.target.value)}
          placeholder="ابحث بالاسم أو الرقم..."
          style={{ width:'100%', background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'10px 14px', color:C.white, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:C.g10, borderRadius:12, padding:4, width:'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={()=>{setTab(t.id);setPage(1)}} style={{
            padding:'8px 18px', borderRadius:10, border:'none', cursor:'pointer',
            background:tab===t.id?C.gold:'transparent',
            color:tab===t.id?C.navy:C.silver, fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6,
          }}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.g15 }}>
              {cols.map(h=>(
                <th key={h} style={{ padding:'11px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={cols.length} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={cols.length} style={{ padding:50, textAlign:'center', color:C.silver }}>لا توجد نتائج</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id}
                onClick={()=>setSelectedId(lead.id)}
                style={{ borderTop:`1px solid ${C.g15}`, cursor:'pointer', transition:'background 0.1s' }}
                onMouseEnter={e=>e.currentTarget.style.background=C.g10}
                onMouseLeave={e=>e.currentTarget.style.background=''}
              >
                <td style={{ padding:'11px 14px', color:C.white, fontSize:13, fontWeight:600 }}>{lead.customer_name}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12 }} dir="ltr">{lead.phone}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12 }}>{lead.source||'—'}</td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(lead.created_at)}</td>
                <td style={{ padding:'11px 14px' }}>
                  <span style={{ color:sc(lead.status,C), fontSize:11, background:`${sc(lead.status,C)}20`, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{STATUS_META[lead.status]?.ar}</span>
                </td>
                <td style={{ padding:'11px 14px', color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(lead.last_contact_date)}</td>
                <td style={{ padding:'11px 14px', color:lead.next_followup_date?C.orange:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(lead.next_followup_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 30 && (
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginTop:16, alignItems:'center' }}>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{ padding:'6px 14px', borderRadius:8, background:page===1?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page===1?C.silver:C.white, cursor:page===1?'default':'pointer', fontSize:13 }}>السابق</button>
          <span style={{ color:C.silver, fontSize:13 }}>صفحة {page} من {Math.ceil(total/30)}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={page>=Math.ceil(total/30)} style={{ padding:'6px 14px', borderRadius:8, background:page>=Math.ceil(total/30)?C.g10:C.g20, border:`1px solid ${C.g20}`, color:page>=Math.ceil(total/30)?C.silver:C.white, cursor:page>=Math.ceil(total/30)?'default':'pointer', fontSize:13 }}>التالي</button>
        </div>
      )}

      {/* Lead Detail Panel */}
      {selectedId && (
        <LeadDetailPanel
          C={C}
          leadId={selectedId}
          onClose={()=>setSelectedId(null)}
          onUpdated={()=>load(tab,search,page)}
        />
      )}
    </div>
  )
}

// ─── Create Sale Form ─────────────────────────────────────────────────────
function CreateSaleModal({ C, onClose, onSuccess }) {
  const [f, setF] = useState({ studentName:'', studentPhone:'', packageName:'', amountPaid:'', deposit:'', paymentMethod:'bank_transfer', saleStatus:'paid', notes:'' })
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
    if (!f.packageName) return setErr('الرجاء اختيار الباقة')
    if (!proofFile) return setErr('صورة إثبات البيعة مطلوبة')
    setUploading(true)
    try {
      const base64 = await new Promise((res,rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result.split(',')[1])
        reader.onerror = rej
        reader.readAsDataURL(proofFile)
      })
      const upR = await fetch('/api/sales/upload', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ base64, contentType:proofFile.type, filename:proofFile.name }) })
      if (!upR.ok) { const d = await upR.json(); throw new Error(d.error||'فشل رفع الصورة') }
      const { url:proofImageUrl } = await upR.json()

      const saleR = await fetch('/api/sales/records', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ ...f, proofImageUrl }) })
      const saleD = await saleR.json()
      if (!saleR.ok) throw new Error(saleD.error||'فشل تسجيل البيعة')
      onSuccess(saleD)
    } catch(ex) {
      setErr(ex.message)
    } finally {
      setUploading(false)
    }
  }

  const inp = { background:C.g10, border:`1px solid ${C.g20}`, borderRadius:10, padding:'9px 12px', color:C.white, fontSize:13, width:'100%', fontFamily:'inherit', boxSizing:'border-box', direction:'rtl', outline:'none' }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20, overflowY:'auto' }} onClick={onClose}>
      <div dir="rtl" onClick={e=>e.stopPropagation()} style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:28, maxWidth:580, width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ color:C.white, fontWeight:900, fontSize:18 }}>+ تسجيل بيعة جديدة</h2>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:C.g10, border:`1px solid ${C.g20}`, color:C.silver, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {err && <div style={{ background:`${C.red}20`, border:`1px solid ${C.red}40`, borderRadius:10, padding:'9px 14px', color:C.red, fontSize:13 }}>{err}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>اسم الطالب كاملاً *</label>
              <input style={inp} placeholder="أحمد محمد العلي" value={f.studentName} onChange={e=>setF({...f,studentName:e.target.value})} required />
            </div>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>رقم الهاتف * (أردني)</label>
              <input style={{ ...inp, direction:'ltr' }} placeholder="0791234567" value={f.studentPhone} onChange={e=>setF({...f,studentPhone:e.target.value})} required />
              <p style={{ color:C.silver, fontSize:10, marginTop:3 }}>077/078/079</p>
            </div>
          </div>

          <div>
            <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>الباقة *</label>
            <select style={{ ...inp, appearance:'none' }} value={f.packageName} onChange={e=>setF({...f,packageName:e.target.value})} required>
              <option value="">— اختر الباقة —</option>
              {PACKAGES.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
            </select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>المبلغ (JOD)</label>
              <input type="number" style={{ ...inp, direction:'ltr' }} placeholder="0" min="0" step="0.01" value={f.amountPaid} onChange={e=>setF({...f,amountPaid:e.target.value})} />
            </div>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>العربون (JOD)</label>
              <input type="number" style={{ ...inp, direction:'ltr' }} placeholder="0" min="0" step="0.01" value={f.deposit} onChange={e=>setF({...f,deposit:e.target.value})} />
            </div>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>طريقة الدفع</label>
              <select style={{ ...inp, appearance:'none' }} value={f.paymentMethod} onChange={e=>setF({...f,paymentMethod:e.target.value})}>
                {PAYMENT_METHODS.map(p=><option key={p.value} value={p.value}>{p.labelAr}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>حالة البيعة</label>
              <select style={{ ...inp, appearance:'none' }} value={f.saleStatus} onChange={e=>setF({...f,saleStatus:e.target.value})}>
                {SALE_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>ملاحظات</label>
            <textarea style={{ ...inp, resize:'vertical', minHeight:70 }} placeholder="أي تفاصيل..." value={f.notes} onChange={e=>setF({...f,notes:e.target.value})} />
          </div>

          {/* Proof Upload */}
          <div>
            <label style={{ color:C.silver, fontSize:11, display:'block', marginBottom:5 }}>صورة إثبات البيعة *</label>
            <div
              onClick={()=>fileRef.current?.click()}
              style={{ border:`2px dashed ${proofFile?C.gold:C.g30}`, borderRadius:12, padding:20, textAlign:'center', cursor:'pointer', background:proofFile?C.g10:'transparent' }}
            >
              {previewUrl ? (
                <div>
                  <img src={previewUrl} alt="proof" style={{ maxWidth:'100%', maxHeight:180, borderRadius:8, marginBottom:8 }} />
                  <p style={{ color:C.gold, fontSize:12 }}>✅ تم اختيار الصورة — انقر للتغيير</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize:28, marginBottom:8 }}>📷</p>
                  <p style={{ color:C.white, fontSize:13, fontWeight:600 }}>انقر لاختيار صورة الإثبات</p>
                  <p style={{ color:C.silver, fontSize:11, marginTop:4 }}>JPG, PNG, WebP — بحد أقصى 10MB</p>
                </div>
              )}
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

// ─── Sale Success Modal ───────────────────────────────────────────────────
function SaleSuccessModal({ C, data, onClose }) {
  const { studentAccount, record } = data
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:110, padding:20 }}>
      <div dir="rtl" style={{ background:C.surface, border:`1px solid ${C.g30}`, borderRadius:20, padding:32, maxWidth:460, width:'100%' }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
          <h2 style={{ color:C.gold, fontWeight:900, fontSize:20, marginBottom:6 }}>تم تسجيل البيعة بنجاح!</h2>
          <p style={{ color:C.silver, fontSize:13 }}>{fmtDate(record?.created_at)}</p>
        </div>
        <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:14, padding:18, marginBottom:20 }}>
          <p style={{ color:C.silver, fontSize:11, marginBottom:12, fontWeight:700, letterSpacing:1 }}>بيانات الطالب</p>
          {[
            ['الاسم', studentAccount?.studentName],
            ['اسم المستخدم', studentAccount?.username, true],
            ['كلمة المرور المبدئية', studentAccount?.password, true],
            ['الباقة', PACKAGES.find(p=>p.value===record?.package_name)?.labelAr || record?.package_name],
          ].map(([label,val,mono]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:C.silver, fontSize:12 }}>{label}</span>
              <span style={{ color:C.white, fontSize:13, fontWeight:700, fontFamily:mono?'monospace':'inherit', background:mono?C.g10:'transparent', padding:mono?'2px 8px':0, borderRadius:mono?6:0, direction:'ltr' }}>{val||'—'}</span>
            </div>
          ))}
        </div>
        {studentAccount?.created && <div style={{ color:C.emerald, fontSize:13, padding:'8px 12px', background:`${C.emerald}15`, borderRadius:10, marginBottom:16 }}>✅ تم إنشاء حساب جديد — سيُطلب منه تغيير كلمة المرور.</div>}
        {studentAccount?.existing && <div style={{ color:C.purple, fontSize:13, padding:'8px 12px', background:`${C.purple}15`, borderRadius:10, marginBottom:16 }}>ℹ️ الطالب لديه حساب مسبق — تم ربط البيعة بحسابه.</div>}
        <button onClick={onClose} style={{ width:'100%', padding:12, borderRadius:12, background:C.gold, border:'none', color:C.navy, fontSize:15, fontWeight:700, cursor:'pointer' }}>حسناً</button>
      </div>
    </div>
  )
}

// ─── Sales Page ───────────────────────────────────────────────────────────
function SalesPage({ C }) {
  const [records, setRecords]   = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [month, setMonth]       = useState(new Date().getMonth()+1)
  const [year, setYear]         = useState(new Date().getFullYear())
  const [empFilter, setEmpFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [stats, setStats]       = useState(null)
  const [editId, setEditId]     = useState(null)
  const [editStatus, setEditStatus] = useState('')
  const [busyEdit, setBusyEdit] = useState(false)

  useEffect(() => { loadRecords() }, [month, year, empFilter])
  useEffect(() => {
    fetch('/api/sales/dashboard').then(r=>r.json()).then(d=>setStats(d.stats)).catch(()=>{})
  }, [])

  async function loadRecords() {
    setLoading(true)
    let url = `/api/sales/records?month=${month}&year=${year}`
    if (empFilter) url += `&employeeId=${empFilter}`
    const r = await fetch(url); const d = await r.json()
    setRecords(d.records||[]); setTotal(d.total||0); setLoading(false)
  }

  async function updateStatus(id, saleStatus) {
    setBusyEdit(id)
    await fetch(`/api/sales/records?id=${id}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ saleStatus }) })
    setBusyEdit(null); setEditId(null); loadRecords()
  }

  const years = [new Date().getFullYear(), new Date().getFullYear()-1]
  const months = Array.from({length:12},(_,i)=>i+1)

  const statCards = stats ? [
    { label:'Sales Today',        value:stats.salesToday,     accent:'gold'    },
    { label:'Sales This Month',   value:stats.salesThisMonth, accent:'gold'    },
    { label:'Sales This Year',    value:stats.salesThisYear,  accent:'gold'    },
    { label:'Revenue Today',      value:fmtMoney(stats.revenueToday),     accent:'emerald' },
    { label:'Revenue This Month', value:fmtMoney(stats.revenueThisMonth), accent:'emerald' },
    { label:'Revenue This Year',  value:fmtMoney(stats.revenueThisYear),  accent:'emerald' },
  ] : []

  const thStyle = { padding:'10px 14px', color:C.silver, fontSize:11, fontWeight:700, textAlign:'right', whiteSpace:'nowrap', borderBottom:`1px solid ${C.g20}` }
  const tdStyle = { padding:'11px 14px', fontSize:13 }

  return (
    <div dir="rtl">
      {/* Stats */}
      {stats && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:20 }}>
          {statCards.map((c,i) => <StatCard key={i} C={C} {...c} />)}
        </div>
      )}

      {/* Filters + Create */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:8, padding:'8px 12px', color:C.white, fontSize:13, fontFamily:'inherit' }}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <div style={{ marginRight:'auto', background:C.g15, border:`1px solid ${C.g30}`, borderRadius:8, padding:'8px 14px', color:C.gold, fontSize:13, fontWeight:700 }}>
          {total} بيعة
        </div>
        <button onClick={()=>setShowCreate(true)} style={{ padding:'8px 18px', borderRadius:10, background:C.gold, border:'none', color:C.navy, fontSize:13, fontWeight:700, cursor:'pointer' }}>
          + Create Sale
        </button>
      </div>

      {/* Table */}
      <div style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:16, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:C.g15 }}>
              {['CUSTOMER','PHONE','PRODUCT','AMOUNT','DEPOSIT','PAYMENT','DATE','STATUS','ACTIONS'].map(h=>(
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding:50, textAlign:'center', color:C.silver }}>جارٍ التحميل...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={9} style={{ padding:60, textAlign:'center', color:C.silver }}>لا توجد بيعات في هذه الفترة</td></tr>
            ) : records.map(r => {
              const ss = SALE_STATUSES.find(x=>x.value===r.sale_status)
              const sColor = ss ? C[ss.color] : C.silver
              const pkg = PACKAGES.find(p=>p.value===r.package_name)
              return (
                <tr key={r.id} style={{ borderTop:`1px solid ${C.g15}` }}>
                  <td style={{ ...tdStyle, color:C.white, fontWeight:600 }}>{r.student_name}</td>
                  <td style={{ ...tdStyle, color:C.silver }} dir="ltr">{r.student_phone}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{pkg?.labelEn || r.package_name}</td>
                  <td style={{ ...tdStyle, color:C.gold, fontWeight:700 }}>{fmtMoney(r.amount_paid)}</td>
                  <td style={{ ...tdStyle, color:C.silver }}>{fmtMoney(r.deposit)}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12 }}>{PAYMENT_METHODS.find(p=>p.value===r.payment_method)?.labelAr || r.payment_method}</td>
                  <td style={{ ...tdStyle, color:C.silver, fontSize:12, whiteSpace:'nowrap' }}>{fmtDate(r.sale_date)}</td>
                  <td style={{ ...tdStyle }}>
                    {editId === r.id ? (
                      <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                        <select value={editStatus} onChange={e=>setEditStatus(e.target.value)} style={{ background:C.g10, border:`1px solid ${C.g20}`, borderRadius:6, padding:'4px 8px', color:C.white, fontSize:12, fontFamily:'inherit' }}>
                          {SALE_STATUSES.map(s=><option key={s.value} value={s.value}>{s.labelAr}</option>)}
                        </select>
                        <button onClick={()=>updateStatus(r.id,editStatus)} disabled={busyEdit===r.id} style={{ padding:'4px 10px', borderRadius:6, background:C.gold, border:'none', color:C.navy, fontSize:11, cursor:'pointer' }}>✓</button>
                        <button onClick={()=>setEditId(null)} style={{ padding:'4px 8px', borderRadius:6, background:'none', border:`1px solid ${C.g20}`, color:C.silver, fontSize:11, cursor:'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <span style={{ color:sColor, fontSize:11, background:`${sColor}20`, padding:'3px 10px', borderRadius:20, whiteSpace:'nowrap' }}>{ss?.labelAr || r.sale_status}</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle }}>
                    {editId !== r.id && (
                      <button onClick={()=>{setEditId(r.id);setEditStatus(r.sale_status||'paid')}} style={{ padding:'4px 12px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, cursor:'pointer' }}>تعديل</button>
                    )}
                    {r.proof_image_url && (
                      <a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" style={{ marginRight:6, padding:'4px 12px', borderRadius:8, background:C.g15, border:`1px solid ${C.g20}`, color:C.silver, fontSize:12, textDecoration:'none', display:'inline-block' }}>📷</a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateSaleModal C={C} onClose={()=>setShowCreate(false)} onSuccess={d=>{setShowCreate(false);setSuccessData(d);loadRecords()}} />}
      {successData && <SaleSuccessModal C={C} data={successData} onClose={()=>setSuccessData(null)} />}
    </div>
  )
}

// ─── Employee Portal ──────────────────────────────────────────────────────
function EmployeePortal({ C, user }) {
  const [view, setView]       = useState('home')
  const [collapsed, setCollapsed] = useState(false)
  const [followupCount, setFollowupCount] = useState(0)

  useEffect(() => {
    fetch('/api/sales/leads-page?tab=followups&limit=1')
      .then(r=>r.json()).then(d=>setFollowupCount(d.total||0)).catch(()=>{})
  }, [])

  const navItems = [
    { id:'home',   icon:'🏠', label:'الرئيسية',               badge:0 },
    { id:'leads',  icon:'🎯', label:'العملاء المحتملون',       badge:followupCount },
    { id:'openc',  icon:'♻️', label:'OpenC',                  badge:0 },
    { id:'sales',  icon:'💰', label:'البيعات',                 badge:0 },
  ]

  const titles = { home:'الرئيسية', leads:'العملاء المحتملون', openc:'OpenC Pool', sales:'البيعات' }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method:'POST' })
    window.location.href = '/'
  }

  return (
    <div dir="rtl" style={{ display:'flex', minHeight:'100vh', background:C.navy, fontFamily:"'Cairo',sans-serif" }}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={handleLogout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{ flex:1, marginRight:collapsed?72:240, transition:'margin 0.2s', display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        <header style={{ background:C.surface, borderBottom:`1px solid ${C.g20}`, padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:30 }}>
          <span style={{ color:C.gold, fontWeight:700, fontSize:16 }}>{titles[view]}</span>
          <span style={{ color:C.silver, fontSize:13 }}>مرحباً، {user.name}</span>
        </header>
        <div style={{ padding:24, flex:1 }}>
          {view === 'home'  && <HomeDashboard C={C} employeeName={user.name} />}
          {view === 'leads' && <LeadsPage C={C} />}
          {view === 'openc' && <OpenCPool C={C} lang="ar" role="employee" currentEmployee={user} />}
          {view === 'sales' && <SalesPage C={C} />}
        </div>
      </main>
    </div>
  )
}

// ─── Admin Portal ─────────────────────────────────────────────────────────
function AdminEmployeesView({ C, onEmployeesChange }) {
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
    const r = await fetch('/api/admin/employees',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const d = await r.json()
    if (!r.ok){setError(d.error);setBusy(false);return}
    setShowForm(false);setForm({username:'',password:'',name:'',monthlyTarget:0});await load();setBusy(false)
  }

  async function del(id,name) {
    if (!confirm(`حذف الموظف "${name}"؟`)) return
    await fetch('/api/admin/employees',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    load()
  }

  const inp={background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'9px 12px',color:C.white,fontSize:13,width:'100%',fontFamily:'inherit',boxSizing:'border-box',direction:'rtl'}

  return (
    <div dir="rtl">
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:16}}>
        <button onClick={()=>setShowForm(!showForm)} style={{padding:'9px 20px',borderRadius:10,background:C.gold,border:'none',color:C.navy,fontSize:13,fontWeight:700,cursor:'pointer'}}>{showForm?'✕ إلغاء':'＋ موظف جديد'}</button>
      </div>
      {showForm&&(
        <form onSubmit={create} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:14,padding:20,marginBottom:20,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {error&&<div style={{gridColumn:'1/-1',color:C.red,fontSize:13,padding:'8px 12px',background:`${C.red}15`,borderRadius:8}}>{error}</div>}
          <div><label style={{color:C.silver,fontSize:11,display:'block',marginBottom:5}}>الاسم *</label><input style={inp} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div><label style={{color:C.silver,fontSize:11,display:'block',marginBottom:5}}>اسم المستخدم *</label><input style={{...inp,direction:'ltr'}} value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required /></div>
          <div><label style={{color:C.silver,fontSize:11,display:'block',marginBottom:5}}>كلمة المرور (12+ حرف)</label><input type="password" style={{...inp,direction:'ltr'}} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
          <div><label style={{color:C.silver,fontSize:11,display:'block',marginBottom:5}}>الهدف الشهري (JOD)</label><input type="number" style={inp} value={form.monthlyTarget} onChange={e=>setForm({...form,monthlyTarget:Number(e.target.value)})} min="0" placeholder="مثال: 5000" /></div>
          <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end'}}>
            <button type="submit" disabled={busy} style={{padding:'9px 24px',borderRadius:8,background:busy?C.g15:C.gold,border:'none',color:busy?C.silver:C.navy,fontSize:13,fontWeight:700,cursor:busy?'not-allowed':'pointer'}}>{busy?'⏳...':'✅ إضافة'}</button>
          </div>
        </form>
      )}
      {loading?<div style={{textAlign:'center',padding:40,color:C.silver}}>جارٍ التحميل...</div>:(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {employees.map(emp=>(
            <div key={emp.id} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:C.g20,display:'flex',alignItems:'center',justifyContent:'center',color:C.gold,fontWeight:700,fontSize:16,flexShrink:0}}>{emp.name[0]}</div>
              <div style={{flex:1}}>
                <p style={{color:C.white,fontWeight:700,fontSize:14}}>{emp.name}</p>
                <p style={{color:C.silver,fontSize:12}}>@{emp.username}</p>
              </div>
              <div style={{textAlign:'left',minWidth:120}}>
                <p style={{color:C.gold,fontSize:14,fontWeight:900}}>{fmtMoney(emp.stats?.revenueThisMonth||0)}</p>
                <p style={{color:C.silver,fontSize:11}}>{emp.stats?.monthlyTarget > 0 ? `هدف: ${fmtMoney(emp.stats.monthlyTarget)} — ${emp.stats.targetProgress}%` : 'لا يوجد هدف'}</p>
              </div>
              <button onClick={()=>del(emp.id,emp.name)} style={{width:32,height:32,borderRadius:8,background:`${C.red}15`,border:`1px solid ${C.red}40`,color:C.red,cursor:'pointer',fontSize:14,flexShrink:0}}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminSalesView({ C, employees }) {
  const [records,setRecords]=useState([])
  const [loading,setLoading]=useState(true)
  const [total,setTotal]=useState(0)
  const [empFilter,setEmpFilter]=useState('')
  const [month,setMonth]=useState(new Date().getMonth()+1)
  const [year,setYear]=useState(new Date().getFullYear())
  const [expanded,setExpanded]=useState(null)

  useEffect(()=>{load()},[empFilter,month,year])

  async function load(){
    setLoading(true)
    let url=`/api/sales/records?month=${month}&year=${year}`
    if(empFilter)url+=`&employeeId=${empFilter}`
    const r=await fetch(url);const d=await r.json()
    setRecords(d.records||[]);setTotal(d.total||0);setLoading(false)
  }

  const years=[new Date().getFullYear(),new Date().getFullYear()-1]
  const months=Array.from({length:12},(_,i)=>i+1)

  const thStyle={padding:'10px 14px',color:C.silver,fontSize:11,fontWeight:700,textAlign:'right',whiteSpace:'nowrap',borderBottom:`1px solid ${C.g20}`}
  const tdStyle={padding:'11px 14px',fontSize:13}

  return (
    <div dir="rtl">
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'7px 12px',color:C.white,fontSize:13,fontFamily:'inherit'}}>
          {months.map(m=><option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'7px 12px',color:C.white,fontSize:13,fontFamily:'inherit'}}>
          {years.map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'7px 12px',color:C.white,fontSize:13,fontFamily:'inherit'}}>
          <option value="">جميع الموظفين</option>
          {employees.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div style={{marginRight:'auto',background:C.g15,border:`1px solid ${C.g30}`,borderRadius:8,padding:'7px 14px',color:C.gold,fontSize:13,fontWeight:700}}>{total} بيعة</div>
      </div>

      <div style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:16,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:C.g15}}>
              {['CUSTOMER','PHONE','EMPLOYEE','PRODUCT','AMOUNT','DEPOSIT','PAYMENT','DATE','STATUS','PROOF'].map(h=><th key={h} style={thStyle}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={10} style={{padding:50,textAlign:'center',color:C.silver}}>جارٍ التحميل...</td></tr>
            :records.length===0?<tr><td colSpan={10} style={{padding:60,textAlign:'center',color:C.silver}}>لا توجد بيعات</td></tr>
            :records.map(r=>{
              const ss=SALE_STATUSES.find(x=>x.value===r.sale_status)
              const sColor=ss?C[ss.color]:C.silver
              const pkg=PACKAGES.find(p=>p.value===r.package_name)
              return(
                <tr key={r.id} style={{borderTop:`1px solid ${C.g15}`}}>
                  <td style={{...tdStyle,color:C.white,fontWeight:600}}>{r.student_name}</td>
                  <td style={{...tdStyle,color:C.silver,fontSize:12}} dir="ltr">{r.student_phone}</td>
                  <td style={{...tdStyle,color:C.silver,fontSize:12}}>{r.employee_name}</td>
                  <td style={{...tdStyle,color:C.silver,fontSize:12}}>{pkg?.labelEn||r.package_name}</td>
                  <td style={{...tdStyle,color:C.gold,fontWeight:700}}>{fmtMoney(r.amount_paid)}</td>
                  <td style={{...tdStyle,color:C.silver}}>{fmtMoney(r.deposit)}</td>
                  <td style={{...tdStyle,color:C.silver,fontSize:12}}>{PAYMENT_METHODS.find(p=>p.value===r.payment_method)?.labelAr||r.payment_method}</td>
                  <td style={{...tdStyle,color:C.silver,fontSize:12,whiteSpace:'nowrap'}}>{fmtDate(r.sale_date)}</td>
                  <td style={{...tdStyle}}><span style={{color:sColor,fontSize:11,background:`${sColor}20`,padding:'3px 10px',borderRadius:20}}>{ss?.labelAr||r.sale_status}</span></td>
                  <td style={{...tdStyle}}>{r.proof_image_url&&<a href={r.proof_image_url} target="_blank" rel="noopener noreferrer" style={{color:C.gold,fontSize:12}}>📷 عرض</a>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminLeadsView({ C }) {
  const [allLeads,setAllLeads]=useState([])
  const [loading,setLoading]=useState(true)
  const [empFilter,setEmpFilter]=useState('')
  const [employees,setEmployees]=useState([])
  const [search,setSearch]=useState('')
  const [selectedId,setSelectedId]=useState(null)

  useEffect(()=>{
    Promise.all([
      fetch('/api/admin/employees').then(r=>r.json()),
      fetch('/api/admin/leads').then(r=>r.json()),
    ]).then(([empData,leadsData])=>{
      setEmployees(empData.employees||[])
      setAllLeads(leadsData.leads||[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  const filtered=allLeads.filter(l=>{
    if(empFilter&&String(l.employee_id)!==empFilter)return false
    if(search&&!l.customer_name?.includes(search)&&!l.phone?.includes(search))return false
    return true
  })

  if(loading) return <div style={{textAlign:'center',padding:60,color:C.silver}}>جارٍ التحميل...</div>

  return (
    <div dir="rtl">
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث..." style={{flex:1,minWidth:200,background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'8px 12px',color:C.white,fontSize:13,fontFamily:'inherit'}} />
        <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:8,padding:'8px 12px',color:C.white,fontSize:13,fontFamily:'inherit'}}>
          <option value="">جميع الموظفين ({allLeads.length})</option>
          {employees.map(e=><option key={e.id} value={String(e.id)}>{e.name} ({allLeads.filter(l=>l.employee_id===e.id).length})</option>)}
        </select>
      </div>
      <div style={{background:C.g10,border:`1px solid ${C.g20}`,borderRadius:16,overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:C.g15}}>
              {['NAME','PHONE','EMPLOYEE','STATUS','LAST CALL','FOLLOW-UP'].map(h=><th key={h} style={{padding:'10px 14px',color:C.silver,fontSize:11,fontWeight:700,textAlign:'right',borderBottom:`1px solid ${C.g20}`}}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0?<tr><td colSpan={6} style={{padding:50,textAlign:'center',color:C.silver}}>لا توجد نتائج</td></tr>
            :filtered.map(l=>(
              <tr key={l.id} onClick={()=>setSelectedId(l.id)} style={{borderTop:`1px solid ${C.g15}`,cursor:'pointer'}}>
                <td style={{padding:'11px 14px',color:C.white,fontWeight:600,fontSize:13}}>{l.customer_name}</td>
                <td style={{padding:'11px 14px',color:C.silver,fontSize:12}} dir="ltr">{l.phone}</td>
                <td style={{padding:'11px 14px',color:C.silver,fontSize:12}}>{employees.find(e=>e.id===l.employee_id)?.name||'—'}</td>
                <td style={{padding:'11px 14px'}}><span style={{color:sc(l.status,C),fontSize:11,background:`${sc(l.status,C)}20`,padding:'3px 10px',borderRadius:20}}>{STATUS_META[l.status]?.ar}</span></td>
                <td style={{padding:'11px 14px',color:C.silver,fontSize:12}}>{fmtDate(l.last_contact_date)}</td>
                <td style={{padding:'11px 14px',color:l.next_followup_date?C.orange:C.silver,fontSize:12}}>{fmtDate(l.next_followup_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AdminPortal({ C, user }) {
  const [view,setView]=useState('sales')
  const [employees,setEmployees]=useState([])
  const [collapsed,setCollapsed]=useState(false)

  useEffect(()=>{
    fetch('/api/admin/employees').then(r=>r.json()).then(d=>setEmployees(d.employees||[])).catch(()=>{})
  },[])

  const navItems=[
    {id:'sales',icon:'💰',label:'سجل البيعات',badge:0},
    {id:'leads',icon:'🎯',label:'العملاء المحتملون',badge:0},
    {id:'employees',icon:'👥',label:'الموظفون',badge:0},
    {id:'openc',icon:'♻️',label:'OpenC',badge:0},
  ]
  const titles={sales:'سجل البيعات',leads:'العملاء المحتملون',employees:'إدارة الموظفين',openc:'OpenC Pool'}

  async function handleLogout(){
    await fetch('/api/auth/logout',{method:'POST'})
    window.location.href='/'
  }

  return (
    <div dir="rtl" style={{display:'flex',minHeight:'100vh',background:C.navy,fontFamily:"'Cairo',sans-serif"}}>
      <Sidebar C={C} user={user} view={view} setView={setView} onLogout={handleLogout} navItems={navItems} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main style={{flex:1,marginRight:collapsed?72:240,transition:'margin 0.2s',display:'flex',flexDirection:'column'}}>
        <header style={{background:C.surface,borderBottom:`1px solid ${C.g20}`,padding:'0 24px',height:60,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:30}}>
          <span style={{color:C.gold,fontWeight:700,fontSize:16}}>{titles[view]}</span>
          <span style={{color:C.silver,fontSize:13}}>مرحباً، {user.name}</span>
        </header>
        <div style={{padding:24,flex:1}}>
          {view==='sales'     && <AdminSalesView C={C} employees={employees} />}
          {view==='leads'     && <AdminLeadsView C={C} />}
          {view==='employees' && <AdminEmployeesView C={C} onEmployeesChange={setEmployees} />}
          {view==='openc'     && <OpenCPool C={C} lang="ar" role="admin" />}
        </div>
      </main>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function SalesPageRoot({ initialUser }) {
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
          input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.7); }
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
  if (!session) return { redirect: { destination:'/', permanent:false } }

  if (session.role === 'employee') {
    const employee = await getEmployeeByUsername(session.username)
    if (!employee) return { redirect: { destination:'/', permanent:false } }
    return { props: { initialUser: {
      username: employee.username, name: employee.name,
      avatar: employeeAvatar(employee.name), role:'employee',
    }}}
  }

  if (session.role === 'admin') {
    const user = await getUser(session.username)
    return { props: { initialUser: {
      username: session.username, name: user?.name || 'مدير', role:'admin',
    }}}
  }

  return { redirect: { destination:'/dashboard', permanent:false } }
}
