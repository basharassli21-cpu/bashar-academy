import { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme, useLang } from './_app'

// ─── Palette ──────────────────────────────────────────────────────────────
const C_DARK = {
  bg:'#080D08', bg2:'#0C150C', bg3:'#111A11', surface:'#141E14',
  border:'rgba(74,222,128,0.12)', borderHover:'rgba(74,222,128,0.28)',
  gold:'#4ADE80', goldL:'#7AE89F', goldD:'#22A35A', goldText:'#0A150D',
  ink:'#E8F0E8', muted:'#8AAB8A', muted2:'#5C6E5C',
  red:'#F0807A', redBg:'rgba(240,128,122,0.10)',
  yellow:'#FACC15', yellowBg:'rgba(250,204,21,0.10)',
  blue:'#60A5FA', blueBg:'rgba(96,165,250,0.10)',
  purple:'#A78BFA', purpleBg:'rgba(167,139,250,0.10)',
  g10:'rgba(74,222,128,0.08)', g20:'rgba(74,222,128,0.16)',
  shadow:'0 4px 24px rgba(0,0,0,0.4)',
}
const C_LIGHT = {
  bg:'#F4F7F4', bg2:'#FFFFFF', bg3:'#EAF0EA', surface:'#FFFFFF',
  border:'rgba(28,138,77,0.14)', borderHover:'rgba(28,138,77,0.34)',
  gold:'#1C8A4D', goldL:'#239B5A', goldD:'#146238', goldText:'#FFFFFF',
  ink:'#142016', muted:'#5B6B5B', muted2:'#94A394',
  red:'#C0463F', redBg:'rgba(192,70,63,0.08)',
  yellow:'#B45309', yellowBg:'rgba(180,83,9,0.08)',
  blue:'#2563EB', blueBg:'rgba(37,99,235,0.08)',
  purple:'#7C3AED', purpleBg:'rgba(124,58,237,0.08)',
  g10:'rgba(28,138,77,0.06)', g20:'rgba(28,138,77,0.12)',
  shadow:'0 4px 24px rgba(0,0,0,0.10)',
}

// ─── Helpers ──────────────────────────────────────────────────────────────
const CURRENCY = 'JOD'

// Fiscal year: first year 2026 = Aug 1 → Dec 31; all subsequent = Jan 1 → Dec 31
function getFiscalYear(year) {
  const y = parseInt(year) || new Date().getFullYear()
  if (y === 2026) return { year: 2026, start: '2026-08-01', end: '2026-12-31', labelAr: 'السنة المالية 2026 (أغسطس–ديسمبر)', labelEn: 'FY 2026 (Aug–Dec)' }
  return { year: y, start: `${y}-01-01`, end: `${y}-12-31`, labelAr: `السنة المالية ${y}`, labelEn: `FY ${y}` }
}
function currentFiscalYear() { return getFiscalYear(new Date().getFullYear()) }

const fmt = (n, currency = CURRENCY) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)
const fmtN = n => new Intl.NumberFormat('en-US').format(n || 0)
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const fmtPct = n => (parseFloat(n) || 0).toFixed(1) + '%'
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PRODUCT_TYPES = ['course','consultation','coaching','bundle','other']
const PAYMENT_METHODS = ['stripe','paypal','cash','bank','crypto','manual','transfer']
const PAYMENT_STATUSES = ['pending','paid','partial','failed','refunded','cancelled']
const EXPENSE_CATS = ['Marketing','Ads','Meta Ads','Hosting','Software','Monthly Subscription','Employees','Freelancers','Office','Taxes','Utilities','Travel','Education','Equipment','Phone','Other']
const COURSE_OPTIONS = [
  { value:'elite',        labelAr:'الباقة الكاملة (Elite)',       labelEn:'Elite Package',        icon:'👑' },
  { value:'professional', labelAr:'الباقة المتوسطة (Professional)', labelEn:'Professional Package', icon:'⚡' },
  { value:'starter',      labelAr:'باقة التنفيذ (Starter)',        labelEn:'Starter Package',      icon:'🚀' },
]
const T = {
  ar: {
    dashboard:'لوحة التحكم', sales:'المبيعات', expenses:'المصاريف',
    withdrawals:'السحوبات', commissions:'العمولات', reports:'التقارير',
    ledger:'دفتر الحسابات', finance:'نظام المالية', back:'→ الإدارة',
    newSale:'+ بيع جديد', newExpense:'+ مصروف جديد', newRequest:'+ طلب سحب',
    adjustment:'+ تسوية', addRule:'+ قاعدة', generate:'📊 إنشاء التقرير',
    generating:'جاري الإنشاء…', loading:'جاري التحميل…', noData:'لا توجد بيانات',
    course:'الكورس',
  },
  en: {
    dashboard:'Dashboard', sales:'Sales', expenses:'Expenses',
    withdrawals:'Withdrawals', commissions:'Commissions', reports:'Reports',
    ledger:'Ledger', finance:'FINANCE SYSTEM', back:'← Admin',
    newSale:'+ New Sale', newExpense:'+ Add Expense', newRequest:'+ New Request',
    adjustment:'+ Adjustment', addRule:'+ Rule', generate:'📊 Generate Report',
    generating:'Generating…', loading:'Loading…', noData:'No data found',
    course:'Course',
  },
}
const STATUS_COLORS = {
  paid:'#4ADE80', pending:'#FACC15', partial:'#60A5FA',
  failed:'#F0807A', refunded:'#A78BFA', cancelled:'#8AAB8A',
  approved:'#4ADE80', rejected:'#F0807A', requested:'#FACC15',
  under_review:'#60A5FA', sale:'#4ADE80', bonus:'#A78BFA',
  penalty:'#F0807A', adjustment:'#60A5FA',
}

function Badge({ status, C }) {
  const color = STATUS_COLORS[status] || C.muted
  return (
    <span style={{
      display:'inline-block', padding:'2px 10px', borderRadius:20,
      fontSize:11, fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase',
      background:color + '18', color,
    }}>{status?.replace(/_/g,' ')}</span>
  )
}

function Spinner({ C }) {
  return <div style={{ textAlign:'center', padding:40, color:C.muted, fontSize:14 }}>Loading…</div>
}

function EmptyState({ msg, C }) {
  return <div style={{ textAlign:'center', padding:60, color:C.muted2, fontSize:14 }}>{msg || 'No data found'}</div>
}

