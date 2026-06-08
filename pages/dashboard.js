import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useLang } from './_app'
import { t } from '../lib/i18n'

const CONFETTI_COLORS = ['#B86BFF', '#FFB86B', '#F0EAF5', '#FF6B9D', '#6BBBFF', '#A78BFA', '#FFD166']

function Confetti({ intensity = 80 }) {
  const particles = useMemo(() => Array.from({ length: intensity }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.6,
    duration: 1.8 + Math.random() * 1.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 9,
    circle: Math.random() > 0.5,
  })), [intensity])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998, overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: '-20px',
          width: p.size, height: p.size,
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
      <div style={CS.overlay}>
        <div style={CS.modal} className="bounce-in">
          <div style={CS.celebIcon} className="float">🎉</div>
          <h2 style={CS.celebTitle}>{t(lang, 'lessonCelebTitle')}</h2>
          <p style={CS.celebMsg}>{t(lang, 'lessonCelebMsg')}</p>
          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', marginTop: '1.5rem' }}>
            {!isLast && (
              <button onClick={onNext} style={CS.primaryBtn}>{t(lang, 'nextLessonBtn')}</button>
            )}
            <button onClick={onBack} style={CS.secondaryBtn}>{t(lang, 'backToLessonsBtn')}</button>
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
      <div style={CS.overlay}>
        <div style={{ ...CS.modal, maxWidth: '480px', textAlign: 'center', padding: '3rem 2rem' }} className="bounce-in">
          <div style={{ fontSize: '80px', marginBottom: '1rem' }} className="float">🏆</div>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#B86BFF', marginBottom: '8px' }}>
            {t(lang, 'courseCompleted')}
          </h2>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#F0EAF5', marginBottom: '6px' }}>
            {t(lang, 'congratulations')}, {user.name.split(' ')[0]}!
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(240,234,245,0.5)', marginBottom: '2rem' }}>
            {t(lang, 'courseCompletedMsg')}
          </p>
          <button onClick={onViewCert} style={{ ...CS.primaryBtn, marginBottom: '12px' }}>
            {t(lang, 'viewCertificate')}
          </button>
          <button onClick={onBack} style={CS.secondaryBtn}>{t(lang, 'backToCoursesBtn')}</button>
        </div>
      </div>
    </>
  )
}

