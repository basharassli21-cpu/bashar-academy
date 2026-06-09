import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang } from './_app'
import { t } from '../lib/i18n'

// ─── Brand Colors (same as dashboard) ─────────────────────────────────────
const C = {
  navy:    '#0D0D1A',
  gold:    '#C9A84C',
  goldL:   '#E8C96A',
  goldD:   '#A67C32',
  blue:    '#1E3A5F',
  surface: '#16213E',
  emerald: '#2ECC71',
  silver:  '#A0AEC0',
  locked:  '#4A5568',
  white:   '#F0EAF5',
  red:     '#FC8181',
  purple:  '#B794F4',
  g10: 'rgba(201,168,76,0.10)', g15: 'rgba(201,168,76,0.15)',
  g20: 'rgba(201,168,76,0.20)', g30: 'rgba(201,168,76,0.30)',
  w10: 'rgba(240,234,245,0.10)', w20: 'rgba(240,234,245,0.20)',
  w40: 'rgba(240,234,245,0.40)', w50: 'rgba(240,234,245,0.50)',
  lk20: 'rgba(74,85,104,0.20)', lk30: 'rgba(74,85,104,0.30)',
}

const COURSE_OPTIONS = [
  { value: 'comprehensive', labelAr: 'الدورة الشاملة',  labelEn: 'Comprehensive', icon: '🏆' },
  { value: 'intermediate',  labelAr: 'الدورة المتوسطة', labelEn: 'Intermediate',  icon: '📈' },
  { value: 'basic',         labelAr: 'الدورة الأساسية', labelEn: 'Basic',         icon: '🌱' },
]

