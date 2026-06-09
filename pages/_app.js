import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { Cairo } from 'next/font/google'
import '../styles/globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  display: 'swap',
  variable: '--font-cairo',
})

export const LangContext = createContext({ lang: 'ar', setLang: () => {} })

export function useLang() {
  return useContext(LangContext)
}

// ===== MOUSE GLOW =====
function MouseGlow() {
  const glowRef = useRef(null)
  const pos = useRef({ x: -999, y: -999 })
  const current = useRef({ x: -999, y: -999 })
  const raf = useRef(null)

  useEffect(() => {
    function onMove(e) {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    function animate() {
      // Smooth lerp — يتبع المؤشر ببطء ناعم
      current.current.x += (pos.current.x - current.current.x) * 0.07
      current.current.y += (pos.current.y - current.current.y) * 0.07

      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`
      }

      raf.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return (
    <div
      ref={glowRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(184,107,255,0.07) 0%, rgba(184,107,255,0.03) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
        mixBlendMode: 'screen',
      }}
    />
  )
}

export default function App({ Component, pageProps }) {
  const [lang, setLang] = useState('ar')

  useEffect(() => {
    const saved = localStorage.getItem('cba_lang') || 'ar'
    setLang(saved)
  }, [])

  function handleSetLang(l) {
    setLang(l)
    localStorage.setItem('cba_lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang: handleSetLang }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={cairo.className} style={{ minHeight: '100vh', position: 'relative', fontFamily: 'Cairo, Tajawal, sans-serif' }}>
        <MouseGlow />
        <Component {...pageProps} />
      </div>
    </LangContext.Provider>
  )
}
