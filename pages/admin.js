import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useLang } from './_app'
import { t } from '../lib/i18n'

// ─── Recharts (client-only) ────────────────────────────────────────────────
const {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} = (() => {
  if (typeof window === 'undefined') return {}
  try { return require('recharts') } catch { return {} }
})()

// ─── Brand Colors ─────────────────────────────────────────────────────────
const C = {
  navy:    '#0D0D1A', gold:    '#C9A84C', goldL:   '#E8C96A', goldD:   '#A67C32',
  blue:    '#1E3A5F', surface: '#16213E', emerald: '#2ECC71', silver:  '#A0AEC0',
  locked:  '#4A5568', white:   '#F0EAF5', red:     '#FC8181', purple:  '#B794F4',
  g10: 'rgba(201,168,76,0.10)', g15: 'rgba(201,168,76,0.15)',
  g20: 'rgba(201,168,76,0.20)', g30: 'rgba(201,168,76,0.30)',
  w40: 'rgba(240,234,245,0.40)', w50: 'rgba(240,234,245,0.50)',
  lk20: 'rgba(74,85,104,0.20)', lk30: 'rgba(74,85,104,0.30)',
}

const COURSE_OPTIONS = [
  { value: 'comprehensive', labelAr: 'الدورة الشاملة',  labelEn: 'Comprehensive', icon: '🏆', color: C.gold    },
  { value: 'intermediate',  labelAr: 'الدورة المتوسطة', labelEn: 'Intermediate',  icon: '📈', color: C.purple  },
  { value: 'basic',         labelAr: 'الدورة الأساسية', labelEn: 'Basic',         icon: '🌱', color: C.emerald },
]

// ─── helpers ───────────────────────────────────────────────────────────────
function daysSince(dateStr) {
  if (!dateStr) return 999
  return Math.floor((Date.now() - new Date(dateStr)) / 86_400_000)
}

function buildNotifications(students) {
  const notes = []
  students.forEach(s => {
    const days = daysSince(s.joinedAt)
    const done = Object.values(s.progress || {}).filter(Boolean).length
    if (days >= 14 && done === 0)
      notes.push({ id: `inactive-${s.username}`, type: 'inactive', icon: '😴', color: C.red,    title: `${s.name}`, sub: `لم يبدأ بعد — ${days} يوم منذ الانضمام` })
    if (days <= 7)
      notes.push({ id: `new-${s.username}`,      type: 'new',      icon: '🆕', color: C.emerald, title: `${s.name} انضم للمنصة`, sub: `منذ ${days} يوم` })
  })
  const summary = students.filter(s => {
    const p = Object.values(s.progress || {}).filter(Boolean).length
    return p > 0 && p === Object.keys(s.progress || {}).length
  })
  if (summary.length)
    notes.unshift({ id: 'completed', type: 'completed', icon: '🏆', color: C.gold, title: `${summary.length} طالب أكمل الدورة`, sub: 'اضغط لعرض الشهادات' })
  return notes
}

