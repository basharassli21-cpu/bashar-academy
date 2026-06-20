import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang, useTheme } from './_app'
import OpenCPool from '../components/OpenCPool'

// ─── Brand Color Palettes — Forest Green (same as dashboard.js) ──────────
const C_DARK = {
  navy:    '#0A0F0A',
  gold:    '#4ADE80',
  goldL:   '#7AE89F',
  goldD:   '#22A35A',
  blue:    '#0F2F0F',
  surface: '#0D1A0D',
  emerald: '#34D399',
  silver:  '#8AAB8A',
  locked:  '#2A3A2A',
  white:   '#E8F0E8',
  red:     '#F0807A',
  purple:  '#A78BFA',
  g10: 'rgba(74,222,128,0.08)', g15: 'rgba(74,222,128,0.12)',
  g20: 'rgba(74,222,128,0.16)', g30: 'rgba(74,222,128,0.26)',
  w10: 'rgba(232,240,232,0.10)', w20: 'rgba(232,240,232,0.20)',
  w40: 'rgba(232,240,232,0.40)', w50: 'rgba(232,240,232,0.50)',
  lk30: 'rgba(42,58,42,0.45)',
}
const C_LIGHT = {
  navy:    '#F2F7F0',
  gold:    '#1C8A4D',
  goldL:   '#239B5A',
  goldD:   '#146238',
  blue:    '#E8F2E6',
  surface: '#FFFFFF',
  emerald: '#0F9D6E',
  silver:  '#5B6B5B',
  locked:  '#D7DED5',
  white:   '#142016',
  red:     '#C0463F',
  purple:  '#7C5FD1',
  g10: 'rgba(28,138,77,0.06)', g15: 'rgba(28,138,77,0.10)',
  g20: 'rgba(28,138,77,0.12)', g30: 'rgba(28,138,77,0.22)',
  w10: 'rgba(20,32,22,0.06)',  w20: 'rgba(20,32,22,0.12)',
  w40: 'rgba(20,32,22,0.25)',  w50: 'rgba(20,32,22,0.35)',
  lk30: 'rgba(190,200,188,0.5)',
}
let C = C_DARK