function KpiCard({ label, value, sub, icon, color, C }) {
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`, borderRadius:16,
      padding:'22px 24px', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:16, right:18, fontSize:28, opacity:0.25 }}>{icon}</div>
      <div style={{ fontSize:12, color:C.muted, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color: color || C.ink, fontFamily:'monospace', letterSpacing:'-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:C.muted, marginTop:6 }}>{sub}</div>}
    </div>
  )
}

function Table({ cols, rows, C, onRow }) {
  if (!rows.length) return <EmptyState C={C} />
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={{
                padding:'10px 14px', textAlign:'left', color:C.muted,
                fontWeight:600, fontSize:11, letterSpacing:'0.06em', textTransform:'uppercase',
                borderBottom:`1px solid ${C.border}`, whiteSpace:'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}
              onClick={() => onRow?.(row)}
              style={{
                borderBottom:`1px solid ${C.border}`,
                cursor: onRow ? 'pointer' : 'default',
                transition:'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.g10 }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {cols.map(c => (
                <td key={c.key} style={{ padding:'11px 14px', color:C.ink, whiteSpace:'nowrap' }}>
                  {c.render ? c.render(row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ page, pages, onChange, C }) {
  if (pages <= 1) return null
  return (
    <div style={{ display:'flex', gap:6, justifyContent:'center', padding:'16px 0' }}>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1
        const active = p === page
        return (
          <button key={p} onClick={() => onChange(p)} style={{
            padding:'5px 12px', borderRadius:8, border:`1px solid ${active ? C.gold : C.border}`,
            background: active ? C.gold : 'transparent', color: active ? C.goldText : C.ink,
            fontSize:13, fontWeight:600, cursor:'pointer',
          }}>{p}</button>
        )
      })}
    </div>
  )
}

function Modal({ open, onClose, title, children, C, width = 560 }) {
  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:C.bg2, border:`1px solid ${C.border}`, borderRadius:20,
        width:'100%', maxWidth:width, maxHeight:'90vh', overflow:'auto',
        boxShadow:C.shadow,
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${C.border}` }}>
          <div style={{ fontSize:17, fontWeight:700, color:C.ink }}>{title}</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:C.muted, fontSize:22, cursor:'pointer', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'24px' }}>{children}</div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder, required, C, options, style: s }) {
  const base = {
    width:'100%', padding:'10px 13px', background:C.bg3, border:`1px solid ${C.border}`,
    borderRadius:10, color:C.ink, fontSize:14, outline:'none', boxSizing:'border-box', ...s,
  }
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:5, letterSpacing:'0.04em' }}>
        {label}{required && <span style={{ color:C.red }}>*</span>}
      </div>}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          <option value="">— select —</option>
          {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} style={base} />
      )}
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', C, disabled, style: s }) {
  const vars = {
    primary: { bg:C.gold, color:C.goldText, border:'none' },
    outline: { bg:'transparent', color:C.gold, border:`1px solid ${C.gold}` },
    danger:  { bg:C.red+'22', color:C.red, border:`1px solid ${C.red}44` },
    ghost:   { bg:C.g10, color:C.ink, border:`1px solid ${C.border}` },
  }
  const v = vars[variant] || vars.primary
  return (
    <button disabled={disabled} onClick={onClick} style={{
      padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:700, cursor:disabled?'not-allowed':'pointer',
      background:v.bg, color:v.color, border:v.border, opacity:disabled?0.5:1, ...s,
    }}>{children}</button>
  )
}

// ─── Finance Nav ──────────────────────────────────────────────────────────
const TABS = [
  { id:'dashboard',   icon:'📊', ar:'لوحة التحكم',   en:'Dashboard'   },
  { id:'sales',       icon:'💰', ar:'المبيعات',       en:'Sales'       },
  { id:'expenses',    icon:'📋', ar:'المصاريف',       en:'Expenses'    },
  { id:'withdrawals', icon:'🏦', ar:'السحوبات',       en:'Withdrawals' },
  { id:'commissions', icon:'⚡', ar:'العمولات',       en:'Commissions' },
  { id:'reports',     icon:'📈', ar:'التقارير',       en:'Reports'     },
  { id:'ledger',      icon:'📒', ar:'دفتر الحسابات', en:'Ledger'      },
]