// ─── Student Notes Modal ───────────────────────────────────────────────────
function NotesModal({ student, lessons, lang, onClose }) {
  const noteEntries = Object.entries(student.notes || {})
    .filter(([, v]) => v && v.trim())
    .map(([lid, text]) => {
      const lesson = lessons.find(l => String(l.id) === String(lid))
      return { lessonId: lid, lessonTitle: lesson ? lesson.title : `درس ${lid}`, text }
    })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surface, borderRadius: '20px', padding: '28px',
        border: `1px solid ${C.g20}`, width: '100%', maxWidth: '600px',
        maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: `0 0 60px rgba(201,168,76,0.1)`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: C.g15, border: `2px solid ${C.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
            }}>
              {student.photo
                ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: C.gold, fontSize: '13px', fontWeight: '700' }}>{student.avatar}</span>
              }
            </div>
            <div>
              <p style={{ color: C.white, fontWeight: '800', fontSize: '15px' }}>{student.name}</p>
              <p style={{ color: C.silver, fontSize: '12px' }}>📝 {lang === 'ar' ? `${noteEntries.length} ملاحظة` : `${noteEntries.length} notes`}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: C.lk20, border: 'none', borderRadius: '10px', padding: '8px 14px', color: C.silver, cursor: 'pointer', fontSize: '13px' }}>
            ✕ {lang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

        {/* Notes list */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {noteEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: C.silver, fontSize: '14px' }}>
              📭 {lang === 'ar' ? 'لا توجد ملاحظات بعد' : 'No notes yet'}
            </div>
          ) : noteEntries.map(({ lessonId, lessonTitle, text }) => (
            <div key={lessonId} style={{ background: C.navy, borderRadius: '14px', padding: '16px', border: `1px solid ${C.g15}` }}>
              <p style={{ color: C.gold, fontWeight: '700', fontSize: '12px', marginBottom: '8px' }}>
                📚 {lessonTitle}
              </p>
              <p style={{ color: C.white, fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Admin Page ───────────────────────────────────────────────────────
export default function AdminPage({ initialStudents, initialLessons, adminUser }) {
  const router  = useRouter()
  const { lang, setLang } = useLang()

  const [students,    setStudents]    = useState(initialStudents)
  const [tab,         setTab]         = useState('students')
  const [form,        setForm]        = useState({ name: '', username: '', password: '', allowedCourse: '' })
  const [formMsg,     setFormMsg]     = useState({ type: '', text: '' })
  const [loading,     setLoading]     = useState(false)
  const [refreshing,  setRefreshing]  = useState(false)
  const [notesStudent, setNotesStudent] = useState(null)   // student whose notes to show

  // ── Live refresh ──────────────────────────────────────────────────────
  const refreshStudents = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const r = await fetch('/api/admin/students')
      const d = await r.json()
      setStudents(d.students || [])
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [])

  // Auto-refresh every 30s while tab is active
  useEffect(() => {
    const id = setInterval(() => refreshStudents(true), 30_000)
    return () => clearInterval(id)
  }, [refreshStudents])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  async function addStudent(e) {
    e.preventDefault()
    if (!form.allowedCourse) {
      setFormMsg({ type: 'error', text: lang === 'ar' ? 'يرجى اختيار الدورة' : 'Please select a course' })
      return
    }
    setLoading(true); setFormMsg({ type: '', text: '' })
    const res  = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setFormMsg({ type: 'error', text: data.error })
    } else {
      setFormMsg({ type: 'success', text: lang === 'ar' ? `✅ تم إضافة ${form.name} بنجاح` : `✅ ${form.name} added` })
      setForm({ name: '', username: '', password: '', allowedCourse: '' })
      await refreshStudents()
    }
  }

  async function deleteStudent(username, name) {
    if (!confirm(lang === 'ar' ? `هل تريد حذف ${name}؟` : `Delete ${name}?`)) return
    const res = await fetch('/api/admin/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) })
    if (res.ok) setStudents(s => s.filter(x => x.username !== username))
  }

  function getCourseLabel(id) {
    const c = COURSE_OPTIONS.find(x => x.value === id)
    return c ? (lang === 'ar' ? c.labelAr : c.labelEn) : '—'
  }

  const totalLessons   = initialLessons.length
  const activeStudents = students.filter(s => Object.values(s.progress || {}).some(Boolean)).length
  const totalNotes     = students.reduce((acc, s) => acc + Object.keys(s.notes || {}).length, 0)

  const tabs = [
    { key: 'students', icon: '👥', label: lang === 'ar' ? 'الطلاب'  : 'Students' },
    { key: 'lessons',  icon: '📚', label: lang === 'ar' ? 'الدروس'  : 'Lessons'  },
    { key: 'add',      icon: '➕', label: lang === 'ar' ? 'إضافة طالب' : 'Add Student' },
  ]

  const inputStyle = {
    width: '100%', background: C.navy, border: `1px solid ${C.lk30}`,
    borderRadius: '12px', padding: '12px 16px', color: C.white,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <>
      <Head><title>COACHBASHARALASALI — Admin</title><meta name="robots" content="noindex" /></Head>

      {notesStudent && (
        <NotesModal student={notesStudent} lessons={initialLessons} lang={lang} onClose={() => setNotesStudent(null)} />
      )}

      <div style={{ minHeight: '100vh', background: C.navy }}>

        {/* ── Nav ── */}
        <nav style={{
          background: 'rgba(22,33,62,0.85)', borderBottom: `1px solid ${C.g15}`,
          backdropFilter: 'blur(20px)', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '60px', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: C.navy, fontWeight: '900', fontSize: '12px' }}>CB</span>
            </div>
            <div>
              <p style={{ color: C.gold, fontWeight: '900', fontSize: '13px', letterSpacing: '0.5px' }}>COACH BASHAR</p>
              <p style={{ color: C.silver, fontSize: '10px' }}>{lang === 'ar' ? 'لوحة الإدارة' : 'Admin Panel'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '5px 12px', borderRadius: '8px', border: `1px solid ${C.g30}`, background: 'transparent', color: C.gold, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
              {lang === 'ar' ? 'EN' : 'AR'}
            </button>
            <span style={{ color: C.silver, fontSize: '13px' }}>{adminUser.name}</span>
            <button onClick={logout} style={{ background: 'none', border: `1px solid ${C.lk20}`, borderRadius: '8px', color: C.silver, padding: '5px 12px', cursor: 'pointer', fontSize: '12px' }}>
              🚪 {lang === 'ar' ? 'خروج' : 'Logout'}
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 20px' }}>

          {/* ── Stats ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '28px' }}>
            {[
              { icon: '👥', value: students.length,   label: lang==='ar'?'إجمالي الطلاب':'Total Students', color: C.gold,    bg: C.g10,                      border: C.g20 },
              { icon: '🔥', value: activeStudents,     label: lang==='ar'?'طلاب نشطون':'Active Students',   color: C.emerald, bg: 'rgba(46,204,113,0.10)',    border: 'rgba(46,204,113,0.20)' },
              { icon: '📚', value: totalLessons,       label: lang==='ar'?'إجمالي الدروس':'Total Lessons',  color: C.purple,  bg: 'rgba(183,148,244,0.10)',   border: 'rgba(183,148,244,0.20)' },
              { icon: '📝', value: totalNotes,         label: lang==='ar'?'ملاحظات الطلاب':'Student Notes', color: C.silver,  bg: 'rgba(160,174,192,0.10)',   border: 'rgba(160,174,192,0.20)' },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: '16px', padding: '16px', border: `1px solid ${s.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: C.silver, marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: 'flex', gap: '6px', borderBottom: `1px solid ${C.lk20}`, marginBottom: '24px' }}>
            {tabs.map(tb => (
              <button key={tb.key} onClick={() => setTab(tb.key)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '700', borderRadius: '10px 10px 0 0',
                transition: 'all 0.2s',
                color:      tab === tb.key ? C.gold    : C.silver,
                background: tab === tb.key ? C.g10     : 'transparent',
                borderBottom: `2px solid ${tab === tb.key ? C.gold : 'transparent'}`,
              }}>
                <span>{tb.icon}</span><span>{tb.label}</span>
              </button>
            ))}
            {/* Refresh button */}
            <button onClick={refreshStudents} disabled={refreshing} style={{
              marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '10px', border: `1px solid ${C.g20}`,
              background: 'transparent', color: C.silver, fontSize: '12px', cursor: 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}>
              {refreshing ? '⏳' : '🔄'} {lang === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          {/* ── STUDENTS TAB ── */}
          {tab === 'students' && (
            <div>
              {students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: C.silver }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                  <p>{lang === 'ar' ? 'لا يوجد طلاب بعد' : 'No students yet'}</p>
                </div>
              ) : students.map(student => {
                const done     = Object.values(student.progress || {}).filter(Boolean).length
                const pct      = totalLessons ? Math.round((done / totalLessons) * 100) : 0
                const noteCount = Object.keys(student.notes || {}).length
                const courseMeta = COURSE_OPTIONS.find(c => c.value === student.allowedCourse)
                return (
                  <div key={student.username} style={{
                    background: C.surface, borderRadius: '16px', padding: '18px',
                    marginBottom: '12px', border: `1px solid ${C.g15}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      {/* Avatar */}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: C.g15, border: `2px solid ${C.gold}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {student.photo
                          ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ color: C.gold, fontSize: '14px', fontWeight: '700' }}>{student.avatar}</span>
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '800', fontSize: '15px', color: C.white }}>{student.name}</span>
                          {student.gender && <span style={{ fontSize: '14px' }}>{student.gender === 'female' ? '👩' : '👨'}</span>}
                          {courseMeta && (
                            <span style={{ fontSize: '11px', background: C.g10, color: C.gold, padding: '2px 10px', borderRadius: '20px', border: `1px solid ${C.g20}` }}>
                              {courseMeta.icon} {lang === 'ar' ? courseMeta.labelAr : courseMeta.labelEn}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12px', color: C.silver }}>@{student.username}</span>
                          {student.phone && <span style={{ fontSize: '12px', color: C.silver }}>📞 {student.phone}</span>}
                          <span style={{ fontSize: '12px', color: C.silver }}>📅 {student.joinedAt}</span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', color: C.gold, lineHeight: 1 }}>{pct}%</div>
                        <div style={{ fontSize: '10px', color: C.silver, marginTop: '2px' }}>
                          {done}/{totalLessons}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: '6px', background: C.lk30, borderRadius: '999px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg,${C.goldD},${C.gold})`, borderRadius: '999px', transition: 'width 0.6s' }} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Notes button */}
                      <button onClick={() => setNotesStudent(student)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '10px', cursor: 'pointer',
                        background: noteCount > 0 ? C.g10 : C.lk20,
                        border: `1px solid ${noteCount > 0 ? C.g30 : C.lk30}`,
                        color: noteCount > 0 ? C.gold : C.silver,
                        fontSize: '12px', fontWeight: '700',
                      }}>
                        📝 {lang === 'ar' ? 'الملاحظات' : 'Notes'}
                        {noteCount > 0 && (
                          <span style={{ background: C.gold, color: C.navy, borderRadius: '999px', padding: '1px 7px', fontSize: '11px', fontWeight: '900' }}>
                            {noteCount}
                          </span>
                        )}
                      </button>

                      {/* Delete */}
                      <button onClick={() => deleteStudent(student.username, student.name)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '7px 14px', borderRadius: '10px', cursor: 'pointer',
                        background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.2)',
                        color: C.red, fontSize: '12px', fontWeight: '700', marginRight: 'auto',
                      }}>
                        🗑 {lang === 'ar' ? 'حذف' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── LESSONS TAB ── */}
          {tab === 'lessons' && (
            <div>
              {initialLessons.map((lesson, i) => {
                const enrolled = students.filter(s => s.progress?.[lesson.id]).length
                const pct = students.length ? Math.round((enrolled / students.length) * 100) : 0
                return (
                  <div key={lesson.id} style={{
                    background: C.surface, borderRadius: '14px', padding: '16px',
                    marginBottom: '10px', border: `1px solid ${C.g15}`,
                    display: 'flex', alignItems: 'center', gap: '14px',
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                      background: C.g10, border: `1px solid ${C.g20}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', fontWeight: '900', color: C.gold,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: C.white, marginBottom: '4px' }}>{lesson.title}</div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: C.silver }}>
                        <span>⏱ {lesson.duration}</span>
                        <span style={{ color: enrolled > 0 ? C.emerald : C.silver }}>
                          ✅ {enrolled} {lang === 'ar' ? 'طالب أكمله' : 'completed'}
                        </span>
                        {lesson.free && <span style={{ color: C.gold }}>★ {lang === 'ar' ? 'مجاني' : 'Free'}</span>}
                      </div>
                    </div>
                    {students.length > 0 && (
                      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: '50px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '900', color: pct >= 50 ? C.emerald : C.silver }}>{pct}%</div>
                        <div style={{ fontSize: '10px', color: C.silver }}>{lang === 'ar' ? 'إتمام' : 'done'}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ADD STUDENT TAB ── */}
          {tab === 'add' && (
            <div style={{ background: C.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${C.g20}` }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: C.gold, marginBottom: '22px' }}>
                ➕ {lang === 'ar' ? 'إضافة طالب جديد' : 'Add New Student'}
              </h3>

              {formMsg.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                  fontSize: '13px', fontWeight: '600',
                  background: formMsg.type === 'error' ? 'rgba(252,129,129,0.1)' : 'rgba(46,204,113,0.1)',
                  border: `1px solid ${formMsg.type === 'error' ? 'rgba(252,129,129,0.3)' : 'rgba(46,204,113,0.3)'}`,
                  color: formMsg.type === 'error' ? C.red : C.emerald,
                }}>
                  {formMsg.text}
                </div>
              )}

              <form onSubmit={addStudent}>
                {[
                  [lang==='ar'?'الاسم الكامل':'Full Name',         'name',     'text'],
                  [lang==='ar'?'اسم المستخدم (انجليزي)':'Username (English)', 'username', 'text'],
                  [lang==='ar'?'كلمة المرور':'Password',           'password', 'password'],
                ].map(([label, key, type]) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', color: C.silver, fontSize: '12px', fontWeight: '600', marginBottom: '7px' }}>{label}</label>
                    <input
                      type={type} value={form[key]} required
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                ))}

                {/* Course selection */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', color: C.silver, fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                    {lang === 'ar' ? 'الدورة المسموح بها' : 'Allowed Course'}
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {COURSE_OPTIONS.map(c => (
                      <label key={c.value} style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
                        borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s',
                        background: form.allowedCourse === c.value ? C.g10 : C.navy,
                        border: `1px solid ${form.allowedCourse === c.value ? C.g30 : C.lk30}`,
                      }}>
                        <input type="radio" name="course" value={c.value}
                          checked={form.allowedCourse === c.value}
                          onChange={e => setForm({ ...form, allowedCourse: e.target.value })}
                          style={{ accentColor: C.gold, width: '16px', height: '16px' }} />
                        <span style={{ fontSize: '22px' }}>{c.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: form.allowedCourse === c.value ? C.gold : C.silver }}>
                          {lang === 'ar' ? c.labelAr : c.labelEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
                  border: 'none', borderRadius: '14px', color: C.navy,
                  fontSize: '15px', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
                }}>
                  {loading ? (lang === 'ar' ? '⏳ جاري الإضافة...' : '⏳ Adding...') : (lang === 'ar' ? 'إضافة الطالب' : 'Add Student')}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

// ─── getServerSideProps ────────────────────────────────────────────────────
export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getUser, getAllUsers } = await import('../lib/users-store')
  const { LESSONS } = await import('../lib/db')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['ba_session']
  if (!token) return { redirect: { destination: '/', permanent: false } }
  const session = verifyToken(token)
  if (!session) return { redirect: { destination: '/', permanent: false } }
  const user = await getUser(session.username)
  if (!user || user.role !== 'admin') return { redirect: { destination: '/', permanent: false } }

  const allUsers = await getAllUsers()
  const students = Object.entries(allUsers)
    .filter(([, u]) => u.role === 'student')
    .map(([username, u]) => ({
      username,
      name:         u.name,
      avatar:       u.avatar,
      photo:        u.photo  || '',
      gender:       u.gender || '',
      phone:        u.phone  || '',
      progress:     u.progress    || {},
      quizScores:   u.quizScores  || {},
      notes:        u.notes       || {},
      allowedCourse: u.allowedCourse || null,
      joinedAt:     u.joinedAt    || '',
    }))

  const lessons = LESSONS.map(({ id, title, duration, free }) => ({ id, title, duration, free }))
  return { props: { initialStudents: students, initialLessons: lessons, adminUser: { name: user.name } } }
}
