import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang } from './_app'
import { t } from '../lib/i18n'

const COURSE_OPTIONS = [
  { value: 'comprehensive', labelAr: 'الدورة الشاملة', labelEn: 'Comprehensive Course', icon: '🏆' },
  { value: 'intermediate',  labelAr: 'الدورة المتوسطة', labelEn: 'Intermediate Course', icon: '📈' },
  { value: 'basic',         labelAr: 'الدورة الأساسية', labelEn: 'Basic Course', icon: '🌱' }
]

export default function AdminPage({ initialStudents, initialLessons, adminUser }) {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [students, setStudents] = useState(initialStudents)
  const [tab, setTab] = useState('students')
  const [form, setForm] = useState({ name: '', username: '', password: '', allowedCourse: '' })
  const [formMsg, setFormMsg] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

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
    setLoading(true)
    setFormMsg({ type: '', text: '' })
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setFormMsg({ type: 'error', text: data.error })
    } else {
      setFormMsg({ type: 'success', text: lang === 'ar' ? `✅ تم إضافة ${form.name} بنجاح` : `✅ ${form.name} added successfully` })
      setForm({ name: '', username: '', password: '', allowedCourse: '' })
      const r2 = await fetch('/api/admin/students')
      const d2 = await r2.json()
      setStudents(d2.students || [])
    }
  }

  async function deleteStudent(username, name) {
    if (!confirm(lang === 'ar' ? `هل تريد حذف ${name}؟` : `Delete ${name}?`)) return
    const res = await fetch('/api/admin/students', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
    if (res.ok) setStudents(students.filter(s => s.username !== username))
  }

  const totalLessons = initialLessons.length
  const activeStudents = students.filter(s => Object.values(s.progress || {}).some(Boolean)).length

  function getCourseLabel(courseId) {
    const c = COURSE_OPTIONS.find(x => x.value === courseId)
    if (!c) return '—'
    return lang === 'ar' ? c.labelAr : c.labelEn
  }

  return (
    <>
      <Head><title>COACHBASHARALASALI — Admin</title><meta name="robots" content="noindex" /></Head>
      <div style={{ minHeight: '100vh', background: '#0E0A14' }}>

        <nav style={S.nav}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🛡</span>
            <span style={S.brandName}>{t(lang, 'adminPanel')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={S.langBtn}>
              {t(lang, 'langToggle')}
            </button>
            <span style={{ color: 'rgba(240,234,245,0.45)', fontSize: '13px' }}>{adminUser.name}</span>
            <button onClick={logout} style={S.logoutBtn}>{t(lang, 'logout')}</button>
          </div>
        </nav>

        <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
          {[
            [students.length, t(lang, 'totalStudents'), '👥'],
            [activeStudents,  t(lang, 'activeStudents'), '🔥'],
            [totalLessons,    t(lang, 'totalLessons'), '📚']
          ].map(([val, label, ic]) => (
            <div key={label} style={S.statCard}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{ic}</div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#B86BFF' }}>{val}</div>
              <div style={{ fontSize: '11px', color: 'rgba(240,234,245,0.4)' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={S.tabs}>
          {[['students', t(lang, 'tabStudents')], ['lessons', t(lang, 'tabLessons')], ['add', t(lang, 'tabAdd')]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              ...S.tabBtn,
              color: tab === key ? '#B86BFF' : 'rgba(240,234,245,0.38)',
              borderBottom: tab === key ? '2px solid #B86BFF' : '2px solid transparent',
              background: tab === key ? 'rgba(184,107,255,0.05)' : 'transparent'
            }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>

          {tab === 'students' && (
            <div>
              {students.length === 0 && (
                <p style={{ color: 'rgba(240,234,245,0.3)', textAlign: 'center', padding: '3rem' }}>{t(lang, 'noStudents')}</p>
              )}
              {students.map(student => {
                const done = Object.values(student.progress || {}).filter(Boolean).length
                const pct = Math.round((done / totalLessons) * 100)
                return (
                  <div key={student.username} style={S.studentCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={S.avatar}>{student.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', color: '#F0EAF5' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(240,234,245,0.38)' }}>@{student.username}</div>
                        {student.allowedCourse && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={S.coursePill}>
                              {COURSE_OPTIONS.find(c => c.value === student.allowedCourse)?.icon} {getCourseLabel(student.allowedCourse)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#B86BFF' }}>{pct}%</div>
                        <div style={{ fontSize: '10px', color: 'rgba(240,234,245,0.3)' }}>{t(lang, 'achievement')}</div>
                      </div>
                    </div>
                    <div style={S.progressBar}>
                      <div style={{ ...S.progressFill, width: `${pct}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(240,234,245,0.3)' }}>
                        {done} {t(lang, 'completedAll')} • {t(lang, 'joined')} {student.joinedAt}
                      </span>
                      <button onClick={() => deleteStudent(student.username, student.name)} style={S.deleteBtn}>
                        {t(lang, 'deleteBtn')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'lessons' && (
            <div>
              {initialLessons.map((lesson, i) => {
                const enrolled = students.filter(s => s.progress && s.progress[lesson.id]).length
                return (
                  <div key={lesson.id} style={S.studentCard}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={S.lessonNum}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: '#F0EAF5' }}>{lesson.title}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(240,234,245,0.38)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span>⏱ {lesson.duration}</span>
                          <span>✅ {enrolled} {t(lang, 'completedAll')}</span>
                          {lesson.free && <span style={{ color: '#FFB86B' }}>★ {t(lang, 'free')}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {tab === 'add' && (
            <div style={S.addForm}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#B86BFF', marginBottom: '1.5rem' }}>
                {t(lang, 'addStudentTitle')}
              </h3>
              {formMsg.text && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '1rem',
                  fontSize: '13px', textAlign: 'center',
                  background: formMsg.type === 'error' ? 'rgba(255,71,87,0.1)' : 'rgba(184,107,255,0.1)',
                  border: `1px solid ${formMsg.type === 'error' ? 'rgba(255,71,87,0.3)' : 'rgba(184,107,255,0.3)'}`,
                  color: formMsg.type === 'error' ? '#FF4757' : '#B86BFF'
                }}>
                  {formMsg.text}
                </div>
              )}
              <form onSubmit={addStudent}>
                {[[t(lang, 'fullName'), 'name', 'text'], [t(lang, 'usernameEn'), 'username', 'text'], [t(lang, 'passwordField'), 'password', 'password']]
                  .map(([ph, key, type]) => (
                    <div key={key} style={{ marginBottom: '14px' }}>
                      <label style={S.label}>{ph}</label>
                      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={S.input} required />
                    </div>
                  ))}

                <div style={{ marginBottom: '20px' }}>
                  <label style={S.label}>{t(lang, 'courseAccess')}</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {COURSE_OPTIONS.map(c => (
                      <label key={c.value} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                        background: form.allowedCourse === c.value ? 'rgba(184,107,255,0.1)' : 'rgba(14,10,20,0.5)',
                        border: form.allowedCourse === c.value ? '1px solid rgba(184,107,255,0.45)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                      }}>
                        <input type="radio" name="course" value={c.value}
                          checked={form.allowedCourse === c.value}
                          onChange={e => setForm({ ...form, allowedCourse: e.target.value })}
                          style={{ accentColor: '#B86BFF' }} />
                        <span style={{ fontSize: '18px' }}>{c.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: form.allowedCourse === c.value ? '#B86BFF' : 'rgba(240,234,245,0.55)' }}>
                          {lang === 'ar' ? c.labelAr : c.labelEn}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}>
                  {loading ? t(lang, 'adding') : t(lang, 'addBtn')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { USERS, LESSONS } = await import('../lib/db')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['ba_session']
  if (!token) return { redirect: { destination: '/', permanent: false } }
  const session = verifyToken(token)
  if (!session) return { redirect: { destination: '/', permanent: false } }
  const user = USERS[session.username]
  if (!user || user.role !== 'admin') return { redirect: { destination: '/', permanent: false } }
  const students = Object.entries(USERS)
    .filter(([, u]) => u.role === 'student')
    .map(([username, u]) => ({ username, name: u.name, avatar: u.avatar, progress: u.progress || {}, quizScores: u.quizScores || {}, allowedCourse: u.allowedCourse || null, joinedAt: u.joinedAt || '' }))
  const lessons = LESSONS.map(({ id, title, duration, free }) => ({ id, title, duration, free }))
  return { props: { initialStudents: students, initialLessons: lessons, adminUser: { name: user.name } } }
}

const S = {
  nav: {
    background: 'rgba(43,27,58,0.6)', borderBottom: '1px solid rgba(184,107,255,0.12)',
    backdropFilter: 'blur(20px)', padding: '0 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '60px', position: 'sticky', top: 0, zIndex: 100
  },
  brandName: { color: '#B86BFF', fontWeight: '900', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
  langBtn: {
    background: 'rgba(184,107,255,0.08)', border: '1px solid rgba(184,107,255,0.25)',
    borderRadius: '8px', color: '#B86BFF', padding: '5px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer'
  },
  logoutBtn: {
    background: 'none', border: '1px solid rgba(240,234,245,0.08)',
    borderRadius: '8px', color: 'rgba(240,234,245,0.38)', padding: '5px 12px', cursor: 'pointer', fontSize: '12px'
  },
  statCard: {
    background: 'rgba(43,27,58,0.4)', border: '1px solid rgba(184,107,255,0.12)',
    borderRadius: '16px', padding: '1.2rem', textAlign: 'center'
  },
  tabs: {
    display: 'flex', gap: '4px', padding: '0 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)', maxWidth: '800px', margin: '0 auto'
  },
  tabBtn: { padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', borderRadius: '8px 8px 0 0', transition: 'all 0.2s' },
  studentCard: {
    background: 'rgba(43,27,58,0.3)', border: '1px solid rgba(184,107,255,0.1)',
    borderRadius: '14px', padding: '1rem', marginBottom: '10px'
  },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#2B1B3A,#1a0f28)',
    border: '1px solid rgba(184,107,255,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', color: '#B86BFF', flexShrink: 0
  },
  lessonNum: {
    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
    background: 'rgba(184,107,255,0.08)', border: '1px solid rgba(184,107,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '800', color: '#B86BFF'
  },
  coursePill: {
    fontSize: '10px', background: 'rgba(184,107,255,0.08)', color: '#B86BFF',
    padding: '3px 10px', borderRadius: '20px', border: '1px solid rgba(184,107,255,0.2)', display: 'inline-block'
  },
  progressBar: { background: 'rgba(255,255,255,0.06)', borderRadius: '6px', height: '5px', overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#2B1B3A,#B86BFF)', height: '100%', borderRadius: '6px' },
  deleteBtn: {
    background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.2)',
    borderRadius: '8px', color: '#FF4757', fontSize: '12px', padding: '5px 12px', cursor: 'pointer'
  },
  addForm: {
    background: 'rgba(43,27,58,0.3)', border: '1px solid rgba(184,107,255,0.12)',
    borderRadius: '18px', padding: '1.5rem'
  },
  label: { display: 'block', fontSize: '12px', fontWeight: '600', color: 'rgba(240,234,245,0.45)', marginBottom: '6px' },
  input: {
    width: '100%', background: 'rgba(14,10,20,0.7)',
    border: '1px solid rgba(184,107,255,0.15)', borderRadius: '10px',
    padding: '12px 14px', color: '#F0EAF5', fontSize: '14px', outline: 'none'
  },
  submitBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg,#B86BFF,#9B4FE8)',
    border: 'none', borderRadius: '12px',
    color: '#fff', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(184,107,255,0.3)'
  }
}