function buildGrowthData(students) {
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i)
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`, label: d.toLocaleDateString('ar', { month: 'short' }) })
  }
  let cumulative = 0
  return months.map(m => {
    const count = students.filter(s => (s.joinedAt || '').startsWith(m.key)).length
    cumulative += count
    return { name: m.label, طلاب: cumulative, جديد: count }
  })
}

function buildCourseData(students, lang) {
  return COURSE_OPTIONS.map(c => ({
    name: lang === 'ar' ? c.labelAr : c.labelEn,
    value: students.filter(s => s.allowedCourse === c.value).length,
    color: c.color,
  })).filter(d => d.value > 0)
}

function buildTopLessons(students, lessons) {
  const counts = {}
  students.forEach(s => Object.entries(s.progress || {}).forEach(([id, done]) => { if (done) counts[id] = (counts[id] || 0) + 1 }))
  return lessons
    .map(l => ({ name: `${l.id}. ${l.title.slice(0, 20)}`, count: counts[l.id] || 0, pct: students.length ? Math.round(((counts[l.id] || 0) / students.length) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

// ─── Export: CSV ────────────────────────────────────────────────────────────
function exportStudentsCSV(students, lessons, lang) {
  const totalLessons = lessons.length
  const headers = lang === 'ar'
    ? ['الاسم', 'اسم المستخدم', 'الهاتف', 'الدورة', 'نسبة التقدم', 'الدروس المكتملة', 'تاريخ الانضمام']
    : ['Name', 'Username', 'Phone', 'Course', 'Progress %', 'Lessons Done', 'Joined At']

  const rows = students.map(s => {
    const done = Object.values(s.progress || {}).filter(Boolean).length
    const pct  = totalLessons ? Math.round((done / totalLessons) * 100) : 0
    const cm   = COURSE_OPTIONS.find(c => c.value === s.allowedCourse)
    const courseLabel = cm ? (lang === 'ar' ? cm.labelAr : cm.labelEn) : '-'
    // منع تحويل رقم الهاتف إلى صيغة علمية في Excel
    const phone = s.phone ? `="${s.phone}"` : ''
    return [s.name, s.username, phone, courseLabel, `${pct}%`, `${done}/${totalLessons}`, s.joinedAt || '']
  })

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  // BOM لدعم العربية في Excel
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `students-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Export: PDF Report (via window.print) ─────────────────────────────────
function exportStudentsPDF(students, lessons, lang) {
  const totalLessons = lessons.length
  const total = students.length
  const active = students.filter(s => Object.values(s.progress || {}).some(Boolean)).length
  const completed = students.filter(s => totalLessons > 0 && Object.values(s.progress || {}).filter(Boolean).length === totalLessons).length
  const avgProgress = total ? Math.round(students.reduce((a, s) => a + Object.values(s.progress || {}).filter(Boolean).length, 0) / total / (totalLessons || 1) * 100) : 0
  const totalNotes = students.reduce((a, s) => a + Object.keys(s.notes || {}).length, 0)
  const newThisMonth = students.filter(s => daysSince(s.joinedAt) <= 30).length
  const inactive = students.filter(s => daysSince(s.joinedAt) >= 14 && Object.values(s.progress || {}).filter(Boolean).length === 0).length

  const kpis = [
    [lang === 'ar' ? 'إجمالي الطلاب' : 'Total Students', total],
    [lang === 'ar' ? 'طلاب نشطون' : 'Active Students', active],
    [lang === 'ar' ? 'أكملوا الدورة' : 'Completed', completed],
    [lang === 'ar' ? 'متوسط التقدم' : 'Avg Progress', `${avgProgress}%`],
    [lang === 'ar' ? 'انضموا هذا الشهر' : 'New This Month', newThisMonth],
    [lang === 'ar' ? 'غير نشطين' : 'Inactive', inactive],
    [lang === 'ar' ? 'ملاحظات الطلاب' : 'Student Notes', totalNotes],
  ]

  const rows = students.map(s => {
    const done = Object.values(s.progress || {}).filter(Boolean).length
    const pct  = totalLessons ? Math.round((done / totalLessons) * 100) : 0
    const cm   = COURSE_OPTIONS.find(c => c.value === s.allowedCourse)
    const courseLabel = cm ? (lang === 'ar' ? cm.labelAr : cm.labelEn) : '-'
    const color = pct >= 70 ? '#2ECC71' : pct >= 40 ? '#C9A84C' : '#FC8181'
    return `<tr>
      <td>${s.name}</td>
      <td>@${s.username}</td>
      <td>${courseLabel}</td>
      <td>${done}/${totalLessons}</td>
      <td><span style="color:${color};font-weight:800">${pct}%</span></td>
      <td>${s.joinedAt || '-'}</td>
    </tr>`
  }).join('')

  const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { year: 'numeric', month: 'long', day: 'numeric' })

  const html = `<!DOCTYPE html><html dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8" />
  <title>${lang === 'ar' ? 'تقرير الطلاب' : 'Students Report'}</title>
  <style>
    *{box-sizing:border-box;font-family:'Tajawal',Arial,sans-serif}
    body{padding:32px;color:#16213E}
    h1{color:#A67C32;font-size:22px;margin-bottom:4px}
    .sub{color:#888;font-size:13px;margin-bottom:24px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
    .kpi{border:1px solid #eee;border-radius:10px;padding:12px;text-align:center}
    .kpi b{display:block;font-size:22px;color:#A67C32}
    .kpi span{font-size:11px;color:#777}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border:1px solid #eee;padding:8px 10px;text-align:${lang === 'ar' ? 'right' : 'left'}}
    th{background:#16213E;color:#fff}
    tr:nth-child(even){background:#fafafa}
    @media print{ body{padding:10px} }
  </style></head><body>
    <h1>📊 ${lang === 'ar' ? 'تقرير الطلاب الشهري' : 'Monthly Students Report'}</h1>
    <p class="sub">COACH BASHAR ALASALI · ${dateStr}</p>
    <div class="kpis">${kpis.map(([l, v]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
    <table><thead><tr>
      <th>${lang === 'ar' ? 'الاسم' : 'Name'}</th>
      <th>${lang === 'ar' ? 'المستخدم' : 'Username'}</th>
      <th>${lang === 'ar' ? 'الدورة' : 'Course'}</th>
      <th>${lang === 'ar' ? 'الدروس' : 'Lessons'}</th>
      <th>${lang === 'ar' ? 'التقدم' : 'Progress'}</th>
      <th>${lang === 'ar' ? 'الانضمام' : 'Joined'}</th>
    </tr></thead><tbody>${rows}</tbody></table>
  </body></html>`

  const win = window.open('', '_blank')
  if (!win) { alert(lang === 'ar' ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}

// ─── Certificate generator ──────────────────────────────────────────────────
function openCertificate(student, lessons, lang) {
  const totalLessons = lessons.length
  const done = Object.values(student.progress || {}).filter(Boolean).length
  const pct  = totalLessons ? Math.round((done / totalLessons) * 100) : 0
  const isComplete = pct === 100
  const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { year: 'numeric', month: 'long', day: 'numeric' })

  const title = isComplete
    ? (lang === 'ar' ? 'شهادة إتمام' : 'Certificate of Completion')
    : (lang === 'ar' ? 'شهادة مشاركة وتقدير' : 'Certificate of Participation')

  const body = isComplete
    ? (lang === 'ar'
        ? `تشهد أكاديمية الكوتش بشار العسلي بأن الطالب/ة المذكور أعلاه قد أكمل بنجاح برنامج التدريب الكامل على التجارة الإلكترونية عبر منصة eBay.`
        : `This certifies that the above student has successfully completed the full eBay e-commerce training program at Coach Bashar Al-Asali Academy.`)
    : (lang === 'ar'
        ? `تشهد أكاديمية الكوتش بشار العسلي بأن الطالب/ة المذكور أعلاه قد شارك في برنامج التدريب على التجارة الإلكترونية عبر منصة eBay، بنسبة إنجاز ${pct}%.`
        : `This certifies that the above student participated in the eBay e-commerce training program at Coach Bashar Al-Asali Academy, completing ${pct}% of the curriculum.`)

  const html = `<!DOCTYPE html><html dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8" />
  <title>${title} — ${student.name}</title>
  <style>
    *{box-sizing:border-box;font-family:'Tajawal',Arial,sans-serif}
    body{display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f4f0e6}
    .cert{
      width:1000px;max-width:96vw;aspect-ratio:1.41/1;
      background:linear-gradient(135deg,#16213E,#0D0D1A);
      border:10px solid #C9A84C;outline:2px solid #C9A84C;outline-offset:-22px;
      border-radius:18px;color:#F0EAF5;padding:60px;text-align:center;
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
      position:relative;
    }
    .cert::before,.cert::after{content:"✦";position:absolute;color:#C9A84C;font-size:28px;top:34px}
    .cert::before{${lang === 'ar' ? 'right' : 'left'}:34px}
    .cert::after{${lang === 'ar' ? 'left' : 'right'}:34px}
    .brand{color:#C9A84C;letter-spacing:4px;font-size:13px;font-weight:700}
    h1{font-size:34px;color:#E8C96A;margin:6px 0}
    .name{font-size:30px;font-weight:900;color:#fff;border-bottom:2px solid #C9A84C;padding-bottom:8px;margin:10px 0}
    p.body{max-width:680px;line-height:1.9;color:#A0AEC0;font-size:15px}
    .pct{font-size:13px;color:#C9A84C;font-weight:800}
    .footer{display:flex;justify-content:space-between;width:100%;max-width:680px;margin-top:24px;font-size:12px;color:#A0AEC0}
    @media print{ body{background:#fff} .cert{outline:none} @page{size:landscape} }
  </style></head><body>
    <div class="cert">
      <div class="brand">COACH BASHAR ALASALI · EBAY ACADEMY</div>
      <h1>🏆 ${title}</h1>
      <div class="name">${student.name}</div>
      <p class="body">${body}</p>
      ${!isComplete ? `<div class="pct">${lang === 'ar' ? `نسبة الإنجاز: ${pct}%` : `Progress: ${pct}%`}</div>` : ''}
      <div class="footer">
        <span>${lang === 'ar' ? 'التاريخ' : 'Date'}: ${dateStr}</span>
        <span>Coach Bashar Al-Asali — ✦ Signature ✦</span>
      </div>
    </div>
  </body></html>`

  const win = window.open('', '_blank')
  if (!win) { alert(lang === 'ar' ? 'يرجى السماح بالنوافذ المنبثقة' : 'Please allow popups'); return }
  win.document.write(html)
  win.document.close()
  win.onload = () => win.print()
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: C.white }}>
      <p style={{ color: C.gold, fontWeight: '700', marginBottom: '4px' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color || C.silver }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  )
}