function FinanceNav({ tab, setTab, C, lang }) {
  const t = T[lang] || T.en
  return (
    <nav style={{
      background:C.bg2, borderRight:`1px solid ${C.border}`,
      width:200, minHeight:'100vh', padding:'20px 12px',
      display:'flex', flexDirection:'column', gap:4, flexShrink:0,
    }}>
      <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:'0.08em', padding:'4px 12px 12px' }}>
        {t.finance}
      </div>
      {TABS.map(tb => (
        <button key={tb.id} onClick={() => setTab(tb.id)} style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10,
          background: tab === tb.id ? C.gold : 'transparent',
          color: tab === tb.id ? C.goldText : C.muted,
          border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
          textAlign: lang === 'ar' ? 'right' : 'left',
          transition:'all 0.15s',
        }}>
          <span>{tb.icon}</span>{lang === 'ar' ? tb.ar : tb.en}
        </button>
      ))}
    </nav>
  )
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────
function DashboardTab({ C }) {
  const [data, setData] = useState(null)
  const [period, setPeriod] = useState('month')
  const [RC, setRC] = useState(null)

  useEffect(() => { import('recharts').then(setRC) }, [])
  useEffect(() => {
    fetch(`/api/finance/dashboard?period=${period}`)
      .then(r => r.json()).then(setData)
  }, [period])

  if (!data) return <Spinner C={C} />

  const { kpis, charts } = data
  const g = kpis.monthlyGrowth

  // Merge trend arrays
  const months = Array.from(new Set([
    ...charts.trend.map(r => `${r.yr}-${String(r.mo).padStart(2,'0')}`),
    ...charts.expTrend.map(r => `${r.yr}-${String(r.mo).padStart(2,'0')}`),
  ])).sort()

  const trendData = months.map(key => {
    const [yr, mo] = key.split('-').map(Number)
    const r = charts.trend.find(x => x.yr === yr && x.mo === mo)
    const e = charts.expTrend.find(x => x.yr === yr && x.mo === mo)
    return { label: MONTHS[mo - 1], revenue: r?.revenue || 0, expenses: e?.expenses || 0, profit: (r?.revenue || 0) - (e?.expenses || 0) }
  })

  const CHART_COLORS = ['#4ADE80','#60A5FA','#FACC15','#A78BFA','#F0807A','#34D399','#FB923C']

  const renderCharts = () => {
    if (!RC) return null
    const { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } = RC
    return (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginTop:20 }}>
        {/* Revenue trend */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20, gridColumn:'1/-1' }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:16 }}>Revenue vs Expenses — 12 Months</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="label" tick={{ fill:C.muted, fontSize:11 }} />
              <YAxis tick={{ fill:C.muted, fontSize:11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12 }} />
              <Legend wrapperStyle={{ fontSize:12, color:C.muted }} />
              <Area type="monotone" dataKey="revenue"  stroke="#4ADE80" fill="#4ADE8022" name="Revenue"  strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="#F0807A" fill="#F0807A18" name="Expenses" strokeWidth={2} />
              <Line type="monotone" dataKey="profit"   stroke="#60A5FA" name="Net Profit" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by source */}
        {charts.bySource.length > 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:16 }}>Revenue by Source</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.bySource} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} paddingAngle={3}>
                  {charts.bySource.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize:11, color:C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by employee */}
        {charts.byEmployee.length > 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:16 }}>Revenue by Employee</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.byEmployee} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                <XAxis type="number" tick={{ fill:C.muted, fontSize:10 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill:C.muted, fontSize:11 }} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12 }} />
                <Bar dataKey="total" fill="#4ADE80" radius={[0, 6, 6, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment methods */}
        {charts.byMethod.length > 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:16 }}>Payment Methods</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.byMethod} dataKey="total" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {charts.byMethod.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12 }} />
                <Legend wrapperStyle={{ fontSize:11, color:C.muted }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by product */}
        {charts.byProduct.length > 0 && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
            <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:16 }}>Revenue by Product Type</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.byProduct}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="name" tick={{ fill:C.muted, fontSize:11 }} />
                <YAxis tick={{ fill:C.muted, fontSize:11 }} tickFormatter={v => '$' + (v/1000).toFixed(0) + 'k'} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ background:C.bg2, border:`1px solid ${C.border}`, borderRadius:10, fontSize:12 }} />
                <Bar dataKey="total" fill="#A78BFA" radius={[6, 6, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:C.ink }}>Finance Dashboard</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5 }}>
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(74,222,128,0.10)', border:'1px solid rgba(74,222,128,0.25)', color:C.gold, fontWeight:700 }}>
              📅 {currentFiscalYear().labelEn}
            </span>
            <span style={{ fontSize:11, color:C.muted }}>•</span>
            <span style={{ fontSize:11, color:C.muted }}>{currentFiscalYear().start} → {currentFiscalYear().end}</span>
            <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(96,165,250,0.10)', border:'1px solid rgba(96,165,250,0.25)', color:'#60A5FA', fontWeight:700 }}>
              🇯🇴 JOD — دينار أردني
            </span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['day','week','month','year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding:'6px 14px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
              background: period === p ? C.gold : C.g10,
              color: period === p ? C.goldText : C.muted,
              border: `1px solid ${period === p ? C.gold : C.border}`,
            }}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16, marginBottom:8 }}>
        <KpiCard label="Total Revenue"    value={fmt(kpis.totalRevenue)}   icon="💰" color={C.gold}   C={C} sub={`${kpis.salesCount} sales`} />
        <KpiCard label="Total Expenses"   value={fmt(kpis.totalExpenses)}  icon="📋" color={C.red}    C={C} />
        <KpiCard label="Net Profit"       value={fmt(kpis.netProfit)}      icon="📈" color={kpis.netProfit >= 0 ? C.gold : C.red} C={C}
          sub={`Margin: ${kpis.totalRevenue > 0 ? fmtPct(kpis.netProfit / kpis.totalRevenue * 100) : '0%'}`} />
        <KpiCard label="Pending Payments" value={fmt(kpis.pendingPayments)} icon="⏳" color={C.yellow}  C={C} sub={`${kpis.pendingCount} invoices`} />
        <KpiCard label="Commissions Due"  value={fmt(kpis.pendingCommissions)} icon="⚡" color={C.purple} C={C} />
        <KpiCard label="Withdrawals"      value={fmt(kpis.outstandingWithdrawals)} icon="🏦" color={C.blue} C={C} sub={`${kpis.withdrawalCount} pending`} />
        <KpiCard label="Monthly Growth"   value={(g >= 0 ? '+' : '') + fmtPct(g)} icon="📊"
          color={g >= 0 ? C.gold : C.red} C={C} />
      </div>

      {renderCharts()}

      {/* Top countries table */}
      {charts.byCountry.length > 0 && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20, marginTop:20 }}>
          <div style={{ fontSize:14, fontWeight:700, color:C.ink, marginBottom:12 }}>Revenue by Country</div>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['Country','Revenue','Sales','Share'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:'left', color:C.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {charts.byCountry.map((r, i) => {
                const total = charts.byCountry.reduce((s, x) => s + x.total, 0)
                return (
                  <tr key={i}>
                    <td style={{ padding:'9px 12px', color:C.ink }}>{r.name}</td>
                    <td style={{ padding:'9px 12px', color:C.gold, fontWeight:700, fontFamily:'monospace' }}>{fmt(r.total)}</td>
                    <td style={{ padding:'9px 12px', color:C.muted }}>{r.count}</td>
                    <td style={{ padding:'9px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ height:6, borderRadius:3, background:C.g10, flex:1 }}>
                          <div style={{ height:'100%', borderRadius:3, background:C.gold, width: fmtPct(r.total / total * 100) }} />
                        </div>
                        <span style={{ color:C.muted, fontSize:11 }}>{fmtPct(r.total / total * 100)}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Sales Tab ────────────────────────────────────────────────────────────
function SalesTab({ C }) {
  const [sales, setSales] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [empFilter, setEmpFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    customerName:'', customerEmail:'', customerPhone:'', customerCountry:'',
    employeeId:'', productType:'course', productName:'',
    subtotal:'', discountAmount:'0', taxAmount:'0', total:'',
    currency:'JOD', paymentMethod:'stripe', paymentStatus:'paid',
    source:'', notes:'', saleDate: new Date().toISOString().split('T')[0],
  })

  const loadEmployees = useCallback(async () => {
    const r = await fetch('/api/finance/sales?employees=1')
    const d = await r.json()
    setEmployees(d.employees || [])
  }, [])

  const loadSales = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page, limit:20 })
    if (search)    params.set('search', search)
    if (status)    params.set('status', status)
    if (empFilter) params.set('employeeId', empFilter)
    if (dateFrom)  params.set('dateFrom', dateFrom)
    if (dateTo)    params.set('dateTo', dateTo)
    const r = await fetch('/api/finance/sales?' + params)
    const d = await r.json()
    setSales(d.sales || [])
    setTotal(d.total || 0)
    setPages(d.pages || 1)
    setLoading(false)
  }, [page, search, status, empFilter, dateFrom, dateTo])

  useEffect(() => { loadEmployees(); loadSales() }, [loadEmployees, loadSales])

  const setF = k => v => setForm(f => ({ ...f, [k]: v }))

  const calcTotal = (s, d, t) => {
    const sub = parseFloat(s) || 0
    const disc = parseFloat(d) || 0
    const tax = parseFloat(t) || 0
    return (sub - disc + tax).toFixed(2)
  }

  async function submitSale() {
    const total = calcTotal(form.subtotal, form.discountAmount, form.taxAmount)
    const payload = { ...form, total, subtotal: form.subtotal || total }
    const r = await fetch('/api/finance/sales', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    const d = await r.json()
    if (r.ok) { setModalOpen(false); setMsg('Sale created'); loadSales() }
    else setMsg(d.error || 'Error')
  }

  async function updateSale() {
    if (!editModal) return
    const r = await fetch('/api/finance/sales', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(editModal) })
    if (r.ok) { setEditModal(null); setMsg('Updated'); loadSales() }
  }

  async function deleteSale(id) {
    if (!confirm('Mark this sale as deleted?')) return
    await fetch('/api/finance/sales', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    setMsg('Deleted'); loadSales()
  }

  const cols = [
    { key:'invoice_number', label:'Invoice', render: r => <span style={{ fontFamily:'monospace', color:C.gold, fontSize:12 }}>{r.invoice_number}</span> },
    { key:'customer_name',  label:'Customer' },
    { key:'employee_name',  label:'Employee', render: r => r.employee_name || '—' },
    { key:'product_name',   label:'Product',  render: r => r.product_name || r.product_type },
    { key:'total',          label:'Amount',   render: r => <span style={{ fontFamily:'monospace', fontWeight:700, color:C.gold }}>{fmt(r.total, r.currency)}</span> },
    { key:'payment_status', label:'Status',   render: r => <Badge status={r.payment_status} C={C} /> },
    { key:'payment_method', label:'Method',   render: r => r.payment_method },
    { key:'sale_date',      label:'Date',     render: r => fmtDate(r.sale_date) },
    { key:'actions',        label:'',         render: r => (
      <div style={{ display:'flex', gap:6 }}>
        <button onClick={e => { e.stopPropagation(); setEditModal(r) }} style={{ background:C.g10, border:'none', borderRadius:6, padding:'4px 10px', color:C.muted, fontSize:12, cursor:'pointer' }}>Edit</button>
        <button onClick={e => { e.stopPropagation(); deleteSale(r.id) }} style={{ background:C.redBg, border:'none', borderRadius:6, padding:'4px 10px', color:C.red, fontSize:12, cursor:'pointer' }}>Del</button>
      </div>
    )},
  ]

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Sales</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{fmtN(total)} records</div>
        </div>
        <Btn onClick={() => setModalOpen(true)} C={C}>+ New Sale</Btn>
      </div>

      {msg && <div style={{ padding:'10px 16px', background:C.g10, borderRadius:10, color:C.gold, fontSize:13, marginBottom:16 }}>{msg}</div>}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search invoice, customer, product…"
          style={{ flex:1, minWidth:200, padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
          <option value="">All Status</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={empFilter} onChange={e => { setEmpFilter(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
          <option value="">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }} />
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }} />
      </div>

      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
        {loading ? <Spinner C={C} /> : <Table cols={cols} rows={sales} C={C} />}
        <Pagination page={page} pages={pages} onChange={setPage} C={C} />
      </div>

      {/* Create Sale Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Sale" C={C} width={640}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <Input label="Customer Name" value={form.customerName} onChange={setF('customerName')} required C={C} />
          <Input label="Customer Email" value={form.customerEmail} onChange={setF('customerEmail')} type="email" C={C} />
          <Input label="Customer Phone" value={form.customerPhone} onChange={setF('customerPhone')} C={C} />
          <Input label="Country" value={form.customerCountry} onChange={setF('customerCountry')} C={C} />
          <Input label="Employee" value={form.employeeId} onChange={setF('employeeId')} C={C}
            options={[{value:'',label:'— None —'},...employees.map(e => ({ value:e.id, label:e.name }))]} />
          <Input label="Product Type" value={form.productType} onChange={v => { setF('productType')(v); setF('productName')('') }} C={C}
            options={PRODUCT_TYPES} />
          {form.productType === 'course' ? (
            <div style={{ marginBottom:14, gridColumn:'1/-1' }}>
              <div style={{ fontSize:12, color:C.muted, fontWeight:600, marginBottom:8, letterSpacing:'0.04em' }}>الكورس / Course <span style={{ color:C.red }}>*</span></div>
              <div style={{ display:'flex', gap:10 }}>
                {COURSE_OPTIONS.map(co => (
                  <button type="button" key={co.value} onClick={() => setF('productName')(co.value)} style={{
                    flex:1, padding:'12px 10px', borderRadius:12, cursor:'pointer',
                    border:`2px solid ${form.productName === co.value ? C.gold : C.border}`,
                    background: form.productName === co.value ? C.g20 : C.bg3,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all 0.15s',
                  }}>
                    <span style={{ fontSize:22 }}>{co.icon}</span>
                    <span style={{ fontSize:11, fontWeight:700, color: form.productName === co.value ? C.gold : C.muted, textAlign:'center', lineHeight:1.3 }}>
                      {co.labelAr}
                    </span>
                    <span style={{ fontSize:10, color:C.muted2 }}>{co.labelEn}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Input label="Product Name" value={form.productName} onChange={setF('productName')} C={C} style={{ gridColumn:'1/-1' }} />
          )}
          <Input label="Subtotal (JOD)" value={form.subtotal} onChange={v => { setF('subtotal')(v); setF('total')(calcTotal(v, form.discountAmount, form.taxAmount)) }} type="number" required C={C} />
          <Input label="Discount" value={form.discountAmount} onChange={v => { setF('discountAmount')(v); setF('total')(calcTotal(form.subtotal, v, form.taxAmount)) }} type="number" C={C} />
          <Input label="Tax" value={form.taxAmount} onChange={v => { setF('taxAmount')(v); setF('total')(calcTotal(form.subtotal, form.discountAmount, v)) }} type="number" C={C} />
          <Input label="Total" value={form.total} onChange={setF('total')} type="number" required C={C} />
          <Input label="Payment Method" value={form.paymentMethod} onChange={setF('paymentMethod')} C={C}
            options={PAYMENT_METHODS} />
          <Input label="Payment Status" value={form.paymentStatus} onChange={setF('paymentStatus')} C={C}
            options={PAYMENT_STATUSES} />
          <Input label="Source" value={form.source} onChange={setF('source')} placeholder="website, whatsapp…" C={C} />
          <Input label="Sale Date" value={form.saleDate} onChange={setF('saleDate')} type="date" C={C} />
        </div>
        <Input label="Notes" value={form.notes} onChange={setF('notes')} C={C} />
        <Btn onClick={submitSale} C={C}>Create Sale</Btn>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Sale" C={C}>
        {editModal && <>
          <Input label="Payment Status" value={editModal.payment_status} onChange={v => setEditModal(m => ({...m, paymentStatus:v, payment_status:v}))} C={C} options={PAYMENT_STATUSES} />
          <Input label="Refund Status" value={editModal.refund_status || ''} onChange={v => setEditModal(m => ({...m, refund_status:v}))} C={C} options={['none','partial','full']} />
          <Input label="Refund Amount" value={editModal.refund_amount || ''} onChange={v => setEditModal(m => ({...m, refund_amount:v}))} type="number" C={C} />
          <Input label="Refund Reason" value={editModal.refund_reason || ''} onChange={v => setEditModal(m => ({...m, refund_reason:v}))} C={C} />
          <Input label="Notes" value={editModal.notes || ''} onChange={v => setEditModal(m => ({...m, notes:v}))} C={C} />
          <Btn onClick={updateSale} C={C}>Save Changes</Btn>
        </>}
      </Modal>
    </div>
  )
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────
function ExpensesTab({ C }) {
  const [expenses, setExpenses] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editModal, setEditModal] = useState(null)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    category:'Marketing', subCategory:'', vendor:'', description:'',
    amount:'', taxAmount:'0', currency:'JOD', paymentMethod:'bank',
    paymentStatus:'paid', approvalStatus:'approved',
    isRecurring:false, recurrencePattern:'', recurrenceEndDate:'',
    expenseDate: new Date().toISOString().split('T')[0], notes:'',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit:20 })
    if (search)   p.set('search', search)
    if (category) p.set('category', category)
    if (status)   p.set('status', status)
    const r = await fetch('/api/finance/expenses?' + p)
    const d = await r.json()
    setExpenses(d.expenses || [])
    setTotal(d.total || 0)
    setPages(d.pages || 1)
    setLoading(false)
  }, [page, search, category, status])

  useEffect(() => { load() }, [load])

  const setF = k => v => setForm(f => ({ ...f, [k]: v }))

  async function submitExpense() {
    const r = await fetch('/api/finance/expenses', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const d = await r.json()
    if (r.ok) { setModalOpen(false); setMsg('Expense added'); load() }
    else setMsg(d.error || 'Error')
  }

  async function approve(id) {
    await fetch('/api/finance/expenses', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id, approvalStatus:'approved' }) })
    setMsg('Approved'); load()
  }

  async function reject(id) {
    const notes = prompt('Rejection reason:')
    if (!notes) return
    await fetch('/api/finance/expenses', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id, approvalStatus:'rejected', approvalNotes:notes }) })
    setMsg('Rejected'); load()
  }

  const cols = [
    { key:'expense_number', label:'Ref', render: r => <span style={{ fontFamily:'monospace', color:C.gold, fontSize:12 }}>{r.expense_number}</span> },
    { key:'category',       label:'Category', render: r => (
      <span style={{ background:C.g10, color:C.goldL, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{r.category}</span>
    )},
    { key:'vendor',         label:'Vendor',   render: r => r.vendor || '—' },
    { key:'description',    label:'Description', render: r => <span style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', display:'block' }}>{r.description || '—'}</span> },
    { key:'total_amount',   label:'Amount',   render: r => <span style={{ fontFamily:'monospace', fontWeight:700, color:C.red }}>{fmt(r.total_amount, r.currency)}</span> },
    { key:'approval_status',label:'Approval', render: r => <Badge status={r.approval_status} C={C} /> },
    { key:'expense_date',   label:'Date',     render: r => fmtDate(r.expense_date) },
    { key:'actions',        label:'', render: r => (
      <div style={{ display:'flex', gap:5 }}>
        {r.approval_status === 'pending' && <>
          <button onClick={e => { e.stopPropagation(); approve(r.id) }} style={{ background:C.g20, border:'none', borderRadius:6, padding:'4px 9px', color:C.gold, fontSize:11, cursor:'pointer', fontWeight:700 }}>✓ Approve</button>
          <button onClick={e => { e.stopPropagation(); reject(r.id) }} style={{ background:C.redBg, border:'none', borderRadius:6, padding:'4px 9px', color:C.red, fontSize:11, cursor:'pointer' }}>✕ Reject</button>
        </>}
      </div>
    )},
  ]

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Expenses</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{fmtN(total)} records</div>
        </div>
        <Btn onClick={() => setModalOpen(true)} C={C}>+ Add Expense</Btn>
      </div>

      {msg && <div style={{ padding:'10px 16px', background:C.g10, borderRadius:10, color:C.gold, fontSize:13, marginBottom:16 }}>{msg}</div>}

      <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search vendor, description…"
          style={{ flex:1, minWidth:200, padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }} />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
          <option value="">All Categories</option>
          {EXPENSE_CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ padding:'9px 13px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
          <option value="">All Status</option>
          {['pending','approved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
        {loading ? <Spinner C={C} /> : <Table cols={cols} rows={expenses} C={C} />}
        <Pagination page={page} pages={pages} onChange={setPage} C={C} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Expense" C={C} width={600}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
          <Input label="Category" value={form.category} onChange={setF('category')} required C={C}
            options={EXPENSE_CATS} />
          <Input label="Sub-Category" value={form.subCategory} onChange={setF('subCategory')} C={C} />
          <Input label="Vendor" value={form.vendor} onChange={setF('vendor')} required C={C} />
          <Input label="Amount" value={form.amount} onChange={setF('amount')} type="number" required C={C} />
          <Input label="Tax Amount" value={form.taxAmount} onChange={setF('taxAmount')} type="number" C={C} />
          <Input label="Currency" value={form.currency} onChange={setF('currency')} C={C}
            options={[{value:'JOD',label:'JOD — دينار أردني'},{value:'USD',label:'USD'},{value:'AED',label:'AED'},{value:'SAR',label:'SAR'},{value:'EUR',label:'EUR'}]} />
          <Input label="Payment Method" value={form.paymentMethod} onChange={setF('paymentMethod')} C={C}
            options={PAYMENT_METHODS} />
          <Input label="Expense Date" value={form.expenseDate} onChange={setF('expenseDate')} type="date" required C={C} />
          <Input label="Approval Status" value={form.approvalStatus} onChange={setF('approvalStatus')} C={C}
            options={['pending','approved']} />
        </div>
        <Input label="Description" value={form.description} onChange={setF('description')} C={C} />
        <Input label="Notes" value={form.notes} onChange={setF('notes')} C={C} />
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:C.ink, cursor:'pointer' }}>
            <input type="checkbox" checked={form.isRecurring} onChange={e => setF('isRecurring')(e.target.checked)} />
            Recurring Expense
          </label>
        </div>
        {form.isRecurring && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <Input label="Recurrence" value={form.recurrencePattern} onChange={setF('recurrencePattern')} C={C}
              options={['monthly','quarterly','yearly']} />
            <Input label="End Date" value={form.recurrenceEndDate} onChange={setF('recurrenceEndDate')} type="date" C={C} />
          </div>
        )}
        <Btn onClick={submitExpense} C={C}>Add Expense</Btn>
      </Modal>
    </div>
  )
}

// ─── Withdrawals Tab ──────────────────────────────────────────────────────
function WithdrawalsTab({ C }) {
  const [withdrawals, setWithdrawals] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [employees, setEmployees] = useState([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ employeeId:'', amount:'', currency:'JOD', reason:'' })

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page, limit:20 })
    if (status) p.set('status', status)
    const [r, re] = await Promise.all([
      fetch('/api/finance/withdrawals?' + p),
      fetch('/api/finance/sales?employees=1'),
    ])
    const [d, de] = await Promise.all([r.json(), re.json()])
    setWithdrawals(d.withdrawals || [])
    setTotal(d.total || 0)
    setPages(d.pages || 1)
    setEmployees(de.employees || [])
    setLoading(false)
  }, [page, status])

  useEffect(() => { load() }, [load])

  const setF = k => v => setForm(f => ({ ...f, [k]: v }))

  async function submitWithdrawal() {
    const r = await fetch('/api/finance/withdrawals', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    if (r.ok) { setModalOpen(false); setMsg('Request created'); load() }
  }

  async function action(id, st) {
    let extra = {}
    if (st === 'paid') {
      const ref = prompt('Payment reference number:')
      const date = prompt('Payment date (YYYY-MM-DD):') || new Date().toISOString().split('T')[0]
      const method = prompt('Payment method (bank/cash/transfer):') || 'bank'
      extra = { referenceNumber: ref, paymentDate: date, paymentMethod: method }
    }
    if (st === 'rejected') {
      const notes = prompt('Rejection notes:')
      extra = { approvalNotes: notes }
    }
    const r = await fetch('/api/finance/withdrawals', { method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ id, status: st, ...extra }) })
    if (r.ok) { setMsg(`Status: ${st}`); load() }
  }

  const WORKFLOW = {
    requested:    { label:'Requested', color:C.yellow },
    under_review: { label:'Under Review', color:C.blue },
    approved:     { label:'Approved', color:C.gold },
    rejected:     { label:'Rejected', color:C.red },
    paid:         { label:'Paid', color:C.purple },
  }

  const cols = [
    { key:'withdrawal_number', label:'Ref', render: r => <span style={{ fontFamily:'monospace', color:C.gold, fontSize:12 }}>{r.withdrawal_number}</span> },
    { key:'employee_name', label:'Employee' },
    { key:'amount', label:'Amount', render: r => <span style={{ fontFamily:'monospace', fontWeight:700, color:C.blue }}>{fmt(r.amount, r.currency)}</span> },
    { key:'reason', label:'Reason', render: r => <span style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', display:'block', fontSize:12 }}>{r.reason || '—'}</span> },
    { key:'status', label:'Status', render: r => <Badge status={r.status} C={C} /> },
    { key:'requested_at', label:'Requested', render: r => fmtDate(r.requested_at) },
    { key:'payment_date', label:'Paid On', render: r => r.payment_date ? fmtDate(r.payment_date) : '—' },
    { key:'actions', label:'', render: r => (
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        {r.status === 'requested'    && <Btn onClick={() => action(r.id,'under_review')} C={C} variant="outline" style={{ padding:'3px 9px', fontSize:11 }}>Review</Btn>}
        {r.status === 'under_review' && <Btn onClick={() => action(r.id,'approved')} C={C} style={{ padding:'3px 9px', fontSize:11 }}>Approve</Btn>}
        {r.status === 'under_review' && <Btn onClick={() => action(r.id,'rejected')} C={C} variant="danger" style={{ padding:'3px 9px', fontSize:11 }}>Reject</Btn>}
        {r.status === 'approved'     && <Btn onClick={() => action(r.id,'paid')} C={C} variant="outline" style={{ padding:'3px 9px', fontSize:11 }}>Mark Paid</Btn>}
      </div>
    )},
  ]

  // Status summary
  const summary = Object.entries(WORKFLOW).map(([st, cfg]) => ({
    ...cfg, st, count: withdrawals.filter(w => w.status === st).length,
  }))

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Withdrawals</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{fmtN(total)} total requests</div>
        </div>
        <Btn onClick={() => setModalOpen(true)} C={C}>+ New Request</Btn>
      </div>

      {msg && <div style={{ padding:'10px 16px', background:C.g10, borderRadius:10, color:C.gold, fontSize:13, marginBottom:16 }}>{msg}</div>}

      {/* Workflow summary */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {summary.map(s => (
          <button key={s.st} onClick={() => { setStatus(s.st === status ? '' : s.st); setPage(1) }}
            style={{
              display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 20px',
              background: status === s.st ? s.color + '22' : C.surface,
              border:`1px solid ${status === s.st ? s.color : C.border}`, borderRadius:12,
              cursor:'pointer', minWidth:100,
            }}>
            <span style={{ fontSize:18, fontWeight:800, color:s.color, fontFamily:'monospace' }}>{s.count}</span>
            <span style={{ fontSize:11, color:C.muted, fontWeight:600, marginTop:2 }}>{s.label}</span>
          </button>
        ))}
      </div>

      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
        {loading ? <Spinner C={C} /> : <Table cols={cols} rows={withdrawals} C={C} />}
        <Pagination page={page} pages={pages} onChange={setPage} C={C} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Withdrawal Request" C={C}>
        <Input label="Employee" value={form.employeeId} onChange={setF('employeeId')} required C={C}
          options={employees.map(e => ({ value:e.id, label:e.name }))} />
        <Input label="Amount" value={form.amount} onChange={setF('amount')} type="number" required C={C} />
        <Input label="Currency" value={form.currency} onChange={setF('currency')} C={C}
          options={[{value:'JOD',label:'JOD — دينار أردني'},{value:'USD',label:'USD'},{value:'AED',label:'AED'},{value:'SAR',label:'SAR'}]} />
        <Input label="Reason" value={form.reason} onChange={setF('reason')} C={C} />
        <Btn onClick={submitWithdrawal} C={C}>Submit Request</Btn>
      </Modal>
    </div>
  )
}

// ─── Commissions Tab ──────────────────────────────────────────────────────
function CommissionsTab({ C }) {
  const [data, setData] = useState(null)
  const [rules, setRules] = useState([])
  const [employees, setEmployees] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [view, setView] = useState('leaderboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [ruleModal, setRuleModal] = useState(false)
  const [msg, setMsg] = useState('')
  const [adjForm, setAdjForm] = useState({ employeeId:'', amount:'', type:'adjustment', reason:'' })
  const [ruleForm, setRuleForm] = useState({ ruleType:'percentage', rate:'', fixedAmount:'', employeeId:'', notes:'' })

  const load = useCallback(async () => {
    const [d, re, ru] = await Promise.all([
      fetch(`/api/finance/commissions?year=${year}&month=${month}`).then(r => r.json()),
      fetch('/api/finance/sales?employees=1').then(r => r.json()),
      fetch('/api/finance/commissions?rules=1').then(r => r.json()),
    ])
    setData(d); setEmployees(re.employees || []); setRules(ru.rules || [])
  }, [year, month])

  useEffect(() => { load() }, [load])

  const setA = k => v => setAdjForm(f => ({ ...f, [k]: v }))
  const setR = k => v => setRuleForm(f => ({ ...f, [k]: v }))

  async function submitAdj() {
    const r = await fetch('/api/finance/commissions', { method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ ...adjForm, year, month }) })
    if (r.ok) { setModalOpen(false); setMsg('Adjustment added'); load() }
  }

  async function submitRule() {
    const r = await fetch('/api/finance/commissions?rules=1', { method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(ruleForm) })
    if (r.ok) { setRuleModal(false); setMsg('Rule saved'); load() }
  }

  async function deleteRule(id) {
    if (!confirm('Deactivate this rule?')) return
    await fetch('/api/finance/commissions?rules=1', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ id }) })
    load()
  }

  if (!data) return <Spinner C={C} />

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Commissions</div>
        <div style={{ display:'flex', gap:8 }}>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
            {[2024,2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)}
            style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:10, color:C.ink, fontSize:13 }}>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <Btn onClick={() => setModalOpen(true)} C={C} variant="outline">+ Adjustment</Btn>
          <Btn onClick={() => setRuleModal(true)} C={C}>+ Rule</Btn>
        </div>
      </div>

      {msg && <div style={{ padding:'10px 16px', background:C.g10, borderRadius:10, color:C.gold, fontSize:13, marginBottom:16 }}>{msg}</div>}

      {/* Summary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 }}>
        <KpiCard label="Total Earned"  value={fmt(data.totals.total)}   icon="⚡" color={C.gold}   C={C} />
        <KpiCard label="Paid Out"      value={fmt(data.totals.paid)}    icon="✅" color={C.purple} C={C} />
        <KpiCard label="Pending"       value={fmt(data.totals.pending)} icon="⏳" color={C.yellow} C={C} />
      </div>

      {/* View toggle */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {['leaderboard','rules'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
            background: view === v ? C.gold : C.g10,
            color: view === v ? C.goldText : C.muted,
            border: `1px solid ${view === v ? C.gold : C.border}`,
          }}>{v === 'leaderboard' ? '🏆 Leaderboard' : '⚙️ Rules'}</button>
        ))}
      </div>

      {view === 'leaderboard' && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['#','Employee','Sales','Total Commission','Paid','Pending'].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', color:C.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.map((r, i) => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'12px 14px', color:C.muted, fontWeight:700 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td style={{ padding:'12px 14px', color:C.ink, fontWeight:600 }}>{r.name}</td>
                  <td style={{ padding:'12px 14px', color:C.muted }}>{r.sales}</td>
                  <td style={{ padding:'12px 14px', color:C.gold, fontFamily:'monospace', fontWeight:700 }}>{fmt(r.total)}</td>
                  <td style={{ padding:'12px 14px', color:C.purple, fontFamily:'monospace' }}>{fmt(r.paid)}</td>
                  <td style={{ padding:'12px 14px', color:C.yellow, fontFamily:'monospace' }}>{fmt(r.pending_amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.leaderboard.length === 0 && <EmptyState msg="No commissions this period" C={C} />}
        </div>
      )}

      {view === 'rules' && (
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr>
                {['Employee','Type','Rate','Fixed','Bonus Threshold','Bonus Amount',''].map(h => (
                  <th key={h} style={{ padding:'11px 14px', textAlign:'left', color:C.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                  <td style={{ padding:'11px 14px', color:C.ink }}>{r.employee_name || 'All Employees'}</td>
                  <td style={{ padding:'11px 14px' }}><Badge status={r.rule_type} C={C} /></td>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', color:C.gold }}>{r.rate ? fmtPct(r.rate * 100) : '—'}</td>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', color:C.gold }}>{r.fixed_amount > 0 ? fmt(r.fixed_amount) : '—'}</td>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', color:C.muted }}>{r.monthly_bonus_threshold ? fmt(r.monthly_bonus_threshold) : '—'}</td>
                  <td style={{ padding:'11px 14px', fontFamily:'monospace', color:C.purple }}>{r.monthly_bonus_amount ? fmt(r.monthly_bonus_amount) : '—'}</td>
                  <td style={{ padding:'11px 14px' }}>
                    <button onClick={() => deleteRule(r.id)} style={{ background:C.redBg, border:'none', borderRadius:6, padding:'3px 9px', color:C.red, fontSize:11, cursor:'pointer' }}>Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rules.length === 0 && <EmptyState msg="No commission rules defined" C={C} />}
        </div>
      )}

      {/* Adjustment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Adjustment" C={C}>
        <Input label="Employee" value={adjForm.employeeId} onChange={setA('employeeId')} required C={C}
          options={employees.map(e => ({ value:e.id, label:e.name }))} />
        <Input label="Amount" value={adjForm.amount} onChange={setA('amount')} type="number" required C={C} />
        <Input label="Type" value={adjForm.type} onChange={setA('type')} C={C}
          options={['adjustment','bonus','penalty']} />
        <Input label="Reason" value={adjForm.reason} onChange={setA('reason')} C={C} />
        <Btn onClick={submitAdj} C={C}>Add Adjustment</Btn>
      </Modal>

      {/* Rule Modal */}
      <Modal open={ruleModal} onClose={() => setRuleModal(false)} title="Commission Rule" C={C}>
        <Input label="Employee (blank = all)" value={ruleForm.employeeId} onChange={setR('employeeId')} C={C}
          options={[{value:'',label:'All Employees'},...employees.map(e => ({ value:e.id, label:e.name }))]} />
        <Input label="Rule Type" value={ruleForm.ruleType} onChange={setR('ruleType')} C={C}
          options={['percentage','fixed','tiered']} />
        {ruleForm.ruleType === 'percentage' && <Input label="Rate (e.g. 0.05 = 5%)" value={ruleForm.rate} onChange={setR('rate')} type="number" C={C} />}
        {ruleForm.ruleType === 'fixed'      && <Input label="Fixed Amount" value={ruleForm.fixedAmount} onChange={setR('fixedAmount')} type="number" C={C} />}
        <Input label="Monthly Bonus Threshold" value={ruleForm.monthlyBonusThreshold} onChange={setR('monthlyBonusThreshold')} type="number" C={C} />
        <Input label="Monthly Bonus Amount"    value={ruleForm.monthlyBonusAmount}    onChange={setR('monthlyBonusAmount')}    type="number" C={C} />
        <Input label="Notes" value={ruleForm.notes} onChange={setR('notes')} C={C} />
        <Btn onClick={submitRule} C={C}>Save Rule</Btn>
      </Modal>
    </div>
  )
}

