import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang } from './_app'
import { t } from '../lib/i18n'

// ─── Brand Color Palette ───────────────────────────────────────────────────
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
  // rgba helpers
  g10: 'rgba(201,168,76,0.10)', g15: 'rgba(201,168,76,0.15)',
  g20: 'rgba(201,168,76,0.20)', g30: 'rgba(201,168,76,0.30)',
  w10: 'rgba(240,234,245,0.10)', w20: 'rgba(240,234,245,0.20)',
  w40: 'rgba(240,234,245,0.40)', w50: 'rgba(240,234,245,0.50)',
  lk30: 'rgba(74,85,104,0.30)',
}

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ user, view, setView, onLogout, lang }) {
  const isCoursesView = ['courses','lessons','lesson','quiz','quizResult'].includes(view)
  const navItems = [
    { icon: '🏠', label: lang === 'ar' ? 'لوحة التحكم'    : 'Dashboard',  id: 'courses'  },
    { icon: '👤', label: lang === 'ar' ? 'ملفي الشخصي'    : 'Profile',    id: 'profile'  },
    { icon: '💬', label: lang === 'ar' ? 'التواصل المباشر' : 'Support',    href: 'https://wa.me/00962790360675' },
  ]
  return (
    <aside style={{
      position: 'fixed', right: 0, top: 0, height: '100%', width: '240px',
      background: C.surface, borderLeft: `1px solid ${C.g20}`,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      zIndex: 40, boxShadow: '-4px 0 30px rgba(0,0,0,0.5)'
    }}>
      {/* Logo */}
      <div>
        <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${C.g20}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: C.navy, fontWeight: '900', fontSize: '13px', fontFamily: 'Inter,sans-serif' }}>CB</span>
            </div>
            <div>
              <p style={{ color: C.gold, fontWeight: '900', fontSize: '12px', letterSpacing: '0.5px', marginBottom: '2px' }}>COACH BASHAR</p>
              <p style={{ color: C.silver, fontSize: '11px' }}>{lang === 'ar' ? 'منصة التدريب الاحترافي' : 'Professional Training'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item, i) => {
            const isActive = item.id === 'courses' ? isCoursesView : view === item.id
            if (item.href) return (
              <a key={i} href={item.href} target="_blank" rel="noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px',
                textDecoration: 'none', color: C.silver, fontSize: '13px', fontWeight: '600',
                transition: 'all 0.2s', border: '1px solid transparent',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            )
            return (
              <button key={i} onClick={() => setView(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '12px',
                cursor: 'pointer', width: '100%', textAlign: 'right',
                background: isActive ? C.g20 : 'transparent',
                border: `1px solid ${isActive ? C.g30 : 'transparent'}`,
                color: isActive ? C.gold : C.silver,
                fontSize: '13px', fontWeight: '600', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.gold, flexShrink: 0 }} />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* User + Logout */}
      <div style={{ padding: '12px 12px 16px', borderTop: `1px solid ${C.g20}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.g20, border: `1px solid ${C.g30}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            {user.photo
              ? <img src={user.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ color: C.gold, fontSize: '12px', fontWeight: '700' }}>{user.avatar}</span>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: C.white, fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</p>
            <p style={{ color: C.silver, fontSize: '11px' }}>{lang === 'ar' ? 'طالب نشط' : 'Active Student'}</p>
          </div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px',
          borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
          color: C.red, fontSize: '13px', fontWeight: '600',
        }}>
          <span>🚪</span>
          <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  )
}