// ─── Notification Bell ─────────────────────────────────────────────────────
function NotificationBell({ students, lang }) {
  const [open,    setOpen]    = useState(false)
  const [readIds, setReadIds] = useState(new Set())
  const ref = useRef(null)
  const notifications = buildNotifications(students)
  const unread = notifications.filter(n => !readIds.has(n.id)).length

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        position: 'relative', background: C.lk20, border: `1px solid ${C.lk30}`,
        borderRadius: '10px', width: '38px', height: '38px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
      }}>
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: C.red, color: '#fff', borderRadius: '999px',
            fontSize: '10px', fontWeight: '900', padding: '1px 5px',
            border: `2px solid ${C.navy}`, minWidth: '16px', textAlign: 'center',
          }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '46px', left: lang === 'ar' ? 0 : 'auto', right: lang === 'ar' ? 'auto' : 0,
          width: '320px', background: C.surface, border: `1px solid ${C.g20}`,
          borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', zIndex: 200, overflow: 'hidden',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.lk20}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: C.white, fontWeight: '800', fontSize: '14px' }}>🔔 {lang === 'ar' ? 'التنبيهات' : 'Notifications'}</span>
            {unread > 0 && (
              <button onClick={() => setReadIds(new Set(notifications.map(n => n.id)))} style={{ background: 'none', border: 'none', color: C.gold, fontSize: '12px', cursor: 'pointer', fontWeight: '700' }}>
                {lang === 'ar' ? 'قراءة الكل' : 'Mark all read'}
              </button>
            )}
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: C.silver, fontSize: '13px' }}>
                ✅ {lang === 'ar' ? 'لا توجد تنبيهات' : 'No notifications'}
              </div>
            ) : notifications.map(n => (
              <div key={n.id} onClick={() => setReadIds(r => new Set([...r, n.id]))}
                style={{
                  padding: '12px 16px', borderBottom: `1px solid ${C.lk20}`, cursor: 'pointer',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  background: readIds.has(n.id) ? 'transparent' : 'rgba(201,168,76,0.04)',
                }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{n.icon}</span>
                <div>
                  <p style={{ color: C.white, fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{n.title}</p>
                  <p style={{ color: C.silver, fontSize: '11px' }}>{n.sub}</p>
                </div>
                {!readIds.has(n.id) && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: '5px' }} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────
function AnalyticsTab({ students, lessons, lang, mounted }) {
  const totalLessons  = lessons.length
  const withProgress  = students.filter(s => Object.values(s.progress || {}).some(Boolean))
  const completed     = students.filter(s => totalLessons > 0 && Object.values(s.progress || {}).filter(Boolean).length === totalLessons)
  const avgProgress   = students.length
    ? Math.round(students.reduce((a, s) => a + Object.values(s.progress || {}).filter(Boolean).length, 0) / students.length / totalLessons * 100)
    : 0
  const retention     = students.length ? Math.round((withProgress.length / students.length) * 100) : 0

  const growthData  = buildGrowthData(students)
  const courseData  = buildCourseData(students, lang)
  const topLessons  = buildTopLessons(students, lessons)

  const kpi = [
    { icon: '📈', label: lang==='ar'?'معدل الاستبقاء':'Retention Rate', value: `${retention}%`, color: C.emerald, bg: 'rgba(46,204,113,0.10)', border: 'rgba(46,204,113,0.20)' },
    { icon: '⚡', label: lang==='ar'?'متوسط التقدم':'Avg Progress',     value: `${avgProgress}%`, color: C.gold,    bg: C.g10, border: C.g20 },
    { icon: '🏆', label: lang==='ar'?'أكملوا الدورة':'Completed',        value: completed.length,  color: C.purple,  bg: 'rgba(183,148,244,0.10)', border: 'rgba(183,148,244,0.20)' },
    { icon: '📅', label: lang==='ar'?'إجمالي الطلاب':'Total Students',   value: students.length,   color: C.silver,  bg: C.lk20, border: C.lk30 },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
        {kpi.map((k, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: '16px', padding: '18px', border: `1px solid ${k.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{k.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: '11px', color: C.silver, marginTop: '6px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Area chart — Student Growth */}
      <div style={{ background: C.surface, borderRadius: '18px', padding: '20px', border: `1px solid ${C.g15}` }}>
        <h3 style={{ color: C.white, fontWeight: '800', fontSize: '15px', marginBottom: '20px' }}>
          📈 {lang === 'ar' ? 'نمو الطلاب — آخر 6 أشهر' : 'Student Growth — Last 6 Months'}
        </h3>
        {mounted && students.length > 0 && AreaChart ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.gold} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={C.gold} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: C.silver, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.silver, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="طلاب" name={lang==='ar'?'إجمالي':'Total'} stroke={C.gold} strokeWidth={2.5} fill="url(#gGold)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.silver, fontSize: '13px' }}>
            {mounted ? (lang === 'ar' ? 'لا توجد بيانات كافية' : 'No data yet') : '⏳'}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pie chart — Course Distribution */}
        <div style={{ background: C.surface, borderRadius: '18px', padding: '20px', border: `1px solid ${C.g15}` }}>
          <h3 style={{ color: C.white, fontWeight: '800', fontSize: '14px', marginBottom: '20px' }}>
            🍩 {lang === 'ar' ? 'توزيع الدورات' : 'Course Distribution'}
          </h3>
          {mounted && courseData.length > 0 && PieChart ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={courseData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={4} dataKey="value">
                    {courseData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {courseData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: C.silver, flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.silver, fontSize: '13px' }}>
              {mounted ? (lang === 'ar' ? 'لا يوجد طلاب' : 'No students') : '⏳'}
            </div>
          )}
        </div>

        {/* Bar chart — Top Lessons */}
        <div style={{ background: C.surface, borderRadius: '18px', padding: '20px', border: `1px solid ${C.g15}` }}>
          <h3 style={{ color: C.white, fontWeight: '800', fontSize: '14px', marginBottom: '20px' }}>
            🏅 {lang === 'ar' ? 'أكثر الدروس إكمالاً' : 'Most Completed Lessons'}
          </h3>
          {mounted && topLessons.some(l => l.count > 0) && BarChart ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topLessons} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: C.silver, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fill: C.silver, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name={lang==='ar'?'طلاب أكملوا':'Completed'} radius={[0, 6, 6, 0]}>
                  {topLessons.map((entry, i) => (
                    <Cell key={i} fill={entry.pct >= 70 ? C.emerald : entry.pct >= 40 ? C.gold : C.red} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.silver, fontSize: '13px' }}>
              {mounted ? (lang === 'ar' ? 'لا توجد بيانات' : 'No data yet') : '⏳'}
            </div>
          )}
          {/* Color legend */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '10px', justifyContent: 'center' }}>
            {[['🟢','≥70%',C.emerald],['🟡','40-69%',C.gold],['🔴','<40%',C.red]].map(([ic,lb,cl],i)=>(
              <span key={i} style={{ fontSize: '11px', color: cl, fontWeight: '700' }}>{ic} {lb}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Enhanced Lessons Tab ──────────────────────────────────────────────────
function LessonsTab({ lessons, students, lang }) {
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')   // all | hot | cold | mid
  const totalStudents = students.length

  const enriched = lessons.map(l => {
    const count = students.filter(s => s.progress?.[l.id]).length
    const pct   = totalStudents ? Math.round((count / totalStudents) * 100) : 0
    return { ...l, count, pct }
  })

  const filtered = enriched.filter(l => {
    const matchSearch = l.title.includes(search) || String(l.id).includes(search)
    const matchFilter = filter === 'all' ? true : filter === 'hot' ? l.pct >= 70 : filter === 'cold' ? l.pct < 40 : l.pct >= 40 && l.pct < 70
    return matchSearch && matchFilter
  })

  const hot  = enriched.filter(l => l.pct >= 70).length
  const cold = enriched.filter(l => l.pct < 40).length
  const mid  = enriched.length - hot - cold
  const avgCompletion = enriched.length ? Math.round(enriched.reduce((a, l) => a + l.pct, 0) / enriched.length) : 0

  const inputStyle = { background: C.navy, border: `1px solid ${C.lk30}`, borderRadius: '10px', padding: '9px 14px', color: C.white, fontSize: '13px', outline: 'none' }

  return (
    <div>
      {/* Mini stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          [lessons.length, lang==='ar'?'إجمالي الدروس':'Total', C.gold,   C.g10,                       C.g20],
          [hot,            lang==='ar'?'رائجة':'Hot',            C.emerald,'rgba(46,204,113,0.10)',      'rgba(46,204,113,0.20)'],
          [cold,           lang==='ar'?'فاترة':'Cold',           C.red,    'rgba(252,129,129,0.10)',     'rgba(252,129,129,0.20)'],
          [`${avgCompletion}%`,lang==='ar'?'متوسط الإكمال':'Avg Completion',C.purple,'rgba(183,148,244,0.10)','rgba(183,148,244,0.20)'],
        ].map(([v,l,c,bg,br],i)=>(
          <div key={i} style={{ background: C.surface, borderRadius: '14px', padding: '14px', border: `1px solid ${br}`, textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '900', color: c }}>{v}</div>
            <div style={{ fontSize: '11px', color: C.silver, marginTop: '4px' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={lang === 'ar' ? '🔍 ابحث عن درس...' : '🔍 Search lesson...'}
          style={{ ...inputStyle, flex: 1, minWidth: '180px' }}
        />
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            ['all',  lang==='ar'?'الكل':'All',        C.silver],
            ['hot',  lang==='ar'?'🟢 رائج':'🟢 Hot',   C.emerald],
            ['mid',  lang==='ar'?'🟡 متوسط':'🟡 Mid',  C.gold],
            ['cold', lang==='ar'?'🔴 فاتر':'🔴 Cold',  C.red],
          ].map(([key, label, color]) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700',
              background: filter === key ? 'rgba(201,168,76,0.1)' : C.lk20,
              border: `1px solid ${filter === key ? C.g30 : C.lk30}`,
              color: filter === key ? C.gold : color,
              transition: 'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p style={{ color: C.silver, fontSize: '12px', marginBottom: '12px' }}>
        {lang === 'ar' ? `عرض ${filtered.length} من ${lessons.length} درس` : `Showing ${filtered.length} of ${lessons.length} lessons`}
      </p>

      {/* Lessons list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((l, i) => {
          const dotColor = l.pct >= 70 ? C.emerald : l.pct >= 40 ? C.gold : C.red
          return (
            <div key={l.id} style={{
              background: C.surface, borderRadius: '14px', padding: '14px 16px',
              border: `1px solid ${C.g15}`, display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              {/* Color dot */}
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: dotColor, flexShrink: 0 }} />

              {/* Number */}
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: C.g10, border: `1px solid ${C.g20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '900', color: C.gold, flexShrink: 0 }}>
                {l.id}
              </div>

              {/* Title */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: C.white, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: C.silver }}>
                  <span>⏱ {l.duration}</span>
                  {l.free && <span style={{ color: C.gold }}>★ {lang === 'ar' ? 'مجاني' : 'Free'}</span>}
                </div>
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '70px' }}>
                <div style={{ fontSize: '13px', fontWeight: '900', color: dotColor }}>{l.pct}%</div>
                <div style={{ fontSize: '10px', color: C.silver, marginTop: '1px' }}>
                  {l.count}/{totalStudents} {lang === 'ar' ? 'طالب' : 'students'}
                </div>
                {/* Mini bar */}
                <div style={{ height: '4px', background: C.lk30, borderRadius: '999px', marginTop: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${l.pct}%`, background: dotColor, borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Student Notes Modal ───────────────────────────────────────────────────
function NotesModal({ student, lessons, lang, onClose }) {
  const noteEntries = Object.entries(student.notes || {})
    .filter(([, v]) => v?.trim())
    .map(([lid, text]) => ({ lessonId: lid, lessonTitle: (lessons.find(l => String(l.id) === String(lid))?.title || `درس ${lid}`), text }))
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '20px', padding: '28px', border: `1px solid ${C.g20}`, width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: `0 0 60px rgba(201,168,76,0.1)` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.g15, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {student.photo ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: C.gold, fontSize: '13px', fontWeight: '700' }}>{student.avatar}</span>}
            </div>
            <div>
              <p style={{ color: C.white, fontWeight: '800', fontSize: '15px' }}>{student.name}</p>
              <p style={{ color: C.silver, fontSize: '12px' }}>📝 {noteEntries.length} {lang === 'ar' ? 'ملاحظة' : 'notes'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.lk20, border: 'none', borderRadius: '10px', padding: '8px 14px', color: C.silver, cursor: 'pointer', fontSize: '13px' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {noteEntries.length === 0
            ? <div style={{ textAlign: 'center', padding: '40px', color: C.silver, fontSize: '14px' }}>📭 {lang === 'ar' ? 'لا توجد ملاحظات' : 'No notes yet'}</div>
            : noteEntries.map(({ lessonId, lessonTitle, text }) => (
              <div key={lessonId} style={{ background: C.navy, borderRadius: '14px', padding: '16px', border: `1px solid ${C.g15}` }}>
                <p style={{ color: C.gold, fontWeight: '700', fontSize: '12px', marginBottom: '8px' }}>📚 {lessonTitle}</p>
                <p style={{ color: C.white, fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{text}</p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── Student Detail Modal ───────────────────────────────────────────────────
function StudentDetailModal({ student, lessons, lang, onClose, onChangeCourse, onDelete }) {
  const totalLessons = lessons.length
  const done = Object.values(student.progress || {}).filter(Boolean).length
  const pct  = totalLessons ? Math.round((done / totalLessons) * 100) : 0
  const cm   = COURSE_OPTIONS.find(c => c.value === student.allowedCourse)
  const noteEntries = Object.entries(student.notes || {}).filter(([, v]) => v?.trim())
  const days = daysSince(student.joinedAt)

  const stat = (icon, label, value, color) => (
    <div style={{ background: C.navy, borderRadius: '14px', padding: '14px', border: `1px solid ${C.g15}`, textAlign: 'center' }}>
      <div style={{ fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '18px', fontWeight: '900', color: color || C.white }}>{value}</div>
      <div style={{ fontSize: '10px', color: C.silver, marginTop: '3px' }}>{label}</div>
    </div>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: '20px', padding: '28px', border: `1px solid ${C.g20}`, width: '100%', maxWidth: '680px', maxHeight: '88vh', overflowY: 'auto', boxShadow: `0 0 60px rgba(201,168,76,0.1)` }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: C.g15, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            {student.photo ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: C.gold, fontSize: '20px', fontWeight: '700' }}>{student.avatar}</span>}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <span style={{ fontWeight: '900', fontSize: '18px', color: C.white }}>{student.name}</span>
              {student.gender && <span style={{ fontSize: '15px' }}>{student.gender === 'female' ? '👩' : '👨'}</span>}
              {pct === 100 && <span style={{ fontSize: '11px', background: C.g10, color: C.gold, padding: '2px 10px', borderRadius: '20px', border: `1px solid ${C.g20}` }}>🏆 {lang === 'ar' ? 'أكمل الدورة' : 'Completed'}</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: C.silver }}>
              <span>@{student.username}</span>
              {student.phone && <span>📞 {student.phone}</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.lk20, border: 'none', borderRadius: '10px', padding: '8px 14px', color: C.silver, cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>✕</button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: C.silver, marginBottom: '6px' }}>
            <span>{lang === 'ar' ? 'التقدم العام' : 'Overall Progress'}</span>
            <span style={{ color: C.gold, fontWeight: '800' }}>{pct}% ({done}/{totalLessons})</span>
          </div>
          <div style={{ height: '8px', background: C.lk30, borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${C.goldD},${C.gold})`, borderRadius: '999px', transition: 'width 0.6s' }} />
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {stat('📚', lang === 'ar' ? 'دروس مكتملة' : 'Lessons Done', `${done}/${totalLessons}`, C.gold)}
          {stat('📅', lang === 'ar' ? 'تاريخ الانضمام' : 'Joined', student.joinedAt || '-')}
          {stat('⏱', lang === 'ar' ? 'منذ الانضمام' : 'Days Since', `${days} ${lang === 'ar' ? 'يوم' : 'd'}`)}
          {stat('📝', lang === 'ar' ? 'ملاحظات' : 'Notes', noteEntries.length, noteEntries.length ? C.gold : C.silver)}
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <select value={student.allowedCourse || ''} onChange={e => onChangeCourse(student.username, e.target.value)} style={{ background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '10px', padding: '9px 12px', color: C.white, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
            {COURSE_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.icon} {lang === 'ar' ? c.labelAr : c.labelEn}</option>)}
          </select>
          {student.phone && (
            <a href={`https://wa.me/${student.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)', color: C.emerald, fontSize: '12px', fontWeight: '700' }}>
              💬 {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
            </a>
          )}
          <button onClick={() => openCertificate(student, lessons, lang)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', background: C.g10, border: `1px solid ${C.g20}`, color: C.gold, fontSize: '12px', fontWeight: '700' }}>
            🏆 {pct === 100 ? (lang === 'ar' ? 'شهادة إتمام' : 'Completion Certificate') : (lang === 'ar' ? 'شهادة مشاركة' : 'Participation Certificate')}
          </button>
          <button onClick={() => { onDelete(student.username, student.name); onClose() }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', color: C.red, fontSize: '12px', fontWeight: '700', marginRight: 'auto' }}>
            🗑 {lang === 'ar' ? 'حذف الطالب' : 'Delete Student'}
          </button>
        </div>

        {/* Lessons progress list */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: C.gold, fontSize: '13px', fontWeight: '800', marginBottom: '10px' }}>📚 {lang === 'ar' ? 'الدروس' : 'Lessons'}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
            {lessons.map(l => {
              const isDone = !!student.progress?.[l.id]
              const score = student.quizScores?.[l.id]
              return (
                <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.navy, borderRadius: '10px', padding: '8px 12px', border: `1px solid ${C.lk20}` }}>
                  <span style={{ fontSize: '14px' }}>{isDone ? '✅' : '⬜'}</span>
                  <span style={{ flex: 1, fontSize: '12px', color: isDone ? C.white : C.silver, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.id}. {l.title}</span>
                  {score != null && <span style={{ fontSize: '11px', color: C.purple, fontWeight: '700' }}>📝 {score}%</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <h4 style={{ color: C.gold, fontSize: '13px', fontWeight: '800', marginBottom: '10px' }}>📝 {lang === 'ar' ? 'ملاحظات الطالب' : 'Student Notes'}</h4>
          {noteEntries.length === 0
            ? <div style={{ textAlign: 'center', padding: '20px', color: C.silver, fontSize: '13px', background: C.navy, borderRadius: '12px' }}>📭 {lang === 'ar' ? 'لا توجد ملاحظات' : 'No notes yet'}</div>
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {noteEntries.map(([lid, text]) => {
                  const lessonTitle = lessons.find(l => String(l.id) === String(lid))?.title || `${lang === 'ar' ? 'درس' : 'Lesson'} ${lid}`
                  return (
                    <div key={lid} style={{ background: C.navy, borderRadius: '12px', padding: '12px 14px', border: `1px solid ${C.g15}` }}>
                      <p style={{ color: C.gold, fontWeight: '700', fontSize: '11px', marginBottom: '6px' }}>📚 {lessonTitle}</p>
                      <p style={{ color: C.white, fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{text}</p>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminPage({ initialStudents, initialLessons, adminUser }) {
  const router = useRouter()
  const { lang, setLang } = useLang()

  const [students,      setStudents]      = useState(initialStudents)
  const [tab,           setTab]           = useState('students')
  const [form,          setForm]          = useState({ name: '', username: '', password: '', allowedCourse: '' })
  const [formMsg,       setFormMsg]       = useState({ type: '', text: '' })
  const [loading,       setLoading]       = useState(false)
  const [refreshing,    setRefreshing]    = useState(false)
  const [notesStudent,  setNotesStudent]  = useState(null)
  const [detailStudent, setDetailStudent] = useState(null)
  const [sidebarOpen,   setSidebarOpen]   = useState(false)
  const [mounted,       setMounted]       = useState(false)

  useEffect(() => setMounted(true), [])

  const refreshStudents = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const r = await fetch('/api/admin/students')
      const d = await r.json()
      setStudents(d.students || [])
    } finally { if (!silent) setRefreshing(false) }
  }, [])

  useEffect(() => {
    const id = setInterval(() => refreshStudents(true), 30_000)
    return () => clearInterval(id)
  }, [refreshStudents])

  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  async function addStudent(e) {
    e.preventDefault()
    if (!form.allowedCourse) { setFormMsg({ type: 'error', text: lang === 'ar' ? 'يرجى اختيار الدورة' : 'Select a course' }); return }
    setLoading(true); setFormMsg({ type: '', text: '' })
    const res = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setFormMsg({ type: 'error', text: data.error }) }
    else { setFormMsg({ type: 'success', text: `✅ ${lang === 'ar' ? `تم إضافة ${form.name}` : `${form.name} added`}` }); setForm({ name: '', username: '', password: '', allowedCourse: '' }); await refreshStudents() }
  }

  async function deleteStudent(username, name) {
    if (!confirm(lang === 'ar' ? `حذف ${name}؟` : `Delete ${name}?`)) return
    const res = await fetch('/api/admin/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
    if (res.ok) setStudents(s => s.filter(x => x.username !== username))
  }

  async function changeStudentCourse(username, allowedCourse) {
    const res = await fetch('/api/admin/students', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, allowedCourse }) })
    if (res.ok) {
      setStudents(s => s.map(x => x.username === username ? { ...x, allowedCourse } : x))
      setDetailStudent(d => d && d.username === username ? { ...d, allowedCourse } : d)
    }
  }

  const totalLessons   = initialLessons.length
  const activeStudents = students.filter(s => Object.values(s.progress || {}).some(Boolean)).length
  const totalNotes     = students.reduce((a, s) => a + Object.keys(s.notes || {}).length, 0)

  const tabs = [
    { key: 'students',  icon: '👥', label: lang==='ar'?'الطلاب':'Students'     },
    { key: 'analytics', icon: '📊', label: lang==='ar'?'التحليلات':'Analytics'  },
    { key: 'lessons',   icon: '📚', label: lang==='ar'?'الدروس':'Lessons'       },
    { key: 'add',       icon: '➕', label: lang==='ar'?'إضافة طالب':'Add Student'},
  ]

  const inputStyle = { width: '100%', background: C.navy, border: `1px solid ${C.lk30}`, borderRadius: '12px', padding: '12px 16px', color: C.white, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

  return (
    <>
      <Head><title>COACHBASHARALASALI — Admin</title><meta name="robots" content="noindex" /></Head>

      {notesStudent && <NotesModal student={notesStudent} lessons={initialLessons} lang={lang} onClose={() => setNotesStudent(null)} />}
      {detailStudent && (
        <StudentDetailModal
          student={detailStudent}
          lessons={initialLessons}
          lang={lang}
          onClose={() => setDetailStudent(null)}
          onChangeCourse={changeStudentCourse}
          onDelete={deleteStudent}
        />
      )}

      <style jsx global>{`
        @media (max-width: 880px) {
          .admin-sidebar {
            position: fixed; inset: 0 auto 0 0; z-index: 300;
            transform: translateX(${lang === 'ar' ? '100%' : '-100%'});
            transition: transform 0.3s;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.navy, display: 'flex' }}>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 299 }} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} style={{
          width: '240px', flexShrink: 0, background: 'rgba(22,33,62,0.95)',
          borderInlineEnd: `1px solid ${C.g15}`, display: 'flex', flexDirection: 'column',
          height: '100vh', position: 'sticky', top: 0, zIndex: 300,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: C.navy, fontWeight: '900', fontSize: '13px' }}>CB</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ color: C.gold, fontWeight: '900', fontSize: '13px', letterSpacing: '0.5px' }}>COACH BASHAR</p>
              <p style={{ color: C.silver, fontSize: '10px' }}>{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</p>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
            {tabs.map(tb => (
              <button key={tb.key} onClick={() => { setTab(tb.key); setSidebarOpen(false) }} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
                borderRadius: '10px', textAlign: lang === 'ar' ? 'right' : 'left', width: '100%',
                color: tab === tb.key ? C.gold : C.silver,
                background: tab === tb.key ? C.g10 : 'transparent',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '16px' }}>{tb.icon}</span><span>{tb.label}</span>
              </button>
            ))}
            <button onClick={refreshStudents} disabled={refreshing} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', marginTop: '8px',
              border: `1px solid ${C.g20}`, cursor: 'pointer', fontSize: '12px', fontWeight: '700',
              borderRadius: '10px', textAlign: lang === 'ar' ? 'right' : 'left', width: '100%',
              color: C.silver, background: 'transparent', opacity: refreshing ? 0.6 : 1,
            }}>
              <span style={{ fontSize: '16px' }}>{refreshing ? '⏳' : '🔄'}</span><span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>

          {/* Admin card + logout */}
          <div style={{ padding: '14px', borderTop: `1px solid ${C.lk20}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: C.g15, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: C.gold, fontWeight: '700', fontSize: '12px' }}>{adminUser.name?.[0]}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: C.white, fontSize: '12px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser.name}</p>
                <p style={{ color: C.gold, fontSize: '10px' }}>{lang === 'ar' ? 'مدير المنصة ✦' : 'Platform Admin ✦'}</p>
              </div>
            </div>
            <button onClick={logout} style={{ width: '100%', background: 'none', border: `1px solid ${C.lk20}`, borderRadius: '8px', color: C.silver, padding: '8px 12px', cursor: 'pointer', fontSize: '12px' }}>🚪 {lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Topbar */}
          <nav style={{ background: 'rgba(22,33,62,0.88)', borderBottom: `1px solid ${C.g15}`, backdropFilter: 'blur(20px)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setSidebarOpen(true)} className="mobile-menu-btn" style={{ display: 'none', background: 'none', border: `1px solid ${C.lk20}`, borderRadius: '8px', color: C.silver, padding: '7px 10px', cursor: 'pointer', fontSize: '15px' }}>☰</button>
              <span style={{ color: C.white, fontWeight: '800', fontSize: '14px' }}>{tabs.find(t => t.key === tab)?.icon} {tabs.find(t => t.key === tab)?.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <NotificationBell students={students} lang={lang} />
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${C.g30}`, background: 'transparent', color: C.gold, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>{lang === 'ar' ? 'EN' : 'AR'}</button>
            </div>
          </nav>

          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px' }}>

          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
            {[
              { icon: '👥', value: students.length,   label: lang==='ar'?'إجمالي الطلاب':'Students', color: C.gold,    bg: C.g10,                      border: C.g20 },
              { icon: '🔥', value: activeStudents,     label: lang==='ar'?'طلاب نشطون':'Active',      color: C.emerald, bg: 'rgba(46,204,113,0.10)',    border: 'rgba(46,204,113,0.20)' },
              { icon: '📚', value: totalLessons,       label: lang==='ar'?'الدروس':'Lessons',          color: C.purple,  bg: 'rgba(183,148,244,0.10)',   border: 'rgba(183,148,244,0.20)' },
              { icon: '📝', value: totalNotes,         label: lang==='ar'?'ملاحظات الطلاب':'Notes',   color: C.silver,  bg: C.lk20,                     border: C.lk30 },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: '16px', padding: '16px', border: `1px solid ${s.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: C.silver, marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── STUDENTS ── */}
          {tab === 'students' && (
            <div>
              {/* Export buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button onClick={() => exportStudentsCSV(students, initialLessons, lang)} disabled={!students.length} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', cursor: students.length ? 'pointer' : 'not-allowed', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.25)', color: C.emerald, fontSize: '12px', fontWeight: '700', opacity: students.length ? 1 : 0.5 }}>
                  📥 {lang === 'ar' ? 'تصدير CSV' : 'Export CSV'}
                </button>
                <button onClick={() => exportStudentsPDF(students, initialLessons, lang)} disabled={!students.length} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '10px', cursor: students.length ? 'pointer' : 'not-allowed', background: C.g10, border: `1px solid ${C.g20}`, color: C.gold, fontSize: '12px', fontWeight: '700', opacity: students.length ? 1 : 0.5 }}>
                  🖨 {lang === 'ar' ? 'تقرير PDF' : 'PDF Report'}
                </button>
              </div>

              {students.length === 0
                ? <div style={{ textAlign: 'center', padding: '48px', color: C.silver }}><div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div><p>{lang === 'ar' ? 'لا يوجد طلاب' : 'No students yet'}</p></div>
                : students.map(student => {
                  const done = Object.values(student.progress || {}).filter(Boolean).length
                  const pct  = totalLessons ? Math.round((done / totalLessons) * 100) : 0
                  const noteCount = Object.keys(student.notes || {}).length
                  const cm = COURSE_OPTIONS.find(c => c.value === student.allowedCourse)
                  return (
                    <div key={student.username} style={{ background: C.surface, borderRadius: '16px', padding: '18px', marginBottom: '12px', border: `1px solid ${C.g15}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: C.g15, border: `2px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          {student.photo ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>{student.avatar}</span>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span onClick={() => setDetailStudent(student)} style={{ fontWeight: '800', fontSize: '15px', color: C.white, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'color .2s' }} onMouseEnter={e => { e.currentTarget.style.color = C.gold; e.currentTarget.style.textDecorationColor = C.gold }} onMouseLeave={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.textDecorationColor = 'transparent' }}>{student.name}</span>
                            {student.gender && <span style={{ fontSize: '14px' }}>{student.gender === 'female' ? '👩' : '👨'}</span>}
                            {cm && <span style={{ fontSize: '11px', background: C.g10, color: C.gold, padding: '2px 10px', borderRadius: '20px', border: `1px solid ${C.g20}` }}>{cm.icon} {lang === 'ar' ? cm.labelAr : cm.labelEn}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: C.silver }}>
                            <span>@{student.username}</span>
                            {student.phone && <span>📞 {student.phone}</span>}
                            <span>📅 {student.joinedAt}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '22px', fontWeight: '900', color: C.gold, lineHeight: 1 }}>{pct}%</div>
                          <div style={{ fontSize: '10px', color: C.silver, marginTop: '2px' }}>{done}/{totalLessons}</div>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: C.lk30, borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${C.goldD},${C.gold})`, borderRadius: '999px', transition: 'width 0.6s' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => setNotesStudent(student)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', background: noteCount > 0 ? C.g10 : C.lk20, border: `1px solid ${noteCount > 0 ? C.g30 : C.lk30}`, color: noteCount > 0 ? C.gold : C.silver, fontSize: '12px', fontWeight: '700' }}>
                          📝 {lang === 'ar' ? 'الملاحظات' : 'Notes'}
                          {noteCount > 0 && <span style={{ background: C.gold, color: C.navy, borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: '900' }}>{noteCount}</span>}
                        </button>
                        <button onClick={() => deleteStudent(student.username, student.name)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)', color: C.red, fontSize: '12px', fontWeight: '700', marginRight: 'auto' }}>
                          🗑 {lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {tab === 'analytics' && <AnalyticsTab students={students} lessons={initialLessons} lang={lang} mounted={mounted} />}

          {/* ── LESSONS ── */}
          {tab === 'lessons' && <LessonsTab lessons={initialLessons} students={students} lang={lang} />}

          {/* ── ADD STUDENT ── */}
          {tab === 'add' && (
            <div style={{ background: C.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${C.g20}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: C.gold, marginBottom: '22px' }}>➕ {lang === 'ar' ? 'إضافة طالب جديد' : 'Add New Student'}</h3>
              {formMsg.text && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', marginBottom: '16px', fontSize: '13px', fontWeight: '600', background: formMsg.type === 'error' ? 'rgba(252,129,129,0.1)' : 'rgba(46,204,113,0.1)', border: `1px solid ${formMsg.type === 'error' ? 'rgba(252,129,129,0.3)' : 'rgba(46,204,113,0.3)'}`, color: formMsg.type === 'error' ? C.red : C.emerald }}>{formMsg.text}</div>
              )}
              <form onSubmit={addStudent}>
                {[[lang==='ar'?'الاسم الكامل':'Full Name','name','text'],[lang==='ar'?'اسم المستخدم (انجليزي)':'Username','username','text'],[lang==='ar'?'كلمة المرور':'Password','password','password']].map(([label,key,type])=>(
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: C.silver, fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>{label}</label>
                    <input type={type} value={form[key]} required onChange={e => setForm({ ...form, [key]: e.target.value })} style={inputStyle} />
                  </div>
                ))}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', color: C.silver, fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>{lang === 'ar' ? 'الدورة المسموح بها' : 'Allowed Course'}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {COURSE_OPTIONS.map(c => (
                      <label key={c.value} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', background: form.allowedCourse === c.value ? C.g10 : C.navy, border: `1px solid ${form.allowedCourse === c.value ? C.g30 : C.lk30}` }}>
                        <input type="radio" name="course" value={c.value} checked={form.allowedCourse === c.value} onChange={e => setForm({ ...form, allowedCourse: e.target.value })} style={{ accentColor: C.gold, width: '16px', height: '16px' }} />
                        <span style={{ fontSize: '22px' }}>{c.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: form.allowedCourse === c.value ? C.gold : C.silver }}>{lang === 'ar' ? c.labelAr : c.labelEn}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: 'none', borderRadius: '14px', color: C.navy, fontSize: '15px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}>
                  {loading ? (lang==='ar'?'⏳ جاري الإضافة...':'⏳ Adding...') : (lang==='ar'?'إضافة الطالب':'Add Student')}
                </button>
              </form>
            </div>
          )}

          </div>
        </div>
      </div>
    </>
  )
}

// ─── getServerSideProps ────────────────────────────────────────────────────
export async function getServerSideProps({ req }) {
  const { parse }           = await import('cookie')
  const { verifyToken }     = await import('../lib/auth')
  const { getUser, getAllUsers } = await import('../lib/users-store')
  const { LESSONS }         = await import('../lib/db')
  const cookies = parse(req.headers.cookie || '')
  const token   = cookies['ba_session']
  if (!token) return { redirect: { destination: '/', permanent: false } }
  const session = verifyToken(token)
  if (!session) return { redirect: { destination: '/', permanent: false } }
  const user = await getUser(session.username)
  if (!user || user.role !== 'admin') return { redirect: { destination: '/', permanent: false } }
  const allUsers  = await getAllUsers()
  const students  = Object.entries(allUsers)
    .filter(([, u]) => u.role === 'student')
    .map(([username, u]) => ({
      username, name: u.name, avatar: u.avatar,
      photo: u.photo || '', gender: u.gender || '', phone: u.phone || '',
      progress: u.progress || {}, quizScores: u.quizScores || {},
      notes: u.notes || {}, allowedCourse: u.allowedCourse || null, joinedAt: u.joinedAt || '',
    }))
  const lessons = LESSONS.map(({ id, title, duration, free }) => ({ id, title, duration, free }))
  return { props: { initialStudents: students, initialLessons: lessons, adminUser: { name: user.name } } }
}