// ─── Reports Tab ──────────────────────────────────────────────────────────
function ReportsTab({ C }) {
  const [reportType, setReportType] = useState('pl')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const fy = currentFiscalYear()
  const [dateFrom, setDateFrom] = useState(fy.start)
  const [dateTo, setDateTo] = useState(fy.end)
  const [year, setYear] = useState(fy.year)
  const [month, setMonth] = useState(new Date().getMonth() + 1)

  async function generate() {
    setLoading(true); setData(null)
    const p = new URLSearchParams({ type: reportType })
    if (reportType === 'pl') { p.set('dateFrom', dateFrom); p.set('dateTo', dateTo) }
    if (reportType === 'cashflow') { p.set('year', year); p.set('month', month) }
    const r = await fetch('/api/finance/reports?' + p)
    const d = await r.json()
    setData(d); setLoading(false)
  }

  const renderPL = () => {
    if (!data) return null
    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          <KpiCard label="Total Revenue"  value={fmt(data.totalRevenue)}  icon="💰" color={C.gold}  C={C} />
          <KpiCard label="Total Expenses" value={fmt(data.totalExpenses)} icon="📋" color={C.red}   C={C} />
          <KpiCard label="Gross Profit"   value={fmt(data.grossProfit)}   icon="📈" color={data.grossProfit >= 0 ? C.gold : C.red} C={C} />
          <KpiCard label="Gross Margin"   value={data.grossMargin + '%'}  icon="%" color={C.purple} C={C} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.gold }}>Revenue Breakdown</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <tbody>
                {data.revenue.map((r, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'10px 18px', color:C.ink, textTransform:'capitalize' }}>{r.label}</td>
                    <td style={{ padding:'10px 18px', color:C.muted, textAlign:'right' }}>{r.cnt} sales</td>
                    <td style={{ padding:'10px 18px', color:C.gold, fontWeight:700, fontFamily:'monospace', textAlign:'right' }}>{fmt(r.total)}</td>
                  </tr>
                ))}
                {!data.revenue.length && <tr><td colSpan={3} style={{ padding:20, textAlign:'center', color:C.muted2 }}>No revenue data</td></tr>}
              </tbody>
            </table>
          </div>

          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color:C.red }}>Expense Breakdown</div>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <tbody>
                {data.expenses.map((r, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'10px 18px', color:C.ink }}>{r.label}</td>
                    <td style={{ padding:'10px 18px', color:C.muted, textAlign:'right' }}>{r.cnt}</td>
                    <td style={{ padding:'10px 18px', color:C.red, fontWeight:700, fontFamily:'monospace', textAlign:'right' }}>{fmt(r.total)}</td>
                  </tr>
                ))}
                {!data.expenses.length && <tr><td colSpan={3} style={{ padding:20, textAlign:'center', color:C.muted2 }}>No expense data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderCashFlow = () => {
    if (!data) return null
    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
          <KpiCard label="Total Inflows"  value={fmt(data.totalInflows)}  icon="⬇️" color={C.gold}   C={C} />
          <KpiCard label="Total Outflows" value={fmt(data.totalOutflows)} icon="⬆️" color={C.red}    C={C} />
          <KpiCard label="Net Cash Flow"  value={fmt(data.netCashFlow)}   icon="💧" color={data.netCashFlow >= 0 ? C.gold : C.red} C={C} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {[
            { title:'Inflows (Sales)', rows:data.inflows, color:C.gold },
            { title:'Outflows (Expenses)', rows:data.outflows, color:C.red },
          ].map(({ title, rows, color }) => (
            <div key={title} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:`1px solid ${C.border}`, fontWeight:700, color }}>{title}</div>
              <div style={{ maxHeight:320, overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} style={{ borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:'8px 14px', color:C.muted, fontFamily:'monospace', fontSize:11 }}>{r.date}</td>
                        <td style={{ padding:'8px 14px', color:C.muted2 }}>{r.desc}</td>
                        <td style={{ padding:'8px 14px', color, fontWeight:700, fontFamily:'monospace', textAlign:'right' }}>{fmt(r.amount)}</td>
                      </tr>
                    ))}
                    {!rows.length && <tr><td colSpan={3} style={{ padding:20, textAlign:'center', color:C.muted2 }}>No data</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Reports</div>
        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(74,222,128,0.10)', border:'1px solid rgba(74,222,128,0.25)', color:C.gold, fontWeight:700 }}>
          📅 {fy.labelEn}
        </span>
        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:'rgba(96,165,250,0.10)', border:'1px solid rgba(96,165,250,0.25)', color:'#60A5FA', fontWeight:700 }}>
          🇯🇴 JOD
        </span>
      </div>

      {/* Report selector */}
      <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20, marginBottom:24 }}>
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {[
            { id:'pl',       label:'Profit & Loss' },
            { id:'cashflow', label:'Cash Flow'      },
          ].map(t => (
            <button key={t.id} onClick={() => { setReportType(t.id); setData(null) }} style={{
              padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer',
              background: reportType === t.id ? C.gold : C.g10,
              color: reportType === t.id ? C.goldText : C.muted,
              border: `1px solid ${reportType === t.id ? C.gold : C.border}`,
            }}>{t.label}</button>
          ))}
        </div>

        {reportType === 'pl' && (
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:C.muted }}>📅 {fy.labelEn}:</span>
            <label style={{ fontSize:12, color:C.muted, fontWeight:600 }}>From:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, color:C.ink, fontSize:13 }} />
            <label style={{ fontSize:12, color:C.muted, fontWeight:600 }}>To:</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, color:C.ink, fontSize:13 }} />
            <button onClick={() => { setDateFrom(fy.start); setDateTo(fy.end) }}
              style={{ padding:'7px 12px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', background:'rgba(74,222,128,0.08)', color:C.gold, border:`1px solid rgba(74,222,128,0.25)` }}>
              Reset to FY
            </button>
          </div>
        )}

        {reportType === 'cashflow' && (
          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <select value={year} onChange={e => setYear(e.target.value)}
              style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, color:C.ink, fontSize:13 }}>
              {[2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(e.target.value)}
              style={{ padding:'8px 12px', background:C.bg3, border:`1px solid ${C.border}`, borderRadius:8, color:C.ink, fontSize:13 }}>
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
        )}

        <div style={{ marginTop:16 }}>
          <Btn onClick={generate} C={C} disabled={loading}>
            {loading ? 'Generating…' : '📊 Generate Report'}
          </Btn>
        </div>
      </div>

      {reportType === 'pl'       && renderPL()}
      {reportType === 'cashflow' && renderCashFlow()}
    </div>
  )
}