// ─── Welcome Banner ────────────────────────────────────────────────────────
function WelcomeBanner({ user, lang, lastLesson, onContinue }) {
  const hour = new Date().getHours()
  const greeting = lang === 'ar'
    ? (hour < 12 ? 'صباح الخير' : hour < 17 ? 'مساء الخير' : 'مساء النور')
    : (hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening')
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: '20px',
      background: `linear-gradient(135deg, ${C.blue} 0%, ${C.surface} 50%, ${C.navy} 100%)`,
      border: `1px solid ${C.g20}`, padding: '28px 32px', marginBottom: '28px'
    }}>
      <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(201,168,76,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', right: '20%', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(201,168,76,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: C.silver, fontSize: '13px', marginBottom: '6px' }}>{greeting} 👋</p>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: C.white, marginBottom: '8px', lineHeight: 1.3 }}>
            {lang === 'ar' ? 'مرحباً، ' : 'Welcome, '}
            <span style={{ color: C.gold }}>{user.name.split(' ')[0]}</span>
          </h1>
          <p style={{ color: C.silver, fontSize: '13px' }}>
            {lang === 'ar' ? 'أنت في المسار الصحيح نحو احتراف البيع على eBay' : "You're on the right track to mastering eBay"}
          </p>
        </div>
        {lastLesson && (
          <div style={{ background: C.g10, borderRadius: '16px', padding: '16px 20px', border: `1px solid ${C.g30}`, textAlign: 'center', minWidth: '190px' }}>
            <p style={{ color: C.silver, fontSize: '11px', marginBottom: '6px' }}>{lang === 'ar' ? 'آخر درس' : 'Last Lesson'}</p>
            <p style={{ color: C.white, fontSize: '12px', fontWeight: '600', marginBottom: '12px', maxWidth: '160px' }}>
              {lang === 'ar' ? (lastLesson.title || lastLesson.titleEn) : (lastLesson.titleEn || lastLesson.title)}
            </p>
            <button onClick={onContinue} style={{
              background: C.gold, color: C.navy, padding: '7px 18px', borderRadius: '10px',
              border: 'none', fontSize: '13px', fontWeight: '900', cursor: 'pointer', transition: 'background 0.2s',
            }}>▶ {lang === 'ar' ? 'استمر' : 'Continue'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Learner Stats ─────────────────────────────────────────────────────────
function LearnerStats({ user, lang, COURSES_DATA }) {
  const courseIds = COURSES_DATA?.[user.allowedCourse]?.lessons || []
  const completed  = courseIds.filter(id => user.progress[id]).length
  const total      = courseIds.length
  const pct        = total ? Math.round((completed / total) * 100) : 0
  const certs      = total > 0 && courseIds.every(id => user.progress[id]) ? 1 : 0
  const stats = [
    { icon: '📊', label: lang==='ar'?'الإنجاز الكلي':'Overall Progress',   value: `${pct}%`,       sub: lang==='ar'?'من الدورة':'of course',            color: C.gold,    bg: C.g10,                     border: C.g20 },
    { icon: '✅', label: lang==='ar'?'دروس مكتملة':'Completed',            value: String(completed), sub: `${lang==='ar'?'من':''} ${total} ${lang==='ar'?'درس':'lessons'}`, color: C.emerald, bg: 'rgba(46,204,113,0.10)',  border: 'rgba(46,204,113,0.20)' },
    { icon: '🔥', label: lang==='ar'?'سلسلة التعلم':'Streak',              value: '1',             sub: lang==='ar'?'يوم متتالي':'day streak',          color: C.red,     bg: 'rgba(252,129,129,0.10)',   border: 'rgba(252,129,129,0.20)' },
    { icon: '🏆', label: lang==='ar'?'الشهادات':'Certificates',            value: String(certs),   sub: certs===0?(lang==='ar'?'أكمل دورة للحصول على شهادة':'Complete a course'):(lang==='ar'?'مكتسبة':'Earned'), color: C.purple, bg: 'rgba(183,148,244,0.10)', border: 'rgba(183,148,244,0.20)' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: C.surface, borderRadius: '18px', padding: '18px', border: `1px solid ${s.border}` }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{s.icon}</div>
          <p style={{ color: C.silver, fontSize: '11px', marginBottom: '4px' }}>{s.label}</p>
          <p style={{ fontSize: '28px', fontWeight: '900', color: s.color, marginBottom: '4px', lineHeight: 1 }}>{s.value}</p>
          <p style={{ color: C.silver, fontSize: '11px', lineHeight: 1.4 }}>{s.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Progress Milestones ───────────────────────────────────────────────────
function ProgressMilestones({ progress, lang }) {
  const milestones = [
    { percent: 10,  icon: '🌱', label: lang==='ar'?'بداية الرحلة':'Start'    },
    { percent: 25,  icon: '⚡', label: lang==='ar'?'مبتدئ نشط':'Beginner'    },
    { percent: 50,  icon: '🔥', label: lang==='ar'?'منتصف الطريق':'Halfway'   },
    { percent: 75,  icon: '💎', label: lang==='ar'?'متقدم':'Advanced'         },
    { percent: 100, icon: '🏆', label: lang==='ar'?'خبير eBay':'eBay Expert'  },
  ]
  return (
    <div style={{ background: C.surface, borderRadius: '20px', padding: '22px 24px', border: `1px solid ${C.g20}`, marginBottom: '28px' }}>
      <h3 style={{ color: C.white, fontWeight: '800', fontSize: '15px', marginBottom: '20px' }}>
        {lang === 'ar' ? 'مسار الإنجاز' : 'Achievement Path'}
      </h3>
      <div style={{ height: '8px', background: C.lk30, borderRadius: '999px', marginBottom: '20px', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: '999px', width: `${progress}%`, transition: 'width 0.7s ease', background: `linear-gradient(90deg, rgba(201,168,76,0.5), ${C.gold})` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {milestones.map((m, i) => {
          const done = progress >= m.percent
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '50%', fontSize: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${done ? C.gold : C.locked}`,
                background: done ? C.g20 : 'rgba(74,85,104,0.2)',
                boxShadow: done ? '0 0 14px rgba(201,168,76,0.3)' : 'none',
                transition: 'all 0.3s',
              }}>{m.icon}</div>
              <span style={{ fontSize: '10px', color: done ? C.gold : C.silver, textAlign: 'center', maxWidth: '60px', lineHeight: 1.3 }}>{m.label}</span>
              <span style={{ fontSize: '10px', color: done ? C.emerald : C.silver }}>{m.percent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Lesson Notes ─────────────────────────────────────────────────────────
function LessonNotes({ lessonId, lang }) {
  const [note,    setNote]    = useState('')
  const [saved,   setSaved]   = useState('')   // '' | 'saving' | 'ok' | 'error'
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)
  const saveTimer = useRef(null)

  // جلب الملاحظة عند فتح القسم
  useEffect(() => {
    if (!open) return
    setLoading(true)
    fetch(`/api/lessons/${lessonId}/notes`)
      .then(r => r.json())
      .then(d => { setNote(d.note || ''); setLoading(false) })
      .catch(() => setLoading(false))
  }, [lessonId, open])

  // حفظ تلقائي بعد 1.5 ثانية من التوقف عن الكتابة
  function handleChange(val) {
    setNote(val)
    setSaved('')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveNote(val), 1500)
  }

  async function saveNote(val) {
    setSaved('saving')
    try {
      const res = await fetch(`/api/lessons/${lessonId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: val }),
      })
      setSaved(res.ok ? 'ok' : 'error')
      if (res.ok) setTimeout(() => setSaved(''), 2500)
    } catch {
      setSaved('error')
    }
  }

  const statusColor = saved === 'ok' ? C.emerald : saved === 'error' ? C.red : C.silver
  const statusText  = saved === 'saving'
    ? (lang === 'ar' ? '⏳ جاري الحفظ...' : '⏳ Saving...')
    : saved === 'ok'
    ? (lang === 'ar' ? '✅ تم الحفظ' : '✅ Saved')
    : saved === 'error'
    ? (lang === 'ar' ? '❌ فشل الحفظ' : '❌ Save failed')
    : (lang === 'ar' ? 'يُحفظ تلقائياً' : 'Auto-saved')

  return (
    <div style={{ marginTop: '24px', borderRadius: '16px', border: `1px solid ${C.g20}`, overflow: 'hidden', background: C.surface }}>
      {/* Header — toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>📝</span>
          <span style={{ color: C.white, fontSize: '14px', fontWeight: '700' }}>
            {lang === 'ar' ? 'ملاحظاتي على هذا الدرس' : 'My Notes for This Lesson'}
          </span>
          <span style={{ fontSize: '11px', color: C.silver, background: C.g10, padding: '2px 8px', borderRadius: '20px', border: `1px solid ${C.g20}` }}>
            {lang === 'ar' ? 'خاصة بك فقط' : 'Private to you'}
          </span>
        </div>
        <span style={{ color: C.silver, fontSize: '18px', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${C.g15}` }}>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: C.silver, fontSize: '13px' }}>
              ⏳ {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : (
            <>
              <textarea
                value={note}
                onChange={e => handleChange(e.target.value)}
                placeholder={lang === 'ar'
                  ? 'اكتب ملاحظاتك هنا... (تُحفظ تلقائياً)'
                  : 'Write your notes here... (auto-saved)'}
                rows={6}
                style={{
                  width: '100%', marginTop: '14px',
                  background: C.navy, border: `1px solid ${C.g20}`,
                  borderRadius: '12px', padding: '14px 16px',
                  color: C.white, fontSize: '14px', lineHeight: '1.7',
                  resize: 'vertical', outline: 'none',
                  direction: 'rtl', fontFamily: 'inherit',
                  boxSizing: 'border-box', transition: 'border 0.2s',
                  minHeight: '120px',
                }}
                onFocus={e => e.target.style.borderColor = C.gold}
                onBlur={e  => e.target.style.borderColor = C.g20}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: statusColor, transition: 'color 0.3s' }}>
                  {statusText}
                </span>
                <span style={{ fontSize: '11px', color: C.silver }}>
                  {note.length} / 5000
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Profile View ──────────────────────────────────────────────────────────
function ProfileView({ user, lang, COURSES_DATA, onUserUpdate }) {
  const [photo,   setPhoto]   = useState(user.photo   || '')
  const [name,    setName]    = useState(user.name    || '')
  const [phone,   setPhone]   = useState(user.phone   || '')
  const [gender,  setGender]  = useState(user.gender  || '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')
  const fileRef = useRef(null)

  const courseIds = COURSES_DATA?.[user.allowedCourse]?.lessons || []
  const completed = courseIds.filter(id => user.progress[id]).length
  const courseMeta = COURSES_DATA?.[user.allowedCourse]
  const cName = courseMeta ? (lang === 'ar' ? courseMeta.nameAr : courseMeta.nameEn) : '—'

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      setError(lang === 'ar' ? 'الصورة كبيرة جداً (الحد الأقصى 8MB)' : 'Image too large (max 8MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const SIZE = 220
        canvas.width = SIZE; canvas.height = SIZE
        const ctx = canvas.getContext('2d')
        // Square center-crop
        const min = Math.min(img.width, img.height)
        const sx = (img.width  - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, SIZE, SIZE)
        setPhoto(canvas.toDataURL('image/jpeg', 0.78))
        setError('')
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, gender, photo }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || (lang === 'ar' ? 'حدث خطأ' : 'Error')); return }
      setSaved(true)
      onUserUpdate({ name, phone, gender, photo })
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError(lang === 'ar' ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', background: C.navy, border: `1px solid ${C.lk30}`,
    borderRadius: '12px', padding: '12px 16px', color: C.white,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border 0.2s',
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header card ── */}
      <div style={{ background: C.surface, borderRadius: '20px', padding: '32px', border: `1px solid ${C.g20}`, textAlign: 'center' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: C.g20, border: `3px solid ${C.gold}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', cursor: 'pointer', overflow: 'hidden',
              boxShadow: `0 0 20px rgba(201,168,76,0.25)`,
            }}
          >
            {photo
              ? <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '40px' }}>{gender === 'female' ? '👩' : '👨'}</span>
            }
          </div>
          {/* Edit badge */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, left: 0,
              width: '28px', height: '28px', borderRadius: '50%',
              background: C.gold, border: `2px solid ${C.surface}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '13px',
            }}
          >✎</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        <p style={{ color: C.silver, fontSize: '12px', marginBottom: '16px' }}>
          {lang === 'ar' ? 'اضغط على الصورة لتغييرها' : 'Click image to change it'}
        </p>

        <h2 style={{ fontSize: '22px', fontWeight: '900', color: C.white, marginBottom: '4px' }}>{user.name}</h2>
        <p style={{ color: C.silver, fontSize: '13px', marginBottom: '20px' }}>{cName}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          {[
            [String(completed), lang === 'ar' ? 'دروس مكتملة' : 'Lessons'],
            ['🔥 1',            lang === 'ar' ? 'يوم متتالي'   : 'Streak'],
            ['1',               lang === 'ar' ? 'دورة نشطة'    : 'Course'],
          ].map(([val, lbl], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <p style={{ color: C.gold, fontWeight: '900', fontSize: '20px', marginBottom: '4px' }}>{val}</p>
              <p style={{ color: C.silver, fontSize: '11px' }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Form ── */}
      <div style={{ background: C.surface, borderRadius: '20px', padding: '24px', border: `1px solid ${C.g20}` }}>
        <h3 style={{ color: C.white, fontWeight: '800', fontSize: '15px', marginBottom: '20px' }}>
          {lang === 'ar' ? 'تعديل المعلومات' : 'Edit Information'}
        </h3>

        {error && (
          <div style={{ background: 'rgba(252,129,129,0.1)', border: '1px solid rgba(252,129,129,0.3)', borderRadius: '10px', padding: '10px 14px', color: C.red, fontSize: '13px', marginBottom: '16px' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Username (read-only) */}
          <div>
            <label style={{ display: 'block', color: C.silver, fontSize: '12px', marginBottom: '6px' }}>
              {lang === 'ar' ? 'اسم المستخدم' : 'Username'}
            </label>
            <div style={{ ...inputStyle, color: C.silver, cursor: 'not-allowed', border: `1px solid rgba(74,85,104,0.2)` }}>
              {user.username}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', color: C.silver, fontSize: '12px', marginBottom: '6px' }}>
              {lang === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ ...inputStyle, direction: 'rtl' }}
              placeholder={lang === 'ar' ? 'اكتب اسمك الكامل' : 'Enter your full name'}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', color: C.silver, fontSize: '12px', marginBottom: '6px' }}>
              {lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ ...inputStyle, direction: 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}
              placeholder="+962 7X XXX XXXX"
            />
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'block', color: C.silver, fontSize: '12px', marginBottom: '10px' }}>
              {lang === 'ar' ? 'الجنس' : 'Gender'}
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { value: 'male',   ar: 'ذكر',  en: 'Male',   icon: '👨' },
                { value: 'female', ar: 'أنثى', en: 'Female', icon: '👩' },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGender(opt.value)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '14px', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                    background: gender === opt.value ? C.g15 : C.navy,
                    border: `2px solid ${gender === opt.value ? C.gold : C.lk30}`,
                    color: gender === opt.value ? C.gold : C.silver,
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '28px' }}>{opt.icon}</span>
                  <span style={{ fontSize: '13px', fontWeight: '700' }}>
                    {lang === 'ar' ? opt.ar : opt.en}
                  </span>
                  {gender === opt.value && (
                    <span style={{ fontSize: '11px', color: C.gold }}>✓ {lang === 'ar' ? 'محدد' : 'Selected'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: saved
              ? `linear-gradient(135deg, ${C.emerald}, #27ae60)`
              : `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
            color: saved ? '#fff' : C.navy,
            fontSize: '15px', fontWeight: '900', cursor: saving ? 'not-allowed' : 'pointer',
            marginTop: '20px', opacity: saving ? 0.75 : 1, transition: 'all 0.3s',
            boxShadow: `0 4px 20px ${saved ? 'rgba(46,204,113,0.3)' : 'rgba(201,168,76,0.25)'}`,
          }}
        >
          {saving
            ? (lang === 'ar' ? '⏳ جاري الحفظ...' : '⏳ Saving...')
            : saved
            ? (lang === 'ar' ? '✅ تم الحفظ بنجاح!' : '✅ Saved!')
            : (lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes')
          }
        </button>

        {/* Contact note */}
        <div style={{ marginTop: '16px', padding: '12px', background: C.g10, border: `1px solid ${C.g20}`, borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: C.silver, fontSize: '12px', marginBottom: '6px' }}>
            {lang === 'ar' ? 'لتغيير كلمة المرور تواصل مع المدرب' : 'To change password, contact the coach'}
          </p>
          <a href="https://wa.me/00962790360675" target="_blank" rel="noreferrer"
            style={{ color: C.gold, fontSize: '13px', fontWeight: '700', textDecoration: 'none' }}>
            💬 {lang === 'ar' ? 'تواصل معنا' : 'Contact Us'}
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Confetti & Celebrations (unchanged) ──────────────────────────────────
const CONFETTI_COLORS = ['#C9A84C','#E8C96A','#F0EAF5','#2ECC71','#A0AEC0','#B794F4','#FC8181']

function Confetti({ intensity = 80 }) {
  const particles = useMemo(() => Array.from({ length: intensity }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 1.6,
    duration: 1.8 + Math.random() * 1.4, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 9, circle: Math.random() > 0.5,
  })), [intensity])
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-20px', width: p.size, height: p.size,
          background: p.color, borderRadius: p.circle ? '50%' : '2px',
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

function LessonCelebration({ lang, isLast, onNext, onBack }) {
  return (
    <>
      <Confetti intensity={60} />
      <div style={OVL.overlay}>
        <div style={OVL.modal} className="bounce-in">
          <div style={OVL.celebIcon} className="float">🎉</div>
          <h2 style={OVL.celebTitle}>{t(lang, 'lessonCelebTitle')}</h2>
          <p style={OVL.celebMsg}>{t(lang, 'lessonCelebMsg')}</p>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', marginTop: '1.5rem' }}>
            {!isLast && <button onClick={onNext} style={OVL.primaryBtn}>{t(lang, 'nextLessonBtn')}</button>}
            <button onClick={onBack} style={OVL.secondaryBtn}>{t(lang, 'backToLessonsBtn')}</button>
          </div>
        </div>
      </div>
    </>
  )
}

function CourseCompletion({ lang, user, courseData, onViewCert, onBack }) {
  return (
    <>
      <Confetti intensity={120} />
      <div style={OVL.overlay}>
        <div style={{ ...OVL.modal, maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }} className="bounce-in">
          <div style={{ fontSize: '80px', marginBottom: '1rem' }} className="float">🏆</div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: C.gold, marginBottom: '8px' }}>{t(lang, 'courseCompleted')}</h2>
          <p style={{ fontSize: '16px', fontWeight: '600', color: C.white, marginBottom: '6px' }}>{t(lang, 'congratulations')}, {user.name.split(' ')[0]}!</p>
          <p style={{ fontSize: '14px', color: C.w40, marginBottom: '2rem' }}>{t(lang, 'courseCompletedMsg')}</p>
          <button onClick={onViewCert} style={{ ...OVL.primaryBtn, marginBottom: '12px' }}>{t(lang, 'viewCertificate')}</button>
          <button onClick={onBack} style={OVL.secondaryBtn}>{t(lang, 'backToCoursesBtn')}</button>
        </div>
      </div>
    </>
  )
}

function Certificate({ lang, user, courseData, onClose }) {
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const courseName = lang === 'ar' ? courseData.nameAr : courseData.nameEn
  return (
    <div style={CERT.overlay}>
      <div style={CERT.backdrop} onClick={onClose} />
      <div style={CERT.wrapper} className="fade-in">
        <div id="certificate-print-area" style={CERT.paper}>
          <div style={CERT.outerBorder}>
            <div style={CERT.innerBorder}>
              <div style={CERT.topDeco}><div style={CERT.decoLine} /><span style={CERT.decoStar}>✦</span><div style={CERT.decoLine} /></div>
              <div style={CERT.platformName}>COACHBASHARALASALI</div>
              <div style={CERT.platformSub}>{lang === 'ar' ? 'منصة تجارة eBay الاحترافية' : 'Professional eBay Trading Platform'}</div>
              <div style={CERT.divider} />
              <p style={CERT.certLabel}>{t(lang, 'certificateTitle')}</p>
              <div style={CERT.dividerThin} />
              <p style={{ ...CERT.bodyText, fontSize: '14px' }}>{t(lang, 'certifiedText')}</p>
              <div style={CERT.studentName}>{user.name}</div>
              <p style={{ ...CERT.bodyText, fontSize: '14px', marginTop: '10px' }}>{t(lang, 'completedCourse')}</p>
              <div style={CERT.courseName}>{courseName}</div>
              <div style={CERT.hoursBox}><span style={CERT.hoursText}>⏱ {t(lang, 'totalHoursLabel')}</span></div>
              <div style={CERT.divider} />
              <div style={CERT.footer}>
                <div style={CERT.footerItem}>
                  <div style={CERT.footerLabel}>{t(lang, 'certDate')}</div>
                  <div style={CERT.footerValue}>{date}</div>
                </div>
                <div style={CERT.footerSeal}>
                  <div style={CERT.sealCircle}><span style={{ fontSize: '22px' }}>🏆</span></div>
                </div>
                <div style={CERT.footerItem}>
                  <div style={CERT.footerLabel}>{t(lang, 'issuedBy')}</div>
                  <div style={{ ...CERT.footerValue, fontSize: '10px' }}>COACHBASHARALASALI</div>
                </div>
              </div>
              <div style={{ ...CERT.topDeco, marginTop: '20px' }}><div style={CERT.decoLine} /><span style={CERT.decoStar}>✦</span><div style={CERT.decoLine} /></div>
            </div>
          </div>
        </div>
        <div style={CERT.actions}>
          <button onClick={() => window.print()} style={CERT.printBtn}>{t(lang, 'printCert')}</button>
          <button onClick={onClose} style={CERT.closeBtn}>{t(lang, 'closeCert')}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard({ initialUser }) {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [user, setUser]           = useState(initialUser)
  const [lessons, setLessons]     = useState([])
  const [view, setView]           = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeLesson, setActiveLesson]     = useState(null)
  const [videoUrl, setVideoUrl]             = useState(null)
  const [videoLoading, setVideoLoading]     = useState(false)
  const [quiz, setQuiz]                     = useState(null)
  const [quizStep, setQuizStep]             = useState(0)
  const [quizAnswers, setQuizAnswers]       = useState([])
  const [quizResult, setQuizResult]         = useState(null)
  const [showLessonCeleb, setShowLessonCeleb]   = useState(false)
  const [showCompletion, setShowCompletion]     = useState(false)
  const [showCertificate, setShowCertificate]   = useState(false)
  const [celebNextIdx, setCelebNextIdx]         = useState(null)
  const [COURSES_DATA, setCoursesData]          = useState(null)

  useEffect(() => {
    fetch('/api/lessons').then(r => r.json()).then(d => setLessons(d.lessons || []))
    import('../lib/db').then(m => setCoursesData(m.COURSES))
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const courseLessons = useMemo(() => {
    if (!COURSES_DATA || !selectedCourse || !lessons.length) return []
    return lessons.filter(l => (COURSES_DATA[selectedCourse]?.lessons || []).includes(l.id))
  }, [COURSES_DATA, selectedCourse, lessons])

  const courseDone  = courseLessons.filter(l => user.progress[l.id]).length
  const courseTotal = courseLessons.length
  const coursePct   = courseTotal ? Math.round((courseDone / courseTotal) * 100) : 0

  // Allowed course lessons (for stats)
  const allowedLessons = useMemo(() => {
    if (!COURSES_DATA || !lessons.length) return []
    return lessons.filter(l => (COURSES_DATA[user.allowedCourse]?.lessons || []).includes(l.id))
  }, [COURSES_DATA, lessons, user.allowedCourse])

  const allowedPct = allowedLessons.length
    ? Math.round((allowedLessons.filter(l => user.progress[l.id]).length / allowedLessons.length) * 100)
    : 0

  // Last accessible lesson for "continue" button
  const lastLesson = useMemo(() => {
    if (!allowedLessons.length) return null
    const lastCompleted = [...allowedLessons].reverse().find(l => user.progress[l.id])
    if (!lastCompleted) return allowedLessons[0]
    const idx = allowedLessons.findIndex(l => l.id === lastCompleted.id)
    return allowedLessons[idx + 1] || lastCompleted
  }, [allowedLessons, user.progress])

  function canAccess(lesson, indexInCourse) {
    if (indexInCourse === 0) return true
    const prev = courseLessons[indexInCourse - 1]
    return prev && user.progress[prev.id]
  }

  async function openLesson(lesson, indexInCourse) {
    if (indexInCourse !== undefined && !canAccess(lesson, indexInCourse)) return
    // If coming from welcome banner, set course first
    if (!selectedCourse) {
      setSelectedCourse(user.allowedCourse)
    }
    setActiveLesson(lesson)
    setVideoUrl(null)
    setVideoLoading(true)
    setView('lesson')
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/video`)
      const data = await res.json()
      if (res.ok) setVideoUrl(data.videoUrl)
    } catch {}
    setVideoLoading(false)
  }

  async function markComplete() {
    await fetch(`/api/lessons/${activeLesson.id}/complete`, { method: 'POST' })
    const newProgress = { ...user.progress, [activeLesson.id]: true }
    setUser(u => ({ ...u, progress: newProgress }))
    const res = await fetch(`/api/quiz/${activeLesson.id}`)
    if (res.ok) {
      const data = await res.json()
      setQuiz(data.quiz); setQuizStep(0); setQuizAnswers([]); setQuizResult(null)
      setView('quiz')
    } else {
      triggerLessonCelebration(newProgress)
    }
  }

  function triggerLessonCelebration(progress) {
    const idx = courseLessons.findIndex(l => l.id === activeLesson.id)
    setCelebNextIdx(idx + 1 < courseLessons.length ? idx + 1 : null)
    const courseIds = COURSES_DATA?.[selectedCourse]?.lessons || []
    if (courseIds.every(id => progress[id])) setShowCompletion(true)
    else setShowLessonCeleb(true)
  }

  async function submitAnswer(answerIdx) {
    const newAnswers = [...quizAnswers, answerIdx]
    setQuizAnswers(newAnswers)
    if (newAnswers.length === quiz.questions.length) {
      const res = await fetch(`/api/quiz/${activeLesson.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers })
      })
      const data = await res.json()
      setQuizResult(data)
      setUser(u => ({ ...u, quizScores: { ...u.quizScores, [activeLesson.id]: data.score } }))
      setView('quizResult')
      triggerLessonCelebration({ ...user.progress, [activeLesson.id]: true })
    } else {
      setQuizStep(quizStep + 1)
    }
  }

  const courseData = COURSES_DATA?.[selectedCourse]

  function handleUserUpdate(updates) {
    setUser(u => ({ ...u, ...updates }))
  }

  // Breadcrumb label
  const breadcrumb = view === 'profile'
    ? (lang === 'ar' ? 'ملفي الشخصي' : 'Profile')
    : view === 'lessons' ? (lang === 'ar' ? 'قائمة الدروس' : 'Lessons')
    : view === 'lesson'  ? (lang === 'ar' ? 'مشاهدة الدرس' : 'Watch Lesson')
    : view === 'quiz' || view === 'quizResult' ? (lang === 'ar' ? 'الاختبار' : 'Quiz')
    : (lang === 'ar' ? 'لوحة التحكم' : 'Dashboard')

  return (
    <>
      <Head><title>COACHBASHARALASALI</title><meta name="robots" content="noindex" /></Head>

      {/* Overlays */}
      {showLessonCeleb && (
        <LessonCelebration lang={lang} isLast={celebNextIdx === null}
          onNext={() => { setShowLessonCeleb(false); if (celebNextIdx !== null) openLesson(courseLessons[celebNextIdx], celebNextIdx); else setView('lessons') }}
          onBack={() => { setShowLessonCeleb(false); setView('lessons') }}
        />
      )}
      {showCompletion && !showCertificate && (
        <CourseCompletion lang={lang} user={user} courseData={courseData || {}}
          onViewCert={() => { setShowCompletion(false); setShowCertificate(true) }}
          onBack={() => { setShowCompletion(false); setView('courses'); setSelectedCourse(null) }}
        />
      )}
      {showCertificate && (
        <Certificate lang={lang} user={user} courseData={courseData || {}}
          onClose={() => { setShowCertificate(false); setView('courses'); setSelectedCourse(null) }}
        />
      )}

      {/* Page Layout */}
      <div style={{ minHeight: '100vh', background: C.navy }}>
        {/* Sidebar */}
        <Sidebar user={user} view={view} setView={(v) => { setView(v); if (v === 'courses') { setSelectedCourse(null) } }} onLogout={logout} lang={lang} />

        {/* Main Content — offset right for sidebar */}
        <div style={{ marginRight: '240px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

          {/* Top Header */}
          <header style={{
            position: 'sticky', top: 0, zIndex: 30,
            background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(16px)',
            borderBottom: `1px solid rgba(201,168,76,0.1)`,
            padding: '0 28px', height: '56px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.silver }}>
              <span style={{ cursor: 'pointer', color: C.silver }} onClick={() => setView('courses')}>{lang === 'ar' ? 'الرئيسية' : 'Home'}</span>
              <span>/</span>
              <span style={{ color: C.gold, fontWeight: '700' }}>{breadcrumb}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
                padding: '5px 14px', borderRadius: '8px', border: `1px solid ${C.g30}`,
                background: 'transparent', color: C.gold, fontSize: '12px', fontWeight: '700', cursor: 'pointer',
              }}>
                {lang === 'ar' ? 'EN' : 'AR'}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <div style={{ flex: 1, padding: '28px 28px 40px' }}>

            {/* ── COURSES VIEW ── */}
            {view === 'courses' && COURSES_DATA && (
              <div className="fade-in">
                <WelcomeBanner user={user} lang={lang} lastLesson={lastLesson}
                  onContinue={() => { if (lastLesson) { setSelectedCourse(user.allowedCourse); openLesson(lastLesson, undefined) } }}
                />
                <LearnerStats user={user} lang={lang} COURSES_DATA={COURSES_DATA} />
                <ProgressMilestones progress={allowedPct} lang={lang} />

                <h2 style={{ fontSize: '16px', fontWeight: '800', color: C.white, marginBottom: '16px' }}>
                  {lang === 'ar' ? 'دوراتك' : 'Your Courses'}
                </h2>

                {Object.values(COURSES_DATA).map(course => {
                  const isAllowed = user.allowedCourse === course.id
                  const name = lang === 'ar' ? course.nameAr : course.nameEn
                  const desc = lang === 'ar' ? course.descAr : course.descEn
                  const cIds = course.lessons
                  const done = cIds.filter(id => user.progress[id]).length
                  const pct  = cIds.length ? Math.round((done / cIds.length) * 100) : 0
                  return (
                    <div key={course.id} onClick={() => isAllowed && (setSelectedCourse(course.id), setView('lessons'))}
                      style={{
                        position: 'relative', borderRadius: '18px', overflow: 'hidden',
                        border: `1px solid ${isAllowed ? C.g30 : 'rgba(74,85,104,0.3)'}`,
                        marginBottom: '14px', transition: 'all 0.25s',
                        cursor: isAllowed ? 'pointer' : 'not-allowed',
                        opacity: isAllowed ? 1 : 0.6,
                        boxShadow: isAllowed ? '0 4px 24px rgba(201,168,76,0.08)' : 'none',
                      }}>
                      {/* Locked overlay */}
                      {!isAllowed && (
                        <div style={{
                          position: 'absolute', inset: 0, zIndex: 10,
                          background: 'rgba(13,13,26,0.55)', backdropFilter: 'blur(2px)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px'
                        }}>
                          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(74,85,104,0.4)', border: `2px solid ${C.locked}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🔒</div>
                          <p style={{ color: C.silver, fontSize: '12px', textAlign: 'center', maxWidth: '200px', lineHeight: 1.5 }}>
                            {lang === 'ar' ? 'هذه الدورة غير مفعّلة في حسابك' : 'This course is not activated for your account'}
                          </p>
                        </div>
                      )}
                      {/* Card content */}
                      <div style={{ padding: '20px', background: C.surface, filter: isAllowed ? 'none' : 'grayscale(40%)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                          <div style={{
                            width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
                            background: isAllowed ? C.g10 : 'rgba(74,85,104,0.2)',
                            border: `1px solid ${isAllowed ? C.g30 : 'rgba(74,85,104,0.3)'}`,
                          }}>{course.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '15px', fontWeight: '700', color: isAllowed ? C.white : C.silver }}>{name}</span>
                              {isAllowed && <span style={{ fontSize: '10px', background: C.g10, color: C.gold, padding: '3px 10px', borderRadius: '20px', border: `1px solid ${C.g30}`, fontWeight: '700' }}>
                                ✓ {lang === 'ar' ? 'مفعّل' : 'Active'}
                              </span>}
                              {isAllowed && <span style={{ fontSize: '10px', background: 'rgba(46,204,113,0.1)', color: C.emerald, padding: '3px 10px', borderRadius: '20px' }}>
                                ● {lang === 'ar' ? 'نشط' : 'Active'}
                              </span>}
                            </div>
                            <p style={{ fontSize: '13px', color: C.silver, marginBottom: isAllowed ? '12px' : '0', lineHeight: 1.6 }}>{desc}</p>
                            {isAllowed && (
                              <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                  <span style={{ fontSize: '11px', color: C.w40 }}>{lang === 'ar' ? 'التقدم' : 'Progress'}</span>
                                  <span style={{ fontSize: '11px', fontWeight: '800', color: C.gold }}>{pct}%</span>
                                </div>
                                <div style={{ background: C.lk30, borderRadius: '10px', height: '7px', overflow: 'hidden', marginBottom: '12px' }}>
                                  <div style={{ height: '100%', borderRadius: '10px', width: `${pct}%`, background: `linear-gradient(90deg, ${C.goldD}, ${C.gold})`, transition: 'width 0.8s ease' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <span style={{ fontSize: '13px', color: C.gold, fontWeight: '800' }}>{lang === 'ar' ? 'ادخل الدورة ←' : 'Enter Course →'}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* WhatsApp section */}
                <div style={{ marginTop: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(240,234,245,0.07)' }} />
                    <span style={{ fontSize: '11px', color: C.w40, whiteSpace: 'nowrap' }}>{lang === 'ar' ? 'التواصل المباشر' : 'Direct Contact'}</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(240,234,245,0.07)' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      ['💬', t(lang, 'contactCoach'),   t(lang, 'whatsappHint'), 'https://wa.me/00962790360675'],
                      ['🎯', t(lang, 'contactAdvisor'), t(lang, 'whatsappHint'), 'https://wa.me/00962792112207'],
                    ].map(([icon, title, sub, href], i) => (
                      <a key={i} href={href} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                        background: C.surface, border: `1px solid ${C.g15}`,
                        borderRadius: '14px', textDecoration: 'none', transition: 'all 0.2s',
                      }}>
                        <span style={{ fontSize: '22px', flexShrink: 0 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: C.white, marginBottom: '3px' }}>{title}</div>
                          <div style={{ fontSize: '10px', color: C.w40 }}>{sub}</div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Social Media */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <a href="https://www.instagram.com/basharalasali/" target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                      background: 'linear-gradient(135deg, rgba(131,58,180,0.15), rgba(253,29,29,0.15), rgba(252,176,69,0.15))',
                      border: '1px solid rgba(253,29,29,0.25)',
                      borderRadius: '14px', textDecoration: 'none', transition: 'all 0.2s',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                        <defs>
                          <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433"/>
                            <stop offset="25%" stopColor="#e6683c"/>
                            <stop offset="50%" stopColor="#dc2743"/>
                            <stop offset="75%" stopColor="#cc2366"/>
                            <stop offset="100%" stopColor="#bc1888"/>
                          </linearGradient>
                        </defs>
                        <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig)"/>
                        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
                        <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
                      </svg>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: C.white, marginBottom: '3px' }}>
                          {lang === 'ar' ? 'إنستجرام' : 'Instagram'}
                        </div>
                        <div style={{ fontSize: '10px', color: C.w40 }}>@basharalasali</div>
                      </div>
                    </a>

                    <a href="https://www.youtube.com/@coachbasharalasali" target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                      background: 'rgba(255,0,0,0.08)',
                      border: '1px solid rgba(255,0,0,0.2)',
                      borderRadius: '14px', textDecoration: 'none', transition: 'all 0.2s',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF0000" style={{ flexShrink: 0 }}>
                        <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.6 5 12 5 12 5s-4.6 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.6 2 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.3.9C6.8 19 12 19 12 19s4.6 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5C22 9.6 21.8 8 21.8 8zM9.7 14.5V9.4l5.5 2.6-5.5 2.5z"/>
                      </svg>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: C.white, marginBottom: '3px' }}>
                          {lang === 'ar' ? 'يوتيوب' : 'YouTube'}
                        </div>
                        <div style={{ fontSize: '10px', color: C.w40 }}>@coachbasharalasali</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── LESSONS VIEW ── */}
            {view === 'lessons' && courseData && (
              <div style={{ maxWidth: '640px', margin: '0 auto' }} className="fade-in">
                <button onClick={() => { setView('courses'); setSelectedCourse(null) }} style={BTN.back}>
                  {t(lang, 'backToCourses')}
                </button>
                <div style={{ background: C.surface, border: `1px solid ${C.g15}`, borderRadius: '18px', padding: '20px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '28px' }}>{courseData.icon}</span>
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: '800', color: C.white }}>{lang === 'ar' ? courseData.nameAr : courseData.nameEn}</h2>
                      <p style={{ fontSize: '12px', color: C.silver }}>{user.name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: C.w40 }}>{t(lang, 'yourProgress')}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: C.gold }}>{coursePct}%</span>
                  </div>
                  <div style={{ background: C.lk30, borderRadius: '10px', height: '7px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ height: '100%', width: `${coursePct}%`, background: `linear-gradient(90deg, ${C.goldD}, ${C.gold})`, borderRadius: '10px', transition: 'width 0.9s' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ fontSize: '12px', color: C.w40 }}>✅ {courseDone} {t(lang, 'completedCount')}</span>
                    <span style={{ fontSize: '12px', color: C.w40 }}>📚 {courseTotal - courseDone} {t(lang, 'remainingCount')}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '12px', color: C.w40, margin: '20px 0 12px' }}>{t(lang, 'courseContent')}</h3>

                {courseLessons.map((lesson, i) => {
                  const completed  = user.progress[lesson.id]
                  const accessible = canAccess(lesson, i)
                  const title    = lang === 'ar' ? (lesson.title || lesson.titleEn) : (lesson.titleEn || lesson.title)
                  const duration = lang === 'ar' ? (lesson.duration || lesson.durationEn) : (lesson.durationEn || lesson.duration)
                  return (
                    <div key={lesson.id} onClick={() => openLesson(lesson, i)} style={{
                      borderRadius: '14px', padding: '14px 16px', marginBottom: '10px',
                      display: 'flex', alignItems: 'center', gap: '14px',
                      cursor: accessible ? 'pointer' : 'default',
                      opacity: accessible ? 1 : 0.35,
                      background: completed ? 'rgba(201,168,76,0.08)' : accessible ? C.surface : 'rgba(13,13,26,0.5)',
                      border: `1px solid ${completed ? C.g30 : accessible ? C.g15 : 'rgba(255,255,255,0.04)'}`,
                      transition: 'all 0.2s',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                        background: completed ? C.g15 : accessible ? 'rgba(30,58,95,0.6)' : 'rgba(14,10,20,0.6)',
                        border: `1px solid ${completed ? C.g30 : accessible ? C.g15 : 'rgba(255,255,255,0.05)'}`,
                      }}>
                        {completed ? '✅' : accessible ? '▶️' : '🔒'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '5px', color: completed ? C.gold : accessible ? C.white : C.silver }}>
                          {i + 1}. {title}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '11px', color: C.w40 }}>⏱ {duration}</span>
                          {lesson.free && <span style={{ fontSize: '10px', background: 'rgba(201,168,76,0.1)', color: C.gold, padding: '2px 8px', borderRadius: '6px', border: `1px solid ${C.g20}` }}>{t(lang, 'free')}</span>}
                          {user.quizScores[lesson.id] != null && <span style={{ fontSize: '10px', background: 'rgba(183,148,244,0.1)', color: C.purple, padding: '2px 8px', borderRadius: '6px' }}>📝 {user.quizScores[lesson.id]}%</span>}
                          {!accessible && <span style={{ fontSize: '10px', color: C.w40, fontStyle: 'italic' }}>{lang === 'ar' ? 'أكمل الدرس السابق أولاً' : 'Complete previous first'}</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── LESSON VIEW ── */}
            {view === 'lesson' && activeLesson && (
              <div style={{ maxWidth: '780px', margin: '0 auto' }} className="fade-in">
                <button onClick={() => setView('lessons')} style={{ ...BTN.back, marginBottom: '16px' }}>{t(lang, 'backBtn')}</button>
                <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${C.g15}` }}>
                  {videoLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.w40, fontSize: '14px', gap: '10px' }}>
                      <div style={VID.spinner} />{t(lang, 'loadingVideo')}
                    </div>
                  )}
                  {videoUrl && (
                    <>
                      <video src={videoUrl} controls controlsList="nodownload" onContextMenu={e => e.preventDefault()} style={{ width: '100%', height: '100%', display: 'block' }} />
                      <div style={VID.watermark}>{user.username}</div>
                    </>
                  )}
                </div>
                <div style={{ padding: '20px 0' }}>
                  <h2 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '10px', color: C.white }}>
                    {lang === 'ar' ? (activeLesson.title || activeLesson.titleEn) : (activeLesson.titleEn || activeLesson.title)}
                  </h2>
                  <p style={{ color: C.w40, fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                    {lang === 'ar' ? (activeLesson.desc || activeLesson.descEn) : (activeLesson.descEn || activeLesson.desc)}
                  </p>
                  {!user.progress[activeLesson.id]
                    ? <button onClick={markComplete} style={BTN.complete}>{t(lang, 'finishLesson')}</button>
                    : <div style={BTN.doneLabel}>{t(lang, 'lessonAlreadyDone')}</div>
                  }
                  <LessonNotes lessonId={activeLesson.id} lang={lang} />
                </div>
              </div>
            )}

            {/* ── QUIZ VIEW ── */}
            {view === 'quiz' && quiz && (
              <div style={{ maxWidth: '600px', margin: '0 auto' }} className="fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                  <span style={{ color: C.gold, fontWeight: '700', fontSize: '15px' }}>{t(lang, 'quizTitle')}</span>
                  <span style={{ color: C.w40, fontSize: '13px' }}>{t(lang, 'question')} {quizStep + 1} {t(lang, 'of')} {quiz.questions.length}</span>
                </div>
                <div style={{ background: C.lk30, borderRadius: '10px', height: '6px', overflow: 'hidden', marginBottom: '28px' }}>
                  <div style={{ height: '100%', background: `linear-gradient(90deg, ${C.goldD}, ${C.gold})`, width: `${(quizStep / quiz.questions.length) * 100}%`, transition: 'width 0.4s' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', lineHeight: 1.7, color: C.white }}>
                  {lang === 'ar' ? quiz.questions[quizStep].q : (quiz.questions[quizStep].qEn || quiz.questions[quizStep].q)}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(lang === 'ar' ? quiz.questions[quizStep].opts : (quiz.questions[quizStep].optsEn || quiz.questions[quizStep].opts))
                    .map((opt, i) => (
                      <button key={i} onClick={() => submitAnswer(i)} style={{
                        width: '100%', padding: '14px 18px', textAlign: 'inherit',
                        background: C.surface, border: `1px solid ${C.g15}`,
                        borderRadius: '12px', color: C.white, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', lineHeight: 1.5,
                      }}>{opt}</button>
                    ))}
                </div>
              </div>
            )}

            {/* ── QUIZ RESULT ── */}
            {view === 'quizResult' && quizResult && (
              <div style={{ textAlign: 'center', maxWidth: '500px', margin: '0 auto' }} className="bounce-in">
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                  {quizResult.score >= 80 ? '🏆' : quizResult.score >= 60 ? '👍' : '💪'}
                </div>
                <div style={{ fontSize: '56px', fontWeight: '900', marginBottom: '8px', color: quizResult.score >= 80 ? C.gold : quizResult.score >= 60 ? C.goldL : C.red }}>
                  {quizResult.score}%
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: C.white, marginBottom: '6px' }}>
                  {quizResult.score >= 80 ? t(lang, 'excellent') : quizResult.score >= 60 ? t(lang, 'good') : t(lang, 'retry')}
                </p>
                <p style={{ color: C.w40, fontSize: '14px', marginBottom: '28px' }}>
                  {quizResult.correct} {t(lang, 'correctFrom')} {quizResult.total}
                </p>
                <button onClick={() => setView('lessons')} style={BTN.complete}>{t(lang, 'backToLessons')}</button>
              </div>
            )}

            {/* ── PROFILE VIEW ── */}
            {view === 'profile' && (
              <ProfileView user={user} lang={lang} COURSES_DATA={COURSES_DATA} onUserUpdate={handleUserUpdate} />
            )}

          </div>
        </div>
      </div>
    </>
  )
}

// ─── getServerSideProps (unchanged) ───────────────────────────────────────
export async function getServerSideProps({ req }) {
  const { parse } = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getUser } = await import('../lib/users-store')
  const cookies = parse(req.headers.cookie || '')
  const token = cookies['ba_session']
  if (!token) return { redirect: { destination: '/', permanent: false } }
  const session = verifyToken(token)
  if (!session) return { redirect: { destination: '/', permanent: false } }
  const user = await getUser(session.username)
  if (!user || user.role !== 'student') {
    if (user?.role === 'admin') return { redirect: { destination: '/admin', permanent: false } }
    return { redirect: { destination: '/', permanent: false } }
  }
  return {
    props: {
      initialUser: {
        username: session.username, name: user.name, avatar: user.avatar,
        role: user.role, progress: user.progress || {}, quizScores: user.quizScores || {},
        allowedCourse: user.allowedCourse || 'basic',
        phone:  user.phone  || '',
        gender: user.gender || '',
        photo:  user.photo  || '',
      }
    }
  }
}

// ─── Style Constants ───────────────────────────────────────────────────────
const BTN = {
  back: {
    display: 'inline-flex', alignItems: 'center',
    background: 'none', border: `1px solid ${C.g20}`,
    borderRadius: '10px', color: C.silver, padding: '7px 16px',
    cursor: 'pointer', fontSize: '13px', marginBottom: '16px', fontWeight: '600',
  },
  complete: {
    width: '100%', padding: '14px',
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
    border: 'none', borderRadius: '14px',
    color: C.navy, fontSize: '15px', fontWeight: '900', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(201,168,76,0.3)', transition: 'transform 0.15s',
  },
  doneLabel: {
    textAlign: 'center', padding: '13px',
    background: C.g10, border: `1px solid ${C.g20}`,
    borderRadius: '14px', color: C.gold, fontSize: '14px', fontWeight: '700',
  }
}

const VID = {
  spinner: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: `2px solid ${C.g20}`, borderTopColor: C.gold,
    animation: 'spin 0.8s linear infinite',
  },
  watermark: {
    position: 'absolute', bottom: '50px', left: '14px',
    fontSize: '10px', color: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none', userSelect: 'none', zIndex: 2, fontFamily: 'monospace',
  }
}

const OVL = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(13,13,26,0.88)', backdropFilter: 'blur(8px)', padding: '1.5rem',
  },
  modal: {
    background: C.surface, border: `1px solid ${C.g30}`,
    borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%', textAlign: 'center',
    boxShadow: '0 0 60px rgba(201,168,76,0.15)',
  },
  celebIcon: { fontSize: '64px', marginBottom: '1rem', display: 'block' },
  celebTitle: { fontSize: '26px', fontWeight: '900', color: C.gold, marginBottom: '8px' },
  celebMsg: { fontSize: '15px', color: C.w50 },
  primaryBtn: {
    width: '100%', padding: '13px',
    background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
    border: 'none', borderRadius: '12px', color: C.navy,
    fontSize: '15px', fontWeight: '900', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(201,168,76,0.3)',
  },
  secondaryBtn: {
    width: '100%', padding: '12px',
    background: 'transparent', border: `1px solid ${C.g20}`,
    borderRadius: '12px', color: C.w50, fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  }
}

const CERT = {
  overlay: { position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(8px)', zIndex: -1 },
  wrapper: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '600px' },
  paper: { width: '100%', background: '#0a0614', borderRadius: '4px', boxShadow: `0 0 60px rgba(201,168,76,0.2)` },
  outerBorder: { border: `3px solid ${C.gold}`, borderRadius: '4px', padding: '6px' },
  innerBorder: { border: `1px solid ${C.g30}`, borderRadius: '2px', padding: '2.5rem 2rem', textAlign: 'center' },
  topDeco: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  decoLine: { flex: 1, height: '1px', background: `linear-gradient(90deg,transparent,${C.g30},transparent)` },
  decoStar: { color: C.gold, fontSize: '14px' },
  platformName: { fontSize: '20px', fontWeight: '900', color: C.gold, fontFamily: 'Inter,sans-serif', letterSpacing: '2px', marginBottom: '6px' },
  platformSub: { fontSize: '11px', color: C.w40, marginBottom: '16px' },
  divider: { width: '80px', height: '2px', margin: '14px auto', background: `linear-gradient(90deg,transparent,${C.gold},transparent)` },
  dividerThin: { width: '40px', height: '1px', margin: '10px auto', background: C.g30 },
  certLabel: { fontSize: '22px', fontWeight: '900', color: C.white, letterSpacing: '1px' },
  bodyText: { color: C.w50, lineHeight: 1.8 },
  studentName: { fontSize: '26px', fontWeight: '900', color: C.gold, margin: '10px 0' },
  courseName: { fontSize: '16px', fontWeight: '700', color: C.white, margin: '6px 0 14px' },
  hoursBox: { display: 'inline-block', padding: '8px 24px', border: `1px solid rgba(201,168,76,0.35)`, borderRadius: '30px', background: 'rgba(201,168,76,0.06)', margin: '8px auto' },
  hoursText: { fontSize: '13px', color: C.gold, fontWeight: '700' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' },
  footerItem: { textAlign: 'center', flex: 1 },
  footerLabel: { fontSize: '10px', color: C.w40, marginBottom: '4px' },
  footerValue: { fontSize: '12px', fontWeight: '700', color: C.w50 },
  footerSeal: { flex: 1, display: 'flex', justifyContent: 'center' },
  sealCircle: { width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${C.g30}`, background: C.g10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actions: { display: 'flex', gap: '12px', width: '100%' },
  printBtn: { flex: 1, padding: '12px', background: `linear-gradient(135deg,${C.gold},${C.goldD})`, border: 'none', borderRadius: '12px', color: C.navy, fontSize: '14px', fontWeight: '900', cursor: 'pointer' },
  closeBtn: { flex: 1, padding: '12px', background: C.surface, border: `1px solid ${C.g20}`, borderRadius: '12px', color: C.w50, fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
}
