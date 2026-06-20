import { useState, useEffect, useCallback } from 'react'

// ─── OpenC (Open Calls Pool) — shared between pages/sales.js (role="employee")
// and pages/admin.js (role="admin"). Takes the caller's theme/lang so it never
// needs its own palette or auth context.

const STATUS_META = {
  new:            { ar: 'جديد',          en: 'New',            key: 'silver'  },
  contacted:      { ar: 'تم التواصل',     en: 'Contacted',      key: 'gold'    },
  interested:     { ar: 'مهتم',           en: 'Interested',     key: 'emerald' },
  not_interested: { ar: 'غير مهتم',       en: 'Not Interested', key: 'red'     },
  closed_sale:    { ar: 'تم البيع',       en: 'Closed Sale',    key: 'emerald' },
  cancelled:      { ar: 'ألغى الفكرة',    en: 'Cancelled',      key: 'red'     },
}
function statusLabel(s, lang) {
  const m = STATUS_META[s]
  if (!m) return s || '—'
  return lang === 'ar' ? m.ar : m.en
}
function statusColor(s, C) {
  return { silver: C.silver, gold: C.gold, emerald: C.emerald, red: C.red }[STATUS_META[s]?.key] || C.silver
}
function fmtDate(value, lang) {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function StatBox({ C, value, label, color }) {
  return (
    <div style={{ flex: 1, minWidth: '110px', background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '14px', padding: '14px 16px' }}>
      <p style={{ fontSize: '22px', fontWeight: '900', color, lineHeight: 1, marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '11.5px', color: C.silver, fontWeight: '600' }}>{label}</p>
    </div>
  )
}

export default function OpenCPool({ C, lang, role, currentEmployee, employees }) {
  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState({ openCount: 0, assignedCount: 0, convertedCount: 0 })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [pickEmployee, setPickEmployee] = useState({})
  const [message, setMessage] = useState(null)

  const fetchPool = useCallback(async () => {
    const res = await fetch('/api/openc')
    const data = await res.json()
    setLeads(data.leads || [])
    setStats(data.stats || { openCount: 0, assignedCount: 0, convertedCount: 0 })
    setLoading(false)
  }, [])

  useEffect(() => { fetchPool() }, [fetchPool])

  const visibleLeads = role === 'employee' ? leads.filter(l => l.status === 'open') : leads

  function employeeName(id) {
    if (!id) return null
    const found = (employees || []).find(e => e.id === id)
    return found ? found.name : (lang === 'ar' ? 'موظف آخر' : 'Another employee')
  }

  async function claim(opencLead, employeeId) {
    setBusyId(opencLead.id)
    setMessage(null)
    try {
      const res = await fetch(`/api/openc/${opencLead.id}/claim`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeId ? { employeeId } : {}),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || (lang === 'ar' ? 'حدث خطأ' : 'Something went wrong') })
        await fetchPool()
        return
      }
      setMessage({ type: 'success', text: lang === 'ar' ? `تم سحب "${opencLead.customer_name}" بنجاح` : `"${opencLead.customer_name}" claimed successfully` })
      setPickEmployee(p => { const n = { ...p }; delete n[opencLead.id]; return n })
      await fetchPool()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <h2 style={{ color: C.white, fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>
        {lang === 'ar' ? 'مكالمات مفتوحة (OpenC)' : 'Open Calls Pool (OpenC)'}
      </h2>
      <p style={{ color: C.silver, fontSize: '12.5px', marginBottom: '16px' }}>
        {lang === 'ar'
          ? 'عملاء محتملون تم إرجاعهم — يمكن لأي موظف سحبهم لمتابعتهم من جديد'
          : 'Returned leads — any employee can claim one to follow up again'}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <StatBox C={C} value={stats.openCount} color={C.gold} label={lang === 'ar' ? 'متاح للسحب' : 'Open'} />
        <StatBox C={C} value={stats.assignedCount} color={C.purple} label={lang === 'ar' ? 'تم سحبها' : 'Assigned'} />
        <StatBox C={C} value={stats.convertedCount} color={C.emerald} label={lang === 'ar' ? 'تحولت لمبيعات' : 'Converted'} />
      </div>

      {message && (
        <div style={{
          marginBottom: '14px', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '600',
          background: message.type === 'error' ? 'rgba(240,128,122,0.12)' : C.g10,
          border: `1px solid ${message.type === 'error' ? C.red : C.g20}`,
          color: message.type === 'error' ? C.red : C.gold,
        }}>{message.text}</div>
      )}

      {loading ? (
        <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      ) : visibleLeads.length === 0 ? (
        <p style={{ color: C.silver, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>{lang === 'ar' ? 'لا يوجد عملاء محتملون في المجمع حالياً' : 'No leads in the pool right now'}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleLeads.map(lead => {
            const isAssigned = lead.status === 'assigned'
            return (
              <div key={lead.id} style={{
                background: C.surface, borderRadius: '14px', border: `1px solid ${C.g20}`,
                padding: '14px 16px', opacity: isAssigned ? 0.55 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: C.white, fontSize: '14px', fontWeight: '700' }}>{lead.customer_name}</span>
                      <span style={{
                        fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
                        color: statusColor(lead.last_status, C), background: C.g10, border: `1px solid ${C.g20}`,
                      }}>{statusLabel(lead.last_status, lang)}</span>
                    </div>
                    <p style={{ color: C.silver, fontSize: '12px', marginTop: '3px' }}>{lead.phone}</p>
                    {lead.reason && (
                      <p style={{ color: C.white, fontSize: '12.5px', marginTop: '8px', lineHeight: '1.6', background: C.navy, borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ color: C.silver, fontWeight: '700' }}>{lang === 'ar' ? 'سبب الإرجاع: ' : 'Return reason: '}</span>{lead.reason}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11.5px', color: C.silver, marginTop: '8px', flexWrap: 'wrap' }}>
                      <span>{lang === 'ar' ? 'آخر تواصل:' : 'Last contact:'} <b style={{ color: C.white }}>{fmtDate(lead.last_contact_date, lang)}</b></span>
                      <span>{lang === 'ar' ? 'تاريخ الإرجاع:' : 'Returned:'} <b style={{ color: C.white }}>{fmtDate(lead.returned_at, lang)}</b></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    {isAssigned ? (
                      <span style={{ fontSize: '11.5px', color: C.silver, fontWeight: '600' }}>
                        {lang === 'ar' ? 'تم السحب بواسطة ' : 'Claimed by '}
                        <b style={{ color: C.white }}>{employeeName(lead.claimed_by_employee_id) || '—'}</b>
                      </span>
                    ) : role === 'employee' ? (
                      <button onClick={() => claim(lead, null)} disabled={busyId === lead.id} style={{
                        padding: '8px 18px', borderRadius: '10px', border: 'none',
                        background: C.gold, color: C.navy, fontSize: '12.5px', fontWeight: '800',
                        cursor: busyId === lead.id ? 'not-allowed' : 'pointer', opacity: busyId === lead.id ? 0.6 : 1,
                      }}>{busyId === lead.id ? (lang === 'ar' ? 'جارٍ السحب...' : 'Claiming...') : (lang === 'ar' ? 'اسحب لنفسي' : 'Claim for me')}</button>
                    ) : (
                      <>
                        <select
                          value={pickEmployee[lead.id] || ''}
                          onChange={e => setPickEmployee(p => ({ ...p, [lead.id]: e.target.value }))}
                          style={{ background: C.navy, border: `1px solid ${C.g20}`, borderRadius: '8px', padding: '8px 10px', color: C.white, fontSize: '12px', outline: 'none' }}
                        >
                          <option value="">{lang === 'ar' ? 'اختر موظفاً' : 'Select employee'}</option>
                          {(employees || []).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <button
                          onClick={() => pickEmployee[lead.id] && claim(lead, pickEmployee[lead.id])}
                          disabled={busyId === lead.id || !pickEmployee[lead.id]}
                          style={{
                            padding: '8px 16px', borderRadius: '10px', border: 'none',
                            background: C.gold, color: C.navy, fontSize: '12.5px', fontWeight: '800',
                            cursor: (busyId === lead.id || !pickEmployee[lead.id]) ? 'not-allowed' : 'pointer',
                            opacity: (busyId === lead.id || !pickEmployee[lead.id]) ? 0.5 : 1,
                          }}
                        >{busyId === lead.id ? (lang === 'ar' ? 'جارٍ التعيين...' : 'Assigning...') : (lang === 'ar' ? 'تعيين' : 'Assign')}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