function Certificate({ lang, user, courseData, onClose }) {
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
  const courseName = lang === 'ar' ? courseData.nameAr : courseData.nameEn

  return (
    <div style={CERT.overlay}>
      <div style={CERT.backdrop} onClick={onClose} />
      <div style={CERT.wrapper} className="fade-in">
        <div id="certificate-print-area" style={CERT.paper}>
          <div style={CERT.outerBorder}>
            <div style={CERT.innerBorder}>
              <div style={CERT.topDeco}>
                <div style={CERT.decoLine} /><span style={CERT.decoStar}>✦</span><div style={CERT.decoLine} />
              </div>
              <div style={CERT.platformName}>COACHBASHARALASALI</div>
              <div style={CERT.platformSub}>{lang === 'ar' ? 'منصة تجارة eBay الاحترافية' : 'Professional eBay Trading Platform'}</div>
              <div style={CERT.divider} />
              <p style={CERT.certLabel}>{t(lang, 'certificateTitle')}</p>
              <div style={CERT.dividerThin} />
              <p style={{ ...CERT.bodyText, fontSize: '14px' }}>{t(lang, 'certifiedText')}</p>
              <div style={CERT.studentName}>{user.name}</div>
              <p style={{ ...CERT.bodyText, fontSize: '14px', marginTop: '10px' }}>{t(lang, 'completedCourse')}</p>
              <div style={CERT.courseName}>{courseName}</div>
              <div style={CERT.hoursBox}>
                <span style={CERT.hoursText}>⏱ {t(lang, 'totalHoursLabel')}</span>
              </div>
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
              <div style={{ ...CERT.topDeco, marginTop: '20px' }}>
                <div style={CERT.decoLine} /><span style={CERT.decoStar}>✦</span><div style={CERT.decoLine} />
              </div>
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

function LangToggle({ lang, setLang }) {
  return (
    <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{
      background: 'rgba(184,107,255,0.08)', border: '1px solid rgba(184,107,255,0.25)',
      borderRadius: '8px', color: '#B86BFF', padding: '5px 12px',
      fontSize: '12px', fontWeight: '700', cursor: 'pointer'
    }}>
      {t(lang, 'langToggle')}
    </button>
  )
}

export default function Dashboard({ initialUser }) {
  const router = useRouter()
  const { lang, setLang } = useLang()
  const [user, setUser] = useState(initialUser)
  const [lessons, setLessons] = useState([])
  const [view, setView] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState([])
  const [quizResult, setQuizResult] = useState(null)
  const [showLessonCeleb, setShowLessonCeleb] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [celebNextIdx, setCelebNextIdx] = useState(null)
  const [COURSES_DATA, setCoursesData] = useState(null)

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
    const courseIds = COURSES_DATA[selectedCourse]?.lessons || []
    return lessons.filter(l => courseIds.includes(l.id))
  }, [COURSES_DATA, selectedCourse, lessons])

  const courseDone = courseLessons.filter(l => user.progress[l.id]).length
  const courseTotal = courseLessons.length
  const coursePct = courseTotal ? Math.round((courseDone / courseTotal) * 100) : 0

  function canAccess(lesson, indexInCourse) {
    if (indexInCourse === 0) return true
    const prev = courseLessons[indexInCourse - 1]
    return prev && user.progress[prev.id]
  }

  async function openLesson(lesson, indexInCourse) {
    if (!canAccess(lesson, indexInCourse)) return
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
      setQuiz(data.quiz)
      setQuizStep(0); setQuizAnswers([]); setQuizResult(null)
      setView('quiz')
    } else {
      triggerLessonCelebration(newProgress)
    }
  }

  function triggerLessonCelebration(progress) {
    const idx = courseLessons.findIndex(l => l.id === activeLesson.id)
    setCelebNextIdx(idx + 1 < courseLessons.length ? idx + 1 : null)
    const courseIds = COURSES_DATA?.[selectedCourse]?.lessons || []
    const allDone = courseIds.every(id => progress[id])
    if (allDone) { setShowCompletion(true) } else { setShowLessonCeleb(true) }
  }

  async function submitAnswer(answerIdx) {
    const newAnswers = [...quizAnswers, answerIdx]
    setQuizAnswers(newAnswers)
    if (newAnswers.length === quiz.questions.length) {
      const res = await fetch(`/api/quiz/${activeLesson.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: newAnswers })
      })
      const data = await res.json()
      setQuizResult(data)
      setUser(u => ({ ...u, quizScores: { ...u.quizScores, [activeLesson.id]: data.score } }))
      setView('quizResult')
      const updatedProgress = { ...user.progress, [activeLesson.id]: true }
      triggerLessonCelebration(updatedProgress)
    } else {
      setQuizStep(quizStep + 1)
    }
  }

  const courseData = COURSES_DATA?.[selectedCourse]

  return (
    <>
      <Head><title>COACHBASHARALASALI</title><meta name="robots" content="noindex" /></Head>

      {showLessonCeleb && (
        <LessonCelebration
          lang={lang} isLast={celebNextIdx === null}
          onNext={() => {
            setShowLessonCeleb(false)
            if (celebNextIdx !== null) openLesson(courseLessons[celebNextIdx], celebNextIdx)
            else setView('lessons')
          }}
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

      <div style={{ minHeight: '100vh', background: '#0E0A14' }}>
        {/* NAV */}
        <nav style={NAV.bar}>
          <div style={NAV.brand}>
            <span style={{ fontSize: '20px' }}>🏪</span>
            <span style={NAV.brandName}>COACHBASHARALASALI</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LangToggle lang={lang} setLang={setLang} />
            <div style={NAV.avatar}>{user.avatar}</div>
            <span style={{ fontSize: '13px', color: '#F0EAF5' }}>{user.name.split(' ')[0]}</span>
            <button onClick={logout} style={NAV.logoutBtn}>{t(lang, 'logout')}</button>
          </div>
        </nav>

        {/* COURSES VIEW */}
        {view === 'courses' && COURSES_DATA && (
          <div style={{ padding: '2rem 1.5rem', maxWidth: '680px', margin: '0 auto' }} className="fade-in">
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#F0EAF5', marginBottom: '6px' }}>
                {t(lang, 'chooseCourse')}
              </h2>
              <p style={{ color: 'rgba(240,234,245,0.45)', fontSize: '14px' }}>{t(lang, 'courseSubtitle')}</p>
            </div>

            {Object.values(COURSES_DATA).map(course => {
              const isAllowed = user.allowedCourse === course.id
              const name = lang === 'ar' ? course.nameAr : course.nameEn
              const desc = lang === 'ar' ? course.descAr : course.descEn
              const courseIds = course.lessons
              const done = courseIds.filter(id => user.progress[id]).length
              const pct = courseIds.length ? Math.round((done / courseIds.length) * 100) : 0

              return (
                <div key={course.id}
                  onClick={() => isAllowed && (setSelectedCourse(course.id), setView('lessons'))}
                  style={{
                    ...CARD.course,
                    cursor: isAllowed ? 'pointer' : 'not-allowed',
                    opacity: isAllowed ? 1 : 0.4,
                    border: isAllowed ? '1px solid rgba(184,107,255,0.4)' : '1px solid rgba(240,234,245,0.07)',
                    boxShadow: isAllowed ? '0 0 30px rgba(184,107,255,0.08)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{
                      ...CARD.courseIcon,
                      background: isAllowed ? 'linear-gradient(135deg,#2B1B3A,#1a0f28)' : 'rgba(255,255,255,0.03)',
                      border: isAllowed ? '1px solid rgba(184,107,255,0.35)' : '1px solid rgba(255,255,255,0.05)',
                      boxShadow: isAllowed ? '0 0 16px rgba(184,107,255,0.2)' : 'none'
                    }}>
                      {course.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: isAllowed ? '#F0EAF5' : 'rgba(240,234,245,0.35)' }}>
                          {name}
                        </span>
                        {isAllowed && <span style={CARD.activeBadge}>✓ {lang === 'ar' ? 'مفعّل' : 'Active'}</span>}
                      </div>
                      <p style={{ fontSize: '13px', color: 'rgba(240,234,245,0.45)', marginBottom: '10px', lineHeight: '1.6' }}>{desc}</p>
                      {isAllowed ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', color: 'rgba(240,234,245,0.4)' }}>{t(lang, 'yourProgress')}</span>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#B86BFF' }}>{pct}%</span>
                          </div>
                          <div style={CARD.progressBar}>
                            <div style={{ ...CARD.progressFill, width: `${pct}%` }} />
                          </div>
                          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                            <span style={CARD.enterBtn}>{t(lang, 'enterCourse')}</span>
                          </div>
                        </>
                      ) : (
                        <span style={CARD.lockedBadge}>{t(lang, 'lockedCourse')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* WhatsApp */}
            <div style={WA.section}>
              <div style={WA.divider}>
                <div style={WA.divLine} />
                <span style={WA.divText}>{lang === 'ar' ? 'التواصل المباشر' : 'Direct Contact'}</span>
                <div style={WA.divLine} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <a href="https://wa.me/00962790360675" target="_blank" rel="noreferrer" style={WA.btn}>
                  <span style={WA.waIcon}>💬</span>
                  <div>
                    <div style={WA.btnTitle}>{t(lang, 'contactCoach')}</div>
                    <div style={WA.btnSub}>{t(lang, 'whatsappHint')}</div>
                  </div>
                </a>
                <a href="https://wa.me/00962792112207" target="_blank" rel="noreferrer" style={WA.btn}>
                  <span style={WA.waIcon}>🎯</span>
                  <div>
                    <div style={WA.btnTitle}>{t(lang, 'contactAdvisor')}</div>
                    <div style={WA.btnSub}>{t(lang, 'whatsappHint')}</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* LESSONS VIEW */}
        {view === 'lessons' && courseData && (
          <div style={{ padding: '1.5rem', maxWidth: '640px', margin: '0 auto' }} className="fade-in">
            <button onClick={() => { setView('courses'); setSelectedCourse(null) }} style={BTN.back}>
              {t(lang, 'backToCourses')}
            </button>
            <div style={LESSON.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>{courseData.icon}</span>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#F0EAF5' }}>
                    {lang === 'ar' ? courseData.nameAr : courseData.nameEn}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'rgba(240,234,245,0.4)' }}>{user.name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(240,234,245,0.45)' }}>{t(lang, 'yourProgress')}</span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#B86BFF' }}>{coursePct}%</span>
              </div>
              <div style={LESSON.progressBar}>
                <div style={{ ...LESSON.progressFill, width: `${coursePct}%` }} />
              </div>
              <div style={{ display: 'flex', gap: '1.2rem', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', color: 'rgba(240,234,245,0.4)' }}>✅ {courseDone} {t(lang, 'completedCount')}</span>
                <span style={{ fontSize: '12px', color: 'rgba(240,234,245,0.4)' }}>📚 {courseTotal - courseDone} {t(lang, 'remainingCount')}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '13px', color: 'rgba(240,234,245,0.4)', margin: '1.5rem 0 1rem' }}>
              {t(lang, 'courseContent')}
            </h3>

            {courseLessons.map((lesson, i) => {
              const completed = user.progress[lesson.id]
              const accessible = canAccess(lesson, i)
              const title = lang === 'ar' ? (lesson.title || lesson.titleEn) : (lesson.titleEn || lesson.title)
              const duration = lang === 'ar' ? (lesson.duration || lesson.durationEn) : (lesson.durationEn || lesson.duration)
              return (
                <div key={lesson.id} onClick={() => openLesson(lesson, i)} style={{
                  ...LESSON.card,
                  cursor: accessible ? 'pointer' : 'default',
                  opacity: accessible ? 1 : 0.3,
                  background: completed ? 'rgba(184,107,255,0.07)' : accessible ? 'rgba(43,27,58,0.45)' : 'rgba(14,10,20,0.5)',
                  border: completed ? '1px solid rgba(184,107,255,0.35)' : accessible ? '1px solid rgba(184,107,255,0.12)' : '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    ...LESSON.icon,
                    background: completed ? 'rgba(184,107,255,0.18)' : accessible ? 'rgba(43,27,58,0.9)' : 'rgba(14,10,20,0.6)',
                    border: completed ? '1px solid rgba(184,107,255,0.4)' : accessible ? '1px solid rgba(184,107,255,0.15)' : '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {completed ? '✅' : accessible ? '▶️' : '🔒'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '5px', color: completed ? '#B86BFF' : accessible ? '#F0EAF5' : 'rgba(240,234,245,0.3)' }}>
                      {i + 1}. {title}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(240,234,245,0.38)' }}>⏱ {duration}</span>
                      {lesson.free && <span style={LESSON.freeBadge}>{t(lang, 'free')}</span>}
                      {user.quizScores[lesson.id] != null && <span style={LESSON.scoreBadge}>📝 {user.quizScores[lesson.id]}%</span>}
                      {!accessible && <span style={LESSON.lockBadge}>{lang === 'ar' ? 'أكمل الدرس السابق أولاً' : 'Complete previous lesson first'}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* LESSON VIEW */}
        {view === 'lesson' && activeLesson && (
          <div style={{ maxWidth: '740px', margin: '0 auto' }} className="fade-in">
            <button onClick={() => setView('lessons')} style={{ ...BTN.back, margin: '1rem 1.5rem' }}>
              {t(lang, 'backBtn')}
            </button>
            <div style={{ position: 'relative', background: '#0E0A14', aspectRatio: '16/9' }}>
              {videoLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,234,245,0.45)', fontSize: '14px', gap: '10px' }}>
                  <div style={VID.spinner} />{t(lang, 'loadingVideo')}
                </div>
              )}
              {videoUrl && (
                <>
                  <video src={videoUrl} controls controlsList="nodownload"
                    onContextMenu={e => e.preventDefault()}
                    style={{ width: '100%', height: '100%', display: 'block' }} />
                  <div style={VID.watermark}>{user.username}</div>
                </>
              )}
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '8px', color: '#F0EAF5' }}>
                {lang === 'ar' ? (activeLesson.title || activeLesson.titleEn) : (activeLesson.titleEn || activeLesson.title)}
              </h2>
              <p style={{ color: 'rgba(240,234,245,0.45)', fontSize: '14px', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                {lang === 'ar' ? (activeLesson.desc || activeLesson.descEn) : (activeLesson.descEn || activeLesson.desc)}
              </p>
              {!user.progress[activeLesson.id] ? (
                <button onClick={markComplete} style={BTN.complete}>{t(lang, 'finishLesson')}</button>
              ) : (
                <div style={BTN.doneLabel}>{t(lang, 'lessonAlreadyDone')}</div>
              )}
            </div>
          </div>
        )}

        {/* QUIZ VIEW */}
        {view === 'quiz' && quiz && (
          <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }} className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <span style={{ color: '#B86BFF', fontWeight: '700', fontSize: '15px' }}>{t(lang, 'quizTitle')}</span>
              <span style={{ color: 'rgba(240,234,245,0.4)', fontSize: '13px' }}>{t(lang, 'question')} {quizStep + 1} {t(lang, 'of')} {quiz.questions.length}</span>
            </div>
            <div style={QUIZ.bar}><div style={{ ...QUIZ.fill, width: `${(quizStep / quiz.questions.length) * 100}%` }} /></div>
            <h3 style={QUIZ.question}>
              {lang === 'ar' ? quiz.questions[quizStep].q : (quiz.questions[quizStep].qEn || quiz.questions[quizStep].q)}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(lang === 'ar' ? quiz.questions[quizStep].opts : (quiz.questions[quizStep].optsEn || quiz.questions[quizStep].opts))
                .map((opt, i) => (
                  <button key={i} onClick={() => submitAnswer(i)} style={QUIZ.option}>{opt}</button>
                ))}
            </div>
          </div>
        )}

        {/* QUIZ RESULT */}
        {view === 'quizResult' && quizResult && (
          <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }} className="bounce-in">
            <div style={{ fontSize: '64px', marginBottom: '1rem' }}>
              {quizResult.score >= 80 ? '🏆' : quizResult.score >= 60 ? '👍' : '💪'}
            </div>
            <div style={{ fontSize: '56px', fontWeight: '900', marginBottom: '8px', color: quizResult.score >= 80 ? '#B86BFF' : quizResult.score >= 60 ? '#FFB86B' : '#FF4757' }}>
              {quizResult.score}%
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#F0EAF5', marginBottom: '6px' }}>
              {quizResult.score >= 80 ? t(lang, 'excellent') : quizResult.score >= 60 ? t(lang, 'good') : t(lang, 'retry')}
            </p>
            <p style={{ color: 'rgba(240,234,245,0.4)', fontSize: '14px', marginBottom: '2rem' }}>
              {quizResult.correct} {t(lang, 'correctFrom')} {quizResult.total}
            </p>
            <button onClick={() => setView('lessons')} style={BTN.complete}>{t(lang, 'backToLessons')}</button>
          </div>
        )}
      </div>
    </>
  )
}

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
        allowedCourse: user.allowedCourse || 'basic'
      }
    }
  }
}

const NAV = {
  bar: {
    background: 'rgba(43,27,58,0.55)', borderBottom: '1px solid rgba(184,107,255,0.12)',
    backdropFilter: 'blur(20px)', padding: '0 1.5rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '60px', position: 'sticky', top: 0, zIndex: 100
  },
  brand: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandName: { color: '#B86BFF', fontWeight: '900', fontSize: '14px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.5px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#2B1B3A,#1a0f28)',
    border: '1px solid rgba(184,107,255,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '700', color: '#B86BFF'
  },
  logoutBtn: {
    background: 'none', border: '1px solid rgba(240,234,245,0.1)',
    borderRadius: '8px', color: 'rgba(240,234,245,0.4)', padding: '5px 12px',
    cursor: 'pointer', fontSize: '12px'
  }
}

const CARD = {
  course: {
    background: 'rgba(43,27,58,0.35)', borderRadius: '18px', padding: '1.3rem',
    marginBottom: '14px', transition: 'all 0.25s'
  },
  courseIcon: {
    width: '54px', height: '54px', borderRadius: '14px', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
  },
  activeBadge: {
    fontSize: '10px', background: 'rgba(184,107,255,0.12)', color: '#B86BFF',
    padding: '3px 9px', borderRadius: '20px', border: '1px solid rgba(184,107,255,0.3)', fontWeight: '700'
  },
  lockedBadge: {
    fontSize: '11px', color: 'rgba(240,234,245,0.25)', background: 'rgba(255,255,255,0.02)',
    padding: '4px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-block'
  },
  enterBtn: { fontSize: '13px', color: '#FFB86B', fontWeight: '700' },
  progressBar: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', height: '6px', overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#2B1B3A,#B86BFF)', height: '100%', borderRadius: '10px', transition: 'width 0.8s ease' }
}

const WA = {
  section: { marginTop: '2rem' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  divLine: { flex: 1, height: '1px', background: 'rgba(240,234,245,0.07)' },
  divText: { fontSize: '12px', color: 'rgba(240,234,245,0.3)', whiteSpace: 'nowrap' },
  btn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
    background: 'rgba(43,27,58,0.45)', border: '1px solid rgba(184,107,255,0.15)',
    borderRadius: '14px', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer'
  },
  waIcon: { fontSize: '22px', flexShrink: 0 },
  btnTitle: { fontSize: '12px', fontWeight: '700', color: '#F0EAF5', marginBottom: '3px', lineHeight: '1.4' },
  btnSub: { fontSize: '10px', color: 'rgba(240,234,245,0.35)' }
}

const LESSON = {
  header: {
    background: 'rgba(43,27,58,0.35)', border: '1px solid rgba(184,107,255,0.12)',
    borderRadius: '16px', padding: '1.2rem', marginBottom: '4px'
  },
  progressBar: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', height: '7px', overflow: 'hidden' },
  progressFill: { background: 'linear-gradient(90deg,#2B1B3A,#B86BFF)', height: '100%', borderRadius: '10px', transition: 'width 0.9s ease' },
  card: { borderRadius: '14px', padding: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' },
  icon: { width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
  freeBadge: { fontSize: '10px', background: 'rgba(255,184,107,0.12)', color: '#FFB86B', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(255,184,107,0.25)' },
  scoreBadge: { fontSize: '10px', background: 'rgba(184,107,255,0.1)', color: '#B86BFF', padding: '2px 8px', borderRadius: '6px' },
  lockBadge: { fontSize: '10px', color: 'rgba(240,234,245,0.25)', fontStyle: 'italic' }
}

const BTN = {
  back: {
    display: 'inline-flex', alignItems: 'center',
    background: 'none', border: '1px solid rgba(184,107,255,0.15)',
    borderRadius: '10px', color: 'rgba(240,234,245,0.55)', padding: '7px 16px',
    cursor: 'pointer', fontSize: '13px', marginBottom: '1rem'
  },
  complete: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg,#B86BFF,#9B4FE8)',
    border: 'none', borderRadius: '14px',
    color: '#fff', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(184,107,255,0.3)', transition: 'transform 0.15s'
  },
  doneLabel: {
    textAlign: 'center', padding: '13px',
    background: 'rgba(184,107,255,0.08)', border: '1px solid rgba(184,107,255,0.2)',
    borderRadius: '14px', color: '#B86BFF', fontSize: '14px', fontWeight: '700'
  }
}

const QUIZ = {
  bar: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', height: '6px', overflow: 'hidden', marginBottom: '2rem' },
  fill: { background: 'linear-gradient(90deg,#2B1B3A,#B86BFF)', height: '100%', borderRadius: '10px', transition: 'width 0.4s' },
  question: { fontSize: '18px', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.7', color: '#F0EAF5' },
  option: {
    width: '100%', padding: '15px 18px', textAlign: 'inherit',
    background: 'rgba(43,27,58,0.4)', border: '1px solid rgba(184,107,255,0.1)',
    borderRadius: '12px', color: '#F0EAF5', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s', lineHeight: '1.5'
  }
}

const VID = {
  spinner: {
    width: '20px', height: '20px', borderRadius: '50%',
    border: '2px solid rgba(184,107,255,0.2)', borderTopColor: '#B86BFF',
    animation: 'spin 0.8s linear infinite'
  },
  watermark: {
    position: 'absolute', bottom: '50px', left: '14px',
    fontSize: '10px', color: 'rgba(255,255,255,0.1)',
    pointerEvents: 'none', userSelect: 'none', zIndex: 2, fontFamily: 'monospace'
  }
}

const CS = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(14,10,20,0.88)', backdropFilter: 'blur(8px)', padding: '1.5rem'
  },
  modal: {
    background: 'rgba(43,27,58,0.97)', border: '1px solid rgba(184,107,255,0.4)',
    borderRadius: '24px', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%', textAlign: 'center',
    boxShadow: '0 0 60px rgba(184,107,255,0.18)'
  },
  celebIcon: { fontSize: '64px', marginBottom: '1rem', display: 'block' },
  celebTitle: { fontSize: '26px', fontWeight: '900', color: '#B86BFF', marginBottom: '8px' },
  celebMsg: { fontSize: '15px', color: 'rgba(240,234,245,0.6)' },
  primaryBtn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg,#B86BFF,#9B4FE8)',
    border: 'none', borderRadius: '12px', color: '#fff',
    fontSize: '15px', fontWeight: '800', cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(184,107,255,0.3)'
  },
  secondaryBtn: {
    width: '100%', padding: '12px',
    background: 'transparent', border: '1px solid rgba(184,107,255,0.2)',
    borderRadius: '12px', color: 'rgba(240,234,245,0.55)', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
}

const CERT = {
  overlay: { position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto' },
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(14,10,20,0.94)', backdropFilter: 'blur(8px)', zIndex: -1 },
  wrapper: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', width: '100%', maxWidth: '600px' },
  paper: { width: '100%', background: '#120a1e', borderRadius: '4px', boxShadow: '0 0 60px rgba(184,107,255,0.2)' },
  outerBorder: { border: '3px solid #B86BFF', borderRadius: '4px', padding: '6px' },
  innerBorder: { border: '1px solid rgba(184,107,255,0.35)', borderRadius: '2px', padding: '2.5rem 2rem', textAlign: 'center' },
  topDeco: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  decoLine: { flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(184,107,255,0.5),transparent)' },
  decoStar: { color: '#B86BFF', fontSize: '14px' },
  platformName: { fontSize: '20px', fontWeight: '900', color: '#B86BFF', fontFamily: 'Inter, sans-serif', letterSpacing: '2px', marginBottom: '6px' },
  platformSub: { fontSize: '11px', color: 'rgba(240,234,245,0.4)', marginBottom: '16px' },
  divider: { width: '80px', height: '2px', margin: '14px auto', background: 'linear-gradient(90deg,transparent,#B86BFF,transparent)' },
  dividerThin: { width: '40px', height: '1px', margin: '10px auto', background: 'rgba(184,107,255,0.3)' },
  certLabel: { fontSize: '22px', fontWeight: '900', color: '#F0EAF5', letterSpacing: '1px' },
  bodyText: { color: 'rgba(240,234,245,0.5)', lineHeight: '1.8' },
  studentName: { fontSize: '26px', fontWeight: '900', color: '#B86BFF', margin: '10px 0' },
  courseName: { fontSize: '16px', fontWeight: '700', color: '#F0EAF5', margin: '6px 0 14px' },
  hoursBox: { display: 'inline-block', padding: '8px 24px', border: '1px solid rgba(255,184,107,0.35)', borderRadius: '30px', background: 'rgba(255,184,107,0.06)', margin: '8px auto' },
  hoursText: { fontSize: '13px', color: '#FFB86B', fontWeight: '700' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' },
  footerItem: { textAlign: 'center', flex: 1 },
  footerLabel: { fontSize: '10px', color: 'rgba(240,234,245,0.3)', marginBottom: '4px' },
  footerValue: { fontSize: '12px', fontWeight: '700', color: 'rgba(240,234,245,0.65)' },
  footerSeal: { flex: 1, display: 'flex', justifyContent: 'center' },
  sealCircle: { width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(184,107,255,0.5)', background: 'rgba(184,107,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  actions: { display: 'flex', gap: '12px', width: '100%' },
  printBtn: { flex: 1, padding: '12px', background: 'linear-gradient(135deg,#B86BFF,#9B4FE8)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '14px', fontWeight: '800', cursor: 'pointer' },
  closeBtn: { flex: 1, padding: '12px', background: 'rgba(43,27,58,0.6)', border: '1px solid rgba(184,107,255,0.2)', borderRadius: '12px', color: 'rgba(240,234,245,0.55)', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
}