// ─── Ledger Tab ───────────────────────────────────────────────────────────
function LedgerTab({ C }) {
  const [view, setView] = useState('accounts')
  const [accounts, setAccounts] = useState([])
  const [journal, setJournal] = useState([])
  const [jTotal, setJTotal] = useState(0)
  const [jPages, setJPages] = useState(1)
  const [jPage, setJPage] = useState(1)
  const [auditLogs, setAuditLogs] = useState([])
  const [aTotal, setATotal] = useState(0)
  const [aPages, setAPages] = useState(1)
  const [aPage, setAPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (view === 'accounts') {
      const r = await fetch('/api/finance/reports?type=accounts')
      const d = await r.json()
      setAccounts(d.accounts || [])
    } else if (view === 'journal') {
      const r = await fetch(`/api/finance/reports?type=journal&page=${jPage}&limit=30`)
      const d = await r.json()
      setJournal(d.entries || [])
      setJTotal(d.total || 0); setJPages(d.pages || 1)
    } else if (view === 'audit') {
      const r = await fetch(`/api/finance/reports?type=audit&page=${aPage}&limit=40`)
      const d = await r.json()
      setAuditLogs(d.logs || [])
      setATotal(d.total || 0); setAPages(d.pages || 1)
    }
    setLoading(false)
  }, [view, jPage, aPage])

  useEffect(() => { load() }, [load])

  const groupedAccounts = accounts.reduce((acc, a) => {
    if (!acc[a.type]) acc[a.type] = []
    acc[a.type].push(a)
    return acc
  }, {})

  const TYPE_COLORS = { asset:'#60A5FA', liability:'#F0807A', equity:'#A78BFA', revenue:'#4ADE80', expense:'#FACC15' }

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:800, color:C.ink }}>Ledger & Accounting</div>
        <div style={{ display:'flex', gap:6 }}>
          {['accounts','journal','audit'].map(v => (
            <button key={v} onClick={() => { setView(v) }} style={{
              padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:700, cursor:'pointer',
              background: view === v ? C.gold : C.g10,
              color: view === v ? C.goldText : C.muted,
              border: `1px solid ${view === v ? C.gold : C.border}`,
            }}>{v === 'accounts' ? '📂 Accounts' : v === 'journal' ? '📓 Journal' : '🔍 Audit Log'}</button>
          ))}
        </div>
      </div>

      {loading && <Spinner C={C} />}

      {!loading && view === 'accounts' && (
        <div style={{ display:'grid', gap:16 }}>
          {Object.entries(groupedAccounts).map(([type, accs]) => (
            <div key={type} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'13px 18px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ width:10, height:10, borderRadius:'50%', background:TYPE_COLORS[type] || C.muted, display:'inline-block' }} />
                <span style={{ fontWeight:700, color:C.ink, textTransform:'uppercase', fontSize:12, letterSpacing:'0.06em' }}>{type}</span>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr>
                    {['Code','Account Name','Category','Currency'].map(h => (
                      <th key={h} style={{ padding:'8px 16px', textAlign:'left', color:C.muted, fontSize:11, fontWeight:700, textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accs.map(a => (
                    <tr key={a.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:'9px 16px', fontFamily:'monospace', color:TYPE_COLORS[type] || C.muted, fontWeight:700 }}>{a.code}</td>
                      <td style={{ padding:'9px 16px', color:C.ink }}>{a.name}</td>
                      <td style={{ padding:'9px 16px', color:C.muted2, fontSize:12 }}>{a.category || '—'}</td>
                      <td style={{ padding:'9px 16px', color:C.muted2, fontSize:12 }}>{a.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          {!accounts.length && <EmptyState msg="Run migrate-finance.js to seed chart of accounts" C={C} />}
        </div>
      )}

      {!loading && view === 'journal' && (
        <div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>{fmtN(jTotal)} entries</div>
          <div style={{ display:'grid', gap:10 }}>
            {journal.map(e => (
              <div key={e.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:'14px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:8 }}>
                  <span style={{ fontFamily:'monospace', color:C.gold, fontSize:12, fontWeight:700 }}>{e.entry_number}</span>
                  <span style={{ fontSize:12, color:C.muted }}>{fmtDate(e.entry_date)}</span>
                  <Badge status={e.source_type || 'manual'} C={C} />
                  <span style={{ fontSize:12, color:C.muted2, marginLeft:'auto' }}>{e.created_by}</span>
                </div>
                {e.description && <div style={{ fontSize:13, color:C.ink, marginBottom:8 }}>{e.description}</div>}
                {Array.isArray(e.lines) && e.lines.length > 0 && (
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, marginTop:4 }}>
                    <thead>
                      <tr>
                        {['Account','Debit','Credit'].map(h => (
                          <th key={h} style={{ padding:'4px 10px', textAlign:'left', color:C.muted2, fontSize:10, fontWeight:700, textTransform:'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {e.lines.map((l, i) => (
                        <tr key={i}>
                          <td style={{ padding:'4px 10px', color:C.muted }}>{l.code} — {l.name}</td>
                          <td style={{ padding:'4px 10px', color:C.blue, fontFamily:'monospace' }}>{l.debit > 0 ? fmt(l.debit) : ''}</td>
                          <td style={{ padding:'4px 10px', color:C.red, fontFamily:'monospace' }}>{l.credit > 0 ? fmt(l.credit) : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
            {!journal.length && <EmptyState msg="No journal entries yet" C={C} />}
          </div>
          <Pagination page={jPage} pages={jPages} onChange={setJPage} C={C} />
        </div>
      )}

      {!loading && view === 'audit' && (
        <div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:12 }}>{fmtN(aTotal)} audit events</div>
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr>
                  {['Time','Actor','Action','Entity','ID'].map(h => (
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', color:C.muted, fontSize:10, fontWeight:700, textTransform:'uppercase', borderBottom:`1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(l => (
                  <tr key={l.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:'9px 14px', color:C.muted2, fontFamily:'monospace', fontSize:11 }}>{new Date(l.created_at).toLocaleString('en-GB')}</td>
                    <td style={{ padding:'9px 14px', color:C.ink, fontWeight:600 }}>{l.actor_username}</td>
                    <td style={{ padding:'9px 14px' }}><Badge status={l.action?.replace(/_/g,'_')} C={C} /></td>
                    <td style={{ padding:'9px 14px', color:C.muted }}>{l.entity_type}</td>
                    <td style={{ padding:'9px 14px', color:C.muted2 }}>#{l.entity_id}</td>
                  </tr>
                ))}
                {!auditLogs.length && <tr><td colSpan={5} style={{ padding:30, textAlign:'center', color:C.muted2 }}>No audit events yet</td></tr>}
              </tbody>
            </table>
          </div>
          <Pagination page={aPage} pages={aPages} onChange={setAPage} C={C} />
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FinancePage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang }      = useLang()
  const C = theme === 'light' ? C_LIGHT : C_DARK
  const [tab, setTab] = useState('dashboard')
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => {
      if (!r.ok) { router.replace('/login'); return }
      r.json().then(d => {
        if (d.role !== 'admin') { router.replace('/login'); return }
        setAuthed(true)
      })
    })
  }, [router])

  if (!authed) {
    return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ color:C.muted, fontSize:14 }}>Authenticating…</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Finance System — Bashar Academy</title>
        <meta name="robots" content="noindex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', fontFamily:"'Tajawal',system-ui,sans-serif" }}>
        {/* Sidebar */}
        <FinanceNav tab={tab} setTab={setTab} C={C} lang={lang} />

        {/* Main content */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Top bar */}
          <div style={{
            background:C.bg2, borderBottom:`1px solid ${C.border}`,
            padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button onClick={() => router.push('/admin')} style={{
                background:'none', border:`1px solid ${C.border}`, borderRadius:8,
                padding:'5px 12px', color:C.muted, fontSize:12, cursor:'pointer',
              }}>{lang === 'ar' ? '→ الإدارة' : '← Admin'}</button>
              <span style={{ color:C.border }}>|</span>
              <span style={{ fontSize:13, color:C.ink, fontWeight:700 }}>
                {TABS.find(t => t.id === tab)?.icon} {lang === 'ar' ? TABS.find(t => t.id === tab)?.ar : TABS.find(t => t.id === tab)?.en}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{
                padding:'5px 10px', borderRadius:8, border:`1px solid ${C.border}`,
                background:'transparent', fontSize:16, cursor:'pointer', lineHeight:1,
              }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
                padding:'5px 12px', borderRadius:8, border:`1px solid ${C.border}`,
                background:'transparent', color:C.gold, fontSize:12, fontWeight:700, cursor:'pointer',
              }}>{lang === 'ar' ? 'EN' : 'AR'}</button>
              <span style={{ fontSize:12, color:C.muted2 }}>
                {new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
              </span>
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {tab === 'dashboard'   && <DashboardTab   C={C} />}
            {tab === 'sales'       && <SalesTab        C={C} />}
            {tab === 'expenses'    && <ExpensesTab     C={C} />}
            {tab === 'withdrawals' && <WithdrawalsTab  C={C} />}
            {tab === 'commissions' && <CommissionsTab  C={C} />}
            {tab === 'reports'     && <ReportsTab      C={C} />}
            {tab === 'ledger'      && <LedgerTab       C={C} />}
          </div>
        </div>
      </div>
    </>
  )
}