const STATUS_ORDER = ['new', 'contacted', 'interested', 'not_interested', 'closed_sale', 'cancelled']
const STATUS_META = {
  new:            { ar: 'جديد',          en: 'New',            key: 'silver'  },
  contacted:      { ar: 'تم التواصل',     en: 'Contacted',      key: 'gold'    },
  interested:     { ar: 'مهتم',           en: 'Interested',     key: 'emerald' },
  not_interested: { ar: 'غير مهتم',       en: 'Not Interested', key: 'red'     },
  closed_sale:    { ar: 'تم البيع',       en: 'Closed Sale',    key: 'emerald' },
  cancelled:      { ar: 'ألغى الفكرة',    en: 'Cancelled',      key: 'red'     },
}
function statusColor(statusKey) {
  return { silver: C.silver, gold: C.gold, emerald: C.emerald, red: C.red }[STATUS_META[statusKey]?.key] || C.silver
}
function statusLabel(statusKey, lang) {
  const m = STATUS_META[statusKey]
  if (!m) return statusKey
  return lang === 'ar' ? m.ar : m.en
}
function fmtDate(dateStr, lang) {
  if (!dateStr) return lang === 'ar' ? '—' : '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function todayISO() {
  return new Date().toISOString().split('T')[0]
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ user, view, setView, onLogout, lang, collapsed, onToggleCollapse }) {
  const navItems = [
    { icon: '📊', label: lang === 'ar' ? 'لوحة التحكم'          : 'Dashboard', id: 'dashboard' },
    { icon: '🎯', label: lang === 'ar' ? 'العملاء المحتملون'    : 'Leads',     id: 'leads'     },
    { icon: '♻️', label: lang === 'ar' ? 'OpenC'                : 'OpenC',     id: 'openc'     },
  ]
  return (
    <aside style={{
      position: 'fixed', right: 0, top: 0, height: '100%', width: collapsed ? '72px' : '240px',
      background: C.surface, borderLeft: `1px solid ${C.g20}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      zIndex: 40, boxShadow: '-4px 0 30px rgba(0,0,0,0.5)',
      transition: 'width 0.2s', overflow: 'hidden',
    }}>
      <div>
        <div style={{ padding: collapsed ? '20px 0 16px' : '20px 20px 16px', borderBottom: `1px solid ${C.g20}`, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${C.gold}`, background: `radial-gradient(circle at 30% 30%, ${C.g20}, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: C.gold, fontWeight: '700', fontSize: '18px', fontFamily: "'El Messiri',serif" }}>ب</span>
            </div>
            {!collapsed && (
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <p style={{ color: C.gold, fontWeight: '900', fontSize: '12px', letterSpacing: '0.5px', marginBottom: '2px', whiteSpace: 'nowrap' }}>{lang === 'ar' ? 'بشار العسلي' : 'Bashar Al-Asali'}</p>
                <p style={{ color: C.silver, fontSize: '11px', whiteSpace: 'nowrap' }}>{lang === 'ar' ? 'فريق المبيعات' : 'SALES TEAM'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={onToggleCollapse} title={lang === 'ar' ? 'تصغير القائمة' : 'Collapse menu'} style={{
              flexShrink: 0, width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: `1px solid ${C.g20}`, borderRadius: '7px', color: C.silver, cursor: 'pointer', fontSize: '13px',
            }}>☰</button>
          )}
        </div>

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <button onClick={onToggleCollapse} title={lang === 'ar' ? 'توسيع القائمة' : 'Expand menu'} style={{
              width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: `1px solid ${C.g20}`, borderRadius: '7px', color: C.silver, cursor: 'pointer', fontSize: '13px',
            }}>☰</button>
          </div>
        )}

        <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const isActive = view === item.id
            return (
              <button key={i} onClick={() => setView(item.id)} title={collapsed ? item.label : undefined} style={{
                display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '12px', padding: collapsed ? '10px' : '10px 14px', borderRadius: '12px',
                cursor: 'pointer', width: '100%', textAlign: 'right',
                background: isActive ? C.g20 : 'transparent',
                border: `1px solid ${isActive ? C.g30 : 'transparent'}`,
                color: isActive ? C.gold : C.silver,
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!collapsed && isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.gold, flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>
      </div>

      <div style={{ padding: collapsed ? '12px 8px 16px' : '12px 12px 16px', borderTop: `1px solid ${C.g20}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: collapsed ? '8px 0' : '8px 10px', marginBottom: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.g20, border: `1px solid ${C.g30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: C.gold, fontSize: '12px', fontWeight: '700' }}>{user.avatar}</span>
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.white, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</p>
              <p style={{ color: C.silver, fontSize: '11px' }}>{lang === 'ar' ? 'موظف مبيعات' : 'Sales Employee'}</p>
            </div>
          )}
        </div>
        <button onClick={onLogout} title={collapsed ? (lang === 'ar' ? 'تسجيل الخروج' : 'Logout') : undefined} style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '10px', padding: collapsed ? '9px' : '9px 14px',
          borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.red, fontSize: '13px', fontWeight: '600',
        }}>
          <span>🚪</span>
          {!collapsed && <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>}
        </button>
      </div>
    </aside>
  )
}

// ─── Dashboard View ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: C.surface, borderRadius: '16px', padding: '18px', border: `1px solid ${C.g20}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
      </div>
      <p style={{ fontSize: '26px', fontWeight: '900', color, lineHeight: 1, marginBottom: '6px' }}>{value}</p>
      <p style={{ fontSize: '12px', color: C.silver, fontWeight: '600' }}>{label}</p>
    </div>
  )
}

function DashboardView({ user, lang, stats, opencStats, loading }) {
  const dateStr = new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  return (
    <div>
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '20px',
        background: `linear-gradient(135deg, ${C.blue} 0%, ${C.surface} 50%, ${C.navy} 100%)`,
        border: `1px solid ${C.g20}`, padding: '28px 32px', marginBottom: '28px',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', color: C.white, marginBottom: '6px' }}>
          {lang === 'ar' ? 'أهلاً، ' : 'Welcome, '}<span style={{ color: C.gold }}>{user.name.split(' ')[0]}</span>
        </h1>
        <p style={{ color: C.silver, fontSize: '13px' }}>{dateStr}</p>
      </div>

      {loading ? (
        <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : (
        <>
          <div className="sales-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
            <StatCard icon="💰" color={C.emerald} label={lang === 'ar' ? 'المبيعات المغلقة (هذا الشهر)' : 'Closed Sales (this month)'} value={stats.closedSales} />
            <StatCard icon="📞" color={C.gold}    label={lang === 'ar' ? 'عدد المكالمات (هذا الشهر)' : 'Calls Made (this month)'} value={stats.totalCalls} />
            <StatCard icon="🎯" color={C.purple}  label={lang === 'ar' ? 'التارجت الشهري' : 'Monthly Target'} value={stats.monthlyTarget} />
            <StatCard icon="📈" color={stats.targetProgress >= 100 ? C.emerald : C.gold} label={lang === 'ar' ? 'نسبة تحقيق التارجت' : 'Target Progress'} value={`${stats.targetProgress}%`} />
          </div>

          <div className="sales-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginTop: '16px' }}>
            <StatCard icon="♻️" color={C.gold}    label={lang === 'ar' ? 'متاح في OpenC' : 'Available in OpenC'} value={opencStats.openCount} />
            <StatCard icon="📥" color={C.purple}  label={lang === 'ar' ? 'سحبتها من OpenC' : 'Claimed from OpenC'} value={opencStats.claimedByMeCount} />
            <StatCard icon="✅" color={C.emerald} label={lang === 'ar' ? 'تحولت لمبيعات' : 'Converted to sales'} value={opencStats.convertedByMeCount} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── Leads View ──────────────────────────────────────────────────────────
function LeadCard({ lead, position, lang, expanded, onExpand, onSave, busy, onReturnToOpenC, returning }) {
  const [status, setStatus] = useState(lead.status)
  const [note, setNote] = useState('')
  const [lastContact, setLastContact] = useState(lead.last_contact_date || todayISO())
  const [nextFollowup, setNextFollowup] = useState(lead.next_followup_date || '')
  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  useEffect(() => {
    setStatus(lead.status)
    setLastContact(lead.last_contact_date || todayISO())
    setNextFollowup(lead.next_followup_date || '')
    setNote('')
    setShowReturnForm(false)
    setReturnReason('')
  }, [lead.id, lead.status, lead.last_contact_date, lead.next_followup_date])

  const isCurrent = !lead.locked && !lead.isHandled

  function handleSave() {
    onSave(lead.id, { status, note, lastContactDate: lastContact, nextFollowupDate: nextFollowup })
  }

  function handleReturn() {
    if (!returnReason.trim()) return
    onReturnToOpenC(lead.id, returnReason.trim())
  }

  return (
    <div style={{
      background: C.surface, borderRadius: '14px', border: `1px solid ${isCurrent ? C.gold : C.g20}`,
      opacity: lead.locked ? 0.5 : 1, overflow: 'hidden', transition: 'opacity 0.2s',
    }}>
      <div
        onClick={() => !lead.locked && onExpand(expanded ? null : lead.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px',
          cursor: lead.locked ? 'not-allowed' : 'pointer',
        }}
      >
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: C.g15, border: `1px solid ${C.g20}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '12px', fontWeight: '800', color: C.gold }}>
          {lead.locked ? '🔒' : position}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: C.white, fontSize: '14px', fontWeight: '700' }}>{lead.customer_name}</span>
            {isCurrent && (
              <span style={{ fontSize: '10px', background: C.g15, color: C.gold, padding: '1px 7px', borderRadius: '5px', fontWeight: '700' }}>
                {lang === 'ar' ? 'الحالي' : 'Current'}
              </span>
            )}
          </div>
          <p style={{ color: C.silver, fontSize: '12px', marginTop: '2px' }}>{lead.phone}</p>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '7px', flexShrink: 0,
          color: statusColor(lead.status), background: C.g10, border: `1px solid ${C.g20}`, whiteSpace: 'nowrap',
        }}>
          {statusLabel(lead.status, lang)}
        </span>
        {!lead.locked && (
          <span style={{ color: C.silver, fontSize: '12px', transform: expanded ? 'rotate(180deg)' : 'none', display: 'inline-block', flexShrink: 0 }}>▾</span>
        )}
      </div>

      {expanded && !lead.locked && (
        <div style={{ padding: '0 16px 18px', borderTop: `1px solid ${C.g20}` }}>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: C.silver, margin: '14px 0', flexWrap: 'wrap' }}>
            <span>{lang === 'ar' ? 'آخر تواصل:' : 'Last contact:'} <b style={{ color: C.white }}>{fmtDate(lead.last_contact_date, lang)}</b></span>
            <span>{lang === 'ar' ? 'المتابعة القادمة:' : 'Next follow-up:'} <b style={{ color: C.white }}>{fmtDate(lead.next_followup_date, lang)}</b></span>
          </div>

          {lead.notes?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              {lead.notes.map(n => (
                <div key={n.id} style={{ background: C.navy, borderRadius: '8px', padding: '8px 12px' }}>
                  <p style={{ color: C.white, fontSize: '12.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{n.text}</p>
                  <p style={{ color: C.silver, fontSize: '10.5px', marginTop: '4px' }}>{fmtDate(n.created_at, lang)}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'الحالة' : 'Status'}</span>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{
                background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '8px 10px',
                color: C.white, fontSize: '12.5px', outline: 'none',
              }}>
                {STATUS_ORDER.map(s => <option key={s} value={s}>{statusLabel(s, lang)}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '11px', color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'تاريخ آخر تواصل' : 'Last Contact Date'}</span>
              <input type="date" value={lastContact} onChange={e => setLastContact(e.target.value)} style={{
                background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '8px 10px',
                color: C.white, fontSize: '12.5px', outline: 'none', colorScheme: 'dark',
              }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
              <span style={{ fontSize: '11px', color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'تاريخ المتابعة القادمة' : 'Next Follow-up Date'}</span>
              <input type="date" value={nextFollowup} onChange={e => setNextFollowup(e.target.value)} style={{
                background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '8px 10px',
                color: C.white, fontSize: '12.5px', outline: 'none', colorScheme: 'dark',
              }} />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'ملاحظة جديدة (ماذا تم الحديث / نتيجة المكالمة)' : 'New note (what was discussed / call outcome)'}</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder={lang === 'ar' ? 'اكتب ملاحظتك هنا...' : 'Write your note here...'} style={{
              background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '10px 12px',
              color: C.white, fontSize: '12.5px', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
            }} />
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleSave} disabled={busy} style={{
              padding: '9px 22px', borderRadius: '10px', border: 'none',
              background: C.gold, color: C.navy, fontSize: '13px', fontWeight: '800',
              cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1,
            }}>
              {busy ? (lang === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ التحديث' : 'Save Update')}
            </button>
            <button onClick={() => setShowReturnForm(s => !s)} style={{
              padding: '9px 16px', borderRadius: '10px', border: `1px solid ${C.red}`,
              background: 'transparent', color: C.red, fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
            }}>
              ♻️ {lang === 'ar' ? 'إرجاع لـ OpenC' : 'Return to OpenC'}
            </button>
          </div>

          {showReturnForm && (
            <div style={{ marginTop: '12px', padding: '12px', background: C.navy, borderRadius: '10px', border: `1px solid ${C.g20}` }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'سبب الإرجاع' : 'Return reason'}</span>
                <textarea value={returnReason} onChange={e => setReturnReason(e.target.value)} rows={2} placeholder={lang === 'ar' ? 'لماذا تتم إعادة هذا العميل لـ OpenC؟' : 'Why is this lead going back to OpenC?'} style={{
                  background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '8px 10px',
                  color: C.white, fontSize: '12.5px', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                }} />
              </label>
              <button onClick={handleReturn} disabled={returning || !returnReason.trim()} style={{
                padding: '8px 18px', borderRadius: '9px', border: 'none',
                background: C.red, color: '#fff', fontSize: '12.5px', fontWeight: '800',
                cursor: (returning || !returnReason.trim()) ? 'not-allowed' : 'pointer', opacity: (returning || !returnReason.trim()) ? 0.6 : 1,
              }}>
                {returning ? (lang === 'ar' ? 'جارٍ الإرجاع...' : 'Returning...') : (lang === 'ar' ? 'تأكيد الإرجاع' : 'Confirm Return')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LeadsView({ lang }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [returningId, setReturningId] = useState(null)

  async function fetchLeads(autoExpand) {
    const res = await fetch('/api/sales/leads')
    const data = await res.json()
    const list = data.leads || []
    setLeads(list)
    setLoading(false)
    if (autoExpand) {
      const frontier = list.find(l => !l.locked && !l.isHandled)
      if (frontier) setExpandedId(frontier.id)
    }
  }

  useEffect(() => { fetchLeads(true) }, [])

  async function handleSave(id, payload) {
    setBusyId(id)
    await fetch(`/api/sales/leads/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    await fetchLeads(true)
    setBusyId(null)
  }

  async function handleReturnToOpenC(id, reason) {
    setReturningId(id)
    await fetch(`/api/sales/leads/${id}/return-to-openc`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }),
    })
    await fetchLeads(true)
    setReturningId(null)
  }

  return (
    <div>
      <h2 style={{ color: C.white, fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>
        {lang === 'ar' ? 'العملاء المحتملون' : 'Leads'}
      </h2>
      {loading ? (
        <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : leads.length === 0 ? (
        <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'لا يوجد عملاء محتملون مخصصون لك بعد' : 'No leads assigned to you yet'}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {leads.map((lead, i) => (
            <LeadCard
              key={lead.id} lead={lead} position={i + 1} lang={lang}
              expanded={expandedId === lead.id}
              onExpand={setExpandedId}
              onSave={handleSave}
              busy={busyId === lead.id}
              onReturnToOpenC={handleReturnToOpenC}
              returning={returningId === lead.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────
export default function SalesPage({ initialUser }) {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  C = theme === 'light' ? C_LIGHT : C_DARK

  const [user] = useState(initialUser)
  const [view, setView] = useState('dashboard')
  const [stats, setStats] = useState({ closedSales: 0, totalCalls: 0, monthlyTarget: 0, targetProgress: 0 })
  const [opencStats, setOpencStats] = useState({ openCount: 0, claimedByMeCount: 0, convertedByMeCount: 0 })
  const [statsLoading, setStatsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopCollapsed, setDesktopCollapsed] = useState(false)

  useEffect(() => {
    fetch('/api/sales/dashboard').then(r => r.json()).then(d => {
      setStats(d.stats || stats)
      setOpencStats(d.opencStats || opencStats)
      setStatsLoading(false)
    }).catch(() => setStatsLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>{lang === 'ar' ? 'لوحة المبيعات — بشار العسلي' : 'Sales Dashboard — Bashar Al-Asali'}</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 5px; height: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.28); border-radius: 999px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(74,222,128,0.48) }
        @media (max-width: 720px) {
          .sales-sidebar { transform: translateX(100%); transition: transform 0.3s; }
          .sales-sidebar.open { transform: translateX(0); }
          .sales-sidebar > aside { width: 240px !important; }
          .sales-main { margin-right: 0 !important; }
          .sales-hamburger { display: flex !important; }
          .sales-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .sales-content-pad { padding: 16px 14px 32px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.navy }}>
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 39 }} />
        )}

        <div className={`sales-sidebar${sidebarOpen ? ' open' : ''}`} style={{ position: 'fixed', right: 0, top: 0, height: '100%', zIndex: 40 }}>
          <Sidebar
            user={user} view={view}
            setView={(v) => { setView(v); setSidebarOpen(false); setDesktopCollapsed(true) }}
            onLogout={logout} lang={lang}
            collapsed={desktopCollapsed} onToggleCollapse={() => setDesktopCollapsed(c => !c)}
          />
        </div>

        <div className="sales-main" style={{ marginRight: desktopCollapsed ? '72px' : '240px', minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'margin-right 0.2s' }}>
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: theme === 'light' ? 'rgba(242,247,240,0.93)' : 'rgba(10,15,10,0.85)', backdropFilter: 'blur(16px)',
            borderBottom: `1px solid rgba(74,222,128,0.1)`,
            padding: '0 20px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.silver }}>
              <button className="sales-hamburger" onClick={() => setSidebarOpen(o => !o)} style={{ display: 'none', background: 'none', border: `1px solid ${C.lk30}`, borderRadius: '8px', color: C.gold, padding: '6px 10px', cursor: 'pointer', fontSize: '16px', marginLeft: '6px' }}>☰</button>
              <span style={{ color: C.gold, fontWeight: '700' }}>{view === 'dashboard' ? (lang === 'ar' ? 'لوحة التحكم' : 'Dashboard') : view === 'leads' ? (lang === 'ar' ? 'العملاء المحتملون' : 'Leads') : 'OpenC'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{
                padding: '5px 10px', borderRadius: '8px', border: `1px solid ${C.g30}`,
                background: 'transparent', fontSize: '15px', cursor: 'pointer', lineHeight: 1,
              }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
                padding: '5px 12px', borderRadius: '8px', border: `1px solid ${C.g30}`,
                background: 'transparent', color: C.gold, fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              }}>{lang === 'ar' ? 'EN' : 'AR'}</button>
            </div>
          </header>

          <div className="sales-content-pad" style={{ padding: '28px 32px', flex: 1 }}>
            {view === 'dashboard'
              ? <DashboardView user={user} lang={lang} stats={stats} opencStats={opencStats} loading={statsLoading} />
              : view === 'leads'
              ? <LeadsView lang={lang} />
              : <OpenCPool C={C} lang={lang} role="employee" currentEmployee={user} />}
          </div>
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getEmployeeByUsername, employeeAvatar } = await import('../lib/sales-db')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['ba_session']
  if (!token) return { redirect: { destination: '/', permanent: false } }
  const session = verifyToken(token)
  if (!session || session.role !== 'employee') {
    if (session?.role === 'admin') return { redirect: { destination: '/admin', permanent: false } }
    if (session?.role === 'student') return { redirect: { destination: '/dashboard', permanent: false } }
    return { redirect: { destination: '/', permanent: false } }
  }
  const employee = await getEmployeeByUsername(session.username)
  if (!employee) return { redirect: { destination: '/', permanent: false } }
  return {
    props: {
      initialUser: {
        username: employee.username, name: employee.name, avatar: employeeAvatar(employee.name),
      },
    },
  }
}
