import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'

// ─── YouTube video ID ──────────────────────────────────────────────────────
// ⚠️  ضع هنا معرّف فيديو YouTube بعد رفعه
// مثال: إذا الرابط https://youtube.com/watch?v=abc123  →  YT_ID = 'abc123'
const YT_ID = '' // أضف الـ ID هنا

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [lang,     setLang]     = useState('ar')
  const [playing,  setPlaying]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('bashar_lang') || 'ar'
    setLang(saved)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intersection observer for reveal animations
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.animationDelay = (i % 3 * 70) + 'ms'
      io.observe(el)
    })
    setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in')), 1400)
    return () => io.disconnect()
  }, [])

  function switchLang(l) {
    setLang(l)
    localStorage.setItem('bashar_lang', l)
  }

  const ar = lang === 'ar'

  // i18n helper
  const tx = (arText, enText) => ar ? arText : enText

  return (
    <>
      <Head>
        <title>{tx('بشار العسلي · أكاديمية تجارة eBay', 'Bashar Al-Asali · eBay Academy')}</title>
        <meta name="description" content={tx('تعلّم التجارة الإلكترونية على eBay مع الكوتش بشار العسلي — منهج عملي ومتابعة حقيقية', 'Learn eBay trading with Coach Bashar Al-Asali — practical method and real mentorship')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@400;500;600;700&family=Tajawal:wght@300;400;500;700;800&family=Cormorant+Garamond:ital,wght@0,500;1,500;1,600&display=swap" rel="stylesheet" />
      </Head>

      <style jsx global>{`
        :root{
          --bg:#0a0a0b;--bg2:#111013;--bg3:#16151a;
          --line:rgba(202,162,83,0.20);--line-soft:rgba(244,239,228,0.08);
          --gold:#caa253;--gold-2:#e7cd8f;--gold-deep:#9a7a35;
          --ink:#f4efe4;--muted:#9c958a;--muted-2:#736d64;--maxw:1240px;
        }
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--ink);font-family:'Tajawal',system-ui,sans-serif;
          font-weight:400;line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        h1,h2,h3,h4{font-family:'El Messiri',serif;font-weight:600;line-height:1.18;letter-spacing:-0.01em}
        .en{font-family:'Cormorant Garamond',serif;font-style:italic;letter-spacing:0.01em}
        a{color:inherit;text-decoration:none}
        .wrap{max-width:var(--maxw);margin:0 auto;padding:0 40px}
        .gold{color:var(--gold)}
        .gold-grad{background:linear-gradient(105deg,var(--gold-2),var(--gold) 45%,var(--gold-deep));
          -webkit-background-clip:text;background-clip:text;color:transparent}
        @keyframes revUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        .reveal{opacity:0}
        @media(prefers-reduced-motion:no-preference){.reveal.in{animation:revUp .7s cubic-bezier(.2,.7,.2,1) both}}
        .reveal.in{opacity:1}
        @keyframes slide{to{transform:translateX(50%)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

        /* ── header ── */
        .hdr{position:fixed;inset:0 0 auto 0;z-index:100;transition:background .4s,border-color .4s;border-bottom:1px solid transparent}
        .hdr.scrolled{background:rgba(10,10,11,.88);backdrop-filter:blur(14px);border-color:var(--line-soft)}
        .nav{display:flex;align-items:center;justify-content:space-between;height:84px}
        .brand{display:flex;align-items:center;gap:13px}
        .brand .mark{width:42px;height:42px;border:1px solid var(--gold);border-radius:50%;
          display:grid;place-items:center;color:var(--gold);font-family:'El Messiri',serif;font-size:20px;font-weight:700;position:relative}
        .brand .mark::before{content:"";position:absolute;inset:4px;border:1px solid rgba(202,162,83,.35);border-radius:50%}
        .brand b{font-family:'El Messiri',serif;font-size:19px;font-weight:600;letter-spacing:.01em}
        .brand small{display:block;font-size:11px;color:var(--muted);letter-spacing:.22em;font-family:'Tajawal';font-weight:500;margin-top:1px}
        .nav ul{display:flex;gap:34px;list-style:none;align-items:center}
        .nav ul a{font-size:15px;color:var(--muted);transition:color .25s}
        .nav ul a:hover{color:var(--ink)}
        .nav-cta{display:flex;align-items:center;gap:14px}
        .lang-btn{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:17px;color:var(--gold);
          border:1px solid var(--line);border-radius:999px;padding:5px 16px;cursor:pointer;
          background:none;transition:.25s;min-width:54px;text-align:center}
        .lang-btn:hover{background:rgba(202,162,83,.08)}
        .btn{display:inline-flex;align-items:center;gap:9px;font-family:'Tajawal';font-weight:700;font-size:15px;
          padding:13px 26px;border-radius:999px;cursor:pointer;transition:.3s;border:1px solid transparent;white-space:nowrap}
        .btn-gold{background:linear-gradient(160deg,var(--gold-2),var(--gold));color:#1a1407;
          box-shadow:0 8px 30px -10px rgba(202,162,83,.5)}
        .btn-gold:hover{transform:translateY(-2px);box-shadow:0 14px 38px -10px rgba(202,162,83,.6)}
        .btn-ghost{border-color:var(--line);color:var(--ink)}
        .btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
        .menu-btn{display:none;place-items:center;width:42px;height:42px;border:1px solid var(--line);
          border-radius:10px;color:var(--gold);cursor:pointer;background:none;font-size:22px}

        /* ── hero ── */
        .hero{position:relative;padding:170px 0 90px;overflow:hidden}
        .hero-glow{position:absolute;top:-10%;left:-10%;width:55%;height:120%;
          background:radial-gradient(circle,rgba(202,162,83,.12),transparent 62%);filter:blur(20px);pointer-events:none}
        .hero-grid{display:grid;grid-template-columns:1fr;gap:0;align-items:center;position:relative;max-width:800px}
        .eyebrow{display:inline-flex;align-items:center;gap:11px;font-size:13px;letter-spacing:.26em;color:var(--gold);
          text-transform:uppercase;font-weight:600;margin-bottom:26px}
        .eyebrow::before{content:"";width:34px;height:1px;background:var(--gold)}
        .hero h1{font-size:clamp(40px,5.4vw,72px);line-height:1.1;margin-bottom:26px;font-weight:700}
        .hero p.lead{font-size:19px;color:var(--muted);max-width:30em;margin-bottom:34px;line-height:1.85}
        .hero-actions{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;align-items:center}
        .watch{display:inline-flex;align-items:center;gap:11px;cursor:pointer;color:var(--ink);
          font-weight:500;background:none;border:none;font-size:15px;font-family:'Tajawal'}
        .watch .pico{width:42px;height:42px;border:1px solid var(--gold);border-radius:50%;
          display:grid;place-items:center;color:var(--gold);transition:.25s}
        .watch:hover .pico{background:var(--gold);color:#1a1407}
        .trust-badges{display:flex;gap:22px;flex-wrap:wrap;border-top:1px solid var(--line-soft);padding-top:22px;margin-bottom:30px}
        .tb{display:flex;align-items:center;gap:9px;font-size:14px;color:var(--muted)}
        .tb svg{color:var(--gold);flex-shrink:0}
        .hero-stats{display:flex;gap:40px;border-top:1px solid var(--line-soft);padding-top:26px;flex-wrap:wrap}
        .stat .n{font-family:'El Messiri',serif;font-size:38px;font-weight:700;color:var(--ink);line-height:1}
        .stat .l{font-size:14px;color:var(--muted);margin-top:7px}
        .hero-portrait{position:relative}
        .hero-portrait .img-wrap{position:relative;border-radius:10px;overflow:hidden;aspect-ratio:4/5;border:1px solid var(--line)}
        .hero-portrait .img-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
        .hero-portrait .frame{position:absolute;inset:-14px;border:1px solid var(--line);border-radius:16px;pointer-events:none}
        .hero-portrait .tag{position:absolute;bottom:24px;right:-24px;background:var(--bg2);border:1px solid var(--line);
          border-radius:12px;padding:16px 22px;box-shadow:0 24px 60px -24px #000}
        .hero-portrait .tag .tn{font-family:'El Messiri';font-size:26px;font-weight:700;color:var(--gold)}
        .hero-portrait .tag .tl{font-size:13px;color:var(--muted)}

        /* ── marquee ── */
        .marquee{border-block:1px solid var(--line-soft);padding:22px 0;overflow:hidden;background:var(--bg2)}
        .marquee-track{display:flex;gap:60px;white-space:nowrap;animation:slide 28s linear infinite;width:max-content}
        .marquee-track span{font-family:'El Messiri';font-size:19px;color:var(--muted);display:flex;align-items:center;gap:60px}
        .marquee-track span::after{content:"✦";color:var(--gold);font-size:13px}

        /* ── sections ── */
        section{position:relative}
        .sec{padding:108px 0}
        .sec-head{margin-bottom:60px;max-width:680px}
        .sec-head.center{margin-inline:auto;text-align:center}
        .kicker{font-size:13px;letter-spacing:.26em;color:var(--gold);text-transform:uppercase;font-weight:600;
          display:flex;align-items:center;gap:12px;margin-bottom:20px}
        .kicker::before{content:"";width:28px;height:1px;background:var(--gold)}
        .sec-head.center .kicker{justify-content:center}
        .sec-head h2{font-size:clamp(32px,4vw,50px);margin-bottom:18px}
        .sec-head p{font-size:18px;color:var(--muted);line-height:1.85}

        /* ── about ── */
        .about{background:var(--bg2);border-block:1px solid var(--line-soft)}
        .about-grid{display:grid;grid-template-columns:1fr;gap:0;align-items:center;max-width:800px}
        .about-img{position:relative}
        .about-img .img-wrap{position:relative;border-radius:10px;overflow:hidden;aspect-ratio:3/4;border:1px solid var(--line)}
        .about-img .img-wrap img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top center;display:block}
        .about-img .quote{position:absolute;left:-30px;bottom:40px;max-width:300px;background:var(--bg3);
          border:1px solid var(--line);border-right:3px solid var(--gold);border-radius:10px;padding:22px 24px;
          font-family:'El Messiri';font-size:19px;line-height:1.6;box-shadow:0 30px 70px -30px #000}
        .about-body h2{font-size:clamp(30px,3.6vw,46px);margin-bottom:24px}
        .about-body p{color:var(--muted);font-size:17px;margin-bottom:18px;line-height:1.9}
        .about-body p strong{color:var(--ink);font-weight:700}
        .timeline{display:flex;flex-direction:column;gap:0;margin-top:32px}
        .tl-item{display:grid;grid-template-columns:auto 1fr;gap:22px;padding:18px 0;border-top:1px solid var(--line-soft)}
        .tl-item:last-child{border-bottom:1px solid var(--line-soft)}
        .tl-item .yr{font-family:'El Messiri';font-size:21px;color:var(--gold);font-weight:700;min-width:64px}
        .tl-item .tx{color:var(--muted);font-size:16px}
        .tl-item .tx b{color:var(--ink);display:block;font-weight:700;margin-bottom:2px;font-family:'El Messiri';font-size:18px}

        /* ── video ── */
        .video-band{padding:0 0 108px}
        .video-outer{position:relative;border:1px solid var(--line);border-radius:18px;overflow:hidden;aspect-ratio:16/7;
          background:var(--bg2);cursor:pointer}
        .video-outer iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
        .video-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
          justify-content:center;gap:20px;text-align:center;
          background:repeating-linear-gradient(135deg,rgba(202,162,83,.05) 0 12px,rgba(202,162,83,.1) 12px 24px),var(--bg2)}
        .video-overlay .glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(202,162,83,.16),transparent 60%)}
        .video-overlay .bigplay{width:88px;height:88px;border-radius:50%;background:var(--gold);color:#1a1407;
          display:grid;place-items:center;box-shadow:0 20px 50px -16px rgba(202,162,83,.6);transition:.3s;z-index:1}
        .video-overlay .bigplay:hover{transform:scale(1.06)}
        .video-overlay h3{font-size:26px;position:relative}
        .video-overlay p{color:var(--muted);font-size:15px;position:relative}
        .video-label{position:absolute;top:18px;right:22px;font-family:'Cormorant Garamond';font-style:italic;
          color:var(--gold);font-size:14px;border:1px solid var(--line);border-radius:999px;
          padding:5px 14px;background:rgba(10,10,11,.5);z-index:2}

        /* ── vision ── */
        .vision{padding:90px 0;text-align:center;position:relative;overflow:hidden}
        .vision-bg{position:absolute;inset:0;opacity:.1;object-fit:cover}
        .vision-inner{position:relative;max-width:880px;margin:0 auto}
        .mark-lg{width:54px;height:54px;border:1px solid var(--gold);border-radius:50%;display:grid;place-items:center;
          color:var(--gold);font-size:24px;margin:0 auto 28px;font-family:'El Messiri';animation:float 3s ease-in-out infinite}
        .vision h2{font-size:clamp(28px,3.6vw,44px);line-height:1.4;font-weight:500}

        /* ── steps ── */
        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
        .step{position:relative;background:var(--bg2);border:1px solid var(--line-soft);border-radius:14px;padding:32px 28px;transition:.35s}
        .step:hover{border-color:var(--line);transform:translateY(-4px)}
        .step .sn{font-family:'Cormorant Garamond';font-size:18px;color:var(--gold);letter-spacing:.1em;margin-bottom:18px;display:block}
        .step .sic{width:48px;height:48px;border:1px solid var(--line);border-radius:12px;display:grid;place-items:center;color:var(--gold);margin-bottom:18px}
        .step h4{font-size:21px;margin-bottom:9px}
        .step p{font-size:15px;color:var(--muted);line-height:1.7}

        /* ── courses ── */
        .courses-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:26px;align-items:stretch}
        .course-card{background:var(--bg2);border:1px solid var(--line-soft);border-radius:20px;padding:38px 34px;
          position:relative;transition:.4s;overflow:hidden;display:flex;flex-direction:column}
        .course-card:hover{border-color:var(--line);transform:translateY(-5px);box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
        .course-card::before{content:"";position:absolute;top:0;right:0;left:0;height:3px;
          background:linear-gradient(90deg,transparent,var(--gold),transparent);opacity:0;transition:.4s}
        .course-card:hover::before,.course-card.feat::before{opacity:1}
        .course-card.feat{background:linear-gradient(160deg,rgba(202,162,83,.10),var(--bg2) 60%);border-color:rgba(202,162,83,.35)}
        .course-card.feat .course-badge{background:linear-gradient(105deg,var(--gold-2),var(--gold));color:#1a1407;border:none}
        .course-badge{display:inline-flex;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);
          border:1px solid var(--line);border-radius:999px;padding:5px 14px;font-weight:700;margin-bottom:20px}
        .course-emoji{font-size:30px;margin-bottom:14px;display:block}
        .course-tier{font-size:12px;color:var(--muted);letter-spacing:.14em;text-transform:uppercase;font-weight:600;margin-bottom:6px}
        .course-card h3{font-size:24px;margin-bottom:8px}
        .course-price{display:flex;align-items:baseline;gap:8px;margin:16px 0 20px}
        .course-price .amt{font-family:'El Messiri',serif;font-size:38px;font-weight:700;color:var(--gold);line-height:1}
        .course-price .cur{font-size:16px;color:var(--muted);font-weight:500}
        .course-price .alt{font-size:14px;color:var(--muted2);margin-right:4px}
        .course-card .sub{color:var(--muted);font-size:15px;margin-bottom:22px;line-height:1.6}
        .course-list{list-style:none;display:flex;flex-direction:column;gap:11px;margin-bottom:28px;flex:1}
        .course-list li{display:flex;gap:11px;font-size:14.5px;color:var(--ink);align-items:flex-start;line-height:1.5}
        .course-list li::before{content:"✔";color:var(--gold);font-size:13px;flex-shrink:0;margin-top:2px}
        .course-list li::before{content:"";width:7px;height:7px;border:1px solid var(--gold);transform:rotate(45deg);
          margin-top:8px;flex-shrink:0;background:rgba(202,162,83,.2)}
        .course-foot{display:flex;align-items:center;justify-content:space-between;padding-top:24px;
          border-top:1px solid var(--line-soft);gap:16px;flex-wrap:wrap}
        .price .amt{font-family:'El Messiri';font-size:30px;font-weight:700;color:var(--ink)}
        .price .per{font-size:14px;color:var(--muted)}

        /* ── compare ── */
        .compare{margin-top:30px;border:1px solid var(--line-soft);border-radius:16px;overflow:hidden;background:var(--bg2)}
        .compare-head{padding:22px 30px;border-bottom:1px solid var(--line-soft);display:flex;align-items:center;gap:12px}
        .compare-head h4{font-size:21px}
        .compare-head .q{width:30px;height:30px;border:1px solid var(--gold);border-radius:50%;
          display:grid;place-items:center;color:var(--gold);font-family:'El Messiri';font-size:16px}
        .compare-body{display:grid;grid-template-columns:1fr 1fr}
        .compare-col{padding:28px 30px}
        .compare-col:first-child{border-inline-end:1px solid var(--line-soft)}
        .compare-col .ct{font-family:'El Messiri';font-size:19px;margin-bottom:6px;color:var(--gold)}
        .compare-col .cs{font-size:14px;color:var(--muted-2);margin-bottom:16px}
        .compare-col p{font-size:15px;color:var(--muted);line-height:1.7}

        /* ── why ── */
        .why{background:var(--bg2);border-block:1px solid var(--line-soft)}
        .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .why-card{padding:34px 30px;border:1px solid var(--line-soft);border-radius:14px;transition:.35s;background:var(--bg)}
        .why-card:hover{border-color:var(--line);background:var(--bg3)}
        .why-card .ic{width:46px;height:46px;border:1px solid var(--line);border-radius:11px;
          display:grid;place-items:center;color:var(--gold);margin-bottom:20px}
        .why-card h4{font-size:20px;margin-bottom:10px}
        .why-card p{font-size:15px;color:var(--muted);line-height:1.75}

        /* ── results ── */
        .results-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .rcard{border:1px solid var(--line-soft);border-radius:16px;overflow:hidden;background:var(--bg2);transition:.35s}
        .rcard:hover{border-color:var(--line);transform:translateY(-4px)}
        .rcard .shot{aspect-ratio:4/3;overflow:hidden;border-bottom:1px solid var(--line-soft);position:relative}
        .rcard .shot img{width:100%;height:100%;object-fit:cover;transition:transform .4s}
        .rcard:hover .shot img{transform:scale(1.04)}
        .rcard .rb{padding:22px 24px}
        .rcard .chip{display:inline-flex;align-items:center;gap:8px;font-family:'El Messiri';font-size:24px;
          color:var(--gold);font-weight:700;margin-bottom:6px}
        .rcard .chip .up{font-size:15px;color:#7bbf86}
        .rcard p{font-size:14.5px;color:var(--muted)}

        /* ── testimonials ── */
        .tst-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .tst-card{background:var(--bg2);border:1px solid var(--line-soft);border-radius:14px;padding:32px;transition:.35s}
        .tst-card:hover{border-color:var(--line)}
        .tst-card .qm{font-family:'Cormorant Garamond',serif;font-size:64px;color:var(--gold);opacity:.4;line-height:.5;height:24px}
        .tst-card p{font-size:16px;color:var(--ink);line-height:1.8;margin-bottom:24px}
        .tst-person{display:flex;align-items:center;gap:14px;border-top:1px solid var(--line-soft);padding-top:20px}
        .tst-person .av{width:46px;height:46px;border-radius:50%;
          background:repeating-linear-gradient(135deg,rgba(202,162,83,.12) 0 6px,rgba(202,162,83,.22) 6px 12px);
          border:1px solid var(--line);flex-shrink:0}
        .tst-person b{font-family:'El Messiri';font-size:16px;display:block}
        .tst-person small{color:var(--muted);font-size:13px}
        .tst-note{text-align:center;color:var(--muted-2);font-size:13px;margin-top:30px;
          font-family:'Cormorant Garamond';font-style:italic}

        /* ── faq ── */
        .faq{background:var(--bg2);border-block:1px solid var(--line-soft)}
        .faq-wrap{max-width:840px;margin:0 auto}
        .faq-item{border-bottom:1px solid var(--line-soft)}
        .faq-item summary{list-style:none;cursor:pointer;padding:26px 6px;display:flex;align-items:center;
          justify-content:space-between;gap:20px;font-family:'El Messiri';font-size:21px;color:var(--ink);transition:color .2s}
        .faq-item summary::-webkit-details-marker{display:none}
        .faq-item summary:hover{color:var(--gold)}
        .faq-item .pm{width:34px;height:34px;border:1px solid var(--line);border-radius:50%;
          display:grid;place-items:center;color:var(--gold);flex-shrink:0;transition:.3s;font-size:20px}
        .faq-item[open] .pm{transform:rotate(45deg);background:var(--gold);color:#1a1407;border-color:var(--gold)}
        .faq-item .fa{padding:0 6px 26px;color:var(--muted);font-size:16px;line-height:1.85;max-width:62ch}

        /* ── booking ── */
        .booking{padding:108px 0}
        .booking-grid{display:grid;grid-template-columns:1fr 1fr;gap:54px;align-items:center;
          background:linear-gradient(135deg,rgba(202,162,83,.08),var(--bg2) 65%);
          border:1px solid var(--line);border-radius:22px;padding:56px;position:relative;overflow:hidden}
        .booking-grid .glow{position:absolute;inset:0;background:radial-gradient(circle at 80% 0%,rgba(202,162,83,.16),transparent 55%);pointer-events:none}
        .booking-copy{position:relative}
        .booking-copy h2{font-size:clamp(30px,3.6vw,46px);margin-bottom:16px}
        .booking-copy p{font-size:17px;color:var(--muted);margin-bottom:26px;line-height:1.85}
        .booking-list{display:flex;flex-direction:column;gap:14px}
        .booking-list .bl{display:flex;align-items:center;gap:12px;font-size:15.5px}
        .booking-list .bl svg{color:var(--gold);flex-shrink:0}
        .form-card{position:relative;background:var(--bg);border:1px solid var(--line);border-radius:18px;padding:34px}
        .form-card h3{font-size:22px;margin-bottom:6px}
        .form-card .fsub{font-size:14px;color:var(--muted);margin-bottom:24px}
        .field{margin-bottom:16px}
        .field label{display:block;font-size:13px;color:var(--muted);margin-bottom:8px;font-weight:500}
        .field input,.field select,.field textarea{width:100%;background:var(--bg2);border:1px solid var(--line-soft);
          border-radius:11px;padding:13px 16px;color:var(--ink);font-family:'Tajawal';font-size:15px;transition:.25s;outline:none}
        .field input:focus,.field select:focus,.field textarea:focus{border-color:var(--gold);background:var(--bg3)}
        .field textarea{resize:vertical;min-height:74px}
        .form-card .btn{width:100%;justify-content:center;margin-top:6px}
        .form-note{font-size:12.5px;color:var(--muted-2);text-align:center;margin-top:14px;
          display:flex;align-items:center;justify-content:center;gap:7px}

        /* ── cta ── */
        .cta{padding:0 0 108px}
        .cta-band{position:relative;border:1px solid var(--line);border-radius:22px;padding:72px 56px;overflow:hidden;
          background:linear-gradient(135deg,rgba(202,162,83,.10),var(--bg2) 60%);text-align:center}
        .cta-band .glow{position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(202,162,83,.18),transparent 60%);pointer-events:none}
        .cta-band h2{font-size:clamp(32px,4.4vw,54px);margin-bottom:18px;position:relative}
        .cta-band p{font-size:19px;color:var(--muted);max-width:32em;margin:0 auto 36px;position:relative}
        .cta-actions{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;position:relative}

        /* ── footer ── */
        footer{border-top:1px solid var(--line-soft);padding:64px 0 36px;background:var(--bg2)}
        .foot-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px}
        .foot-brand p{color:var(--muted);font-size:15px;margin-top:18px;max-width:26em;line-height:1.8}
        .foot-col h5{font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:var(--gold);
          margin-bottom:18px;font-family:'Tajawal';font-weight:700}
        .foot-col a{display:block;color:var(--muted);font-size:15px;margin-bottom:12px;transition:.2s}
        .foot-col a:hover{color:var(--ink)}
        .foot-bottom{display:flex;justify-content:space-between;align-items:center;
          border-top:1px solid var(--line-soft);padding-top:28px;color:var(--muted-2);font-size:14px;flex-wrap:wrap;gap:14px}

        /* ── whatsapp float ── */
        .wa-float{position:fixed;bottom:26px;left:26px;z-index:200;display:inline-flex;align-items:center;gap:11px;
          background:linear-gradient(160deg,var(--gold-2),var(--gold));color:#10240f;font-family:'Tajawal';
          font-weight:700;font-size:15px;padding:13px 20px 13px 15px;border-radius:999px;
          box-shadow:0 16px 40px -12px rgba(202,162,83,.55);transition:.3s;cursor:pointer}
        .wa-float:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 22px 50px -12px rgba(202,162,83,.7)}
        .wa-float .wic{width:30px;height:30px;border-radius:50%;background:#10240f;display:grid;place-items:center;color:var(--gold-2)}

        /* ── mobile ── */
        @media(max-width:980px){
          .wrap{padding:0 24px}
          .hero-grid,.about-grid,.booking-grid{grid-template-columns:1fr;gap:44px}
          .hero-portrait{max-width:440px}
          .courses-grid,.why-grid,.tst-grid,.results-grid{grid-template-columns:1fr}
          .course-price .amt{font-size:32px}
          .steps-grid{grid-template-columns:1fr 1fr}
          .foot-grid{grid-template-columns:1fr 1fr}
          .nav ul{display:none}
          .menu-btn{display:grid}
          .hero-portrait .tag{right:auto;left:16px}
          .about-img .quote{position:static;max-width:none;margin-top:18px;left:auto}
          .booking-grid{padding:38px}
        }
        @media(max-width:560px){
          .wrap{padding:0 18px}
          .hero{padding:140px 0 70px}
          .sec{padding:74px 0}
          .booking{padding:74px 0}
          .cta-band{padding:48px 26px}
          .booking-grid{padding:26px}
          .foot-grid{grid-template-columns:1fr}
          .hero-stats{gap:26px}
          .steps-grid,.compare-body{grid-template-columns:1fr}
          .compare-col:first-child{border-inline-end:none;border-bottom:1px solid var(--line-soft)}
          .nav-cta .btn-gold{display:none}
          .wa-float span:last-child{display:none}
          .wa-float{padding:13px}
        }
      `}</style>

      {/* ── HEADER ── */}
      <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav">
          <a className="brand" href="#top">
            <span className="mark">ب</span>
            <span><b>{tx('بشار العسلي', 'Bashar Al-Asali')}</b><small>EBAY ACADEMY</small></span>
          </a>
          <nav>
            <ul>
              <li><a href="#about">{tx('القصة', 'Story')}</a></li>
              <li><a href="#steps">{tx('كيف تبدأ', 'How it works')}</a></li>
              <li><a href="#courses">{tx('الدورات', 'Courses')}</a></li>
              <li><a href="#faq">{tx('الأسئلة', 'FAQ')}</a></li>
              <li><a href="#results">{tx('نتائج الطلاب', 'Results')}</a></li>
            </ul>
          </nav>
          <div className="nav-cta">
            <button className="lang-btn" onClick={() => switchLang(ar ? 'en' : 'ar')}>
              {ar ? 'EN' : 'ع'}
            </button>
            <a className="btn btn-gold" href="#booking">{tx('احجز استشارة', 'Book a consultation')}</a>
            <a className="btn btn-ghost" href="/login" style={{padding:'10px 20px',fontSize:'14px'}}>
              {tx('دخول الطلاب', 'Student Login')}
            </a>
            <button className="menu-btn" onClick={() => setMenuOpen(o => !o)}>☰</button>
          </div>
        </div>
        {menuOpen && (
          <div style={{background:'var(--bg2)',borderTop:'1px solid var(--line-soft)',padding:'16px 24px',display:'flex',flexDirection:'column',gap:'14px'}}>
            {[['#about',tx('القصة','Story')],['#steps',tx('كيف تبدأ','How it works')],['#courses',tx('الدورات','Courses')],['#faq',tx('الأسئلة','FAQ')],['#testimonials',tx('آراء الطلاب','Reviews')]].map(([href,label])=>(
              <a key={href} href={href} onClick={()=>setMenuOpen(false)} style={{color:'var(--muted)',fontSize:'17px'}}>{label}</a>
            ))}
            <a href="/login" style={{color:'var(--gold)',fontWeight:'700'}}>{tx('دخول الطلاب','Student Login')}</a>
          </div>
        )}
      </header>

      <main id="top">

        {/* ── HERO ── */}
        <section className="hero" id="hero">
          <div className="hero-glow" />
          <div className="wrap hero-grid">
            <div className="hero-copy reveal">
              <span className="eyebrow">{tx('تجارة eBay الاحترافية', 'Professional eBay Trading')}</span>
              <h1>{tx(<>حوّل خبرتك إلى <span className="gold-grad">دخل حقيقي</span> من التجارة على <span className="en gold-grad">eBay</span></>, <>Turn your skills into <span className="gold-grad">real income</span> from trading on <span className="en gold-grad">eBay</span></>)}</h1>
              <p className="lead">{tx('منهج عملي مبني على تجربة حقيقية — لا وعود وهمية ولا ثراء سريع. خطوات واضحة، متابعة مباشرة، ونتائج تُقاس.', 'A practical method built on real experience — no false promises, no get-rich-quick. Clear steps, direct mentorship, and measurable results.')}</p>
              <div className="hero-actions">
                <a className="btn btn-gold" href="#courses">{tx('ابدأ الدورة الآن', 'Start the course')}</a>
                <button className="watch" type="button" onClick={() => document.getElementById('intro')?.scrollIntoView({behavior:'smooth'})}>
                  <span className="pico"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                  <span>{tx('شاهد فيديو تعريفي', 'Watch intro')}</span>
                </button>
              </div>
              <div className="trust-badges">
                <div className="tb"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z"/></svg><span>{tx('متابعة مباشرة', 'Direct mentorship')}</span></div>
                <div className="tb"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg><span>{tx('مجتمع طلاب', 'Students community')}</span></div>
                <div className="tb"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12l5 5L21 4"/></svg><span>{tx('دعم مستمر', 'Ongoing support')}</span></div>
              </div>
              <div className="hero-stats">
                <div className="stat"><div className="n">+<span className="gold">200</span></div><div className="l">{tx('طالب تم تدريبهم', 'Students trained')}</div></div>
                <div className="stat"><div className="n"><span className="gold">39</span></div><div className="l">{tx('طلباً في يوم واحد', 'Orders in one day')}</div></div>
                <div className="stat"><div className="n"><span className="gold">18</span></div><div className="l">{tx('عمر انطلاق الرحلة', 'Age the journey began')}</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div className="marquee">
          <div className="marquee-track">
            {[tx('إنشاء حساب احترافي','Account setup'),tx('اختيار المنتجات الرابحة','Winning products'),tx('تحسين العروض','Optimized listings'),tx('استراتيجيات التسعير','Pricing strategy'),tx('إدارة الطلبات','Order management'),tx('حماية الحساب','Account protection'),tx('بناء مشروع مستدام','Sustainable business'),
              tx('إنشاء حساب احترافي','Account setup'),tx('اختيار المنتجات الرابحة','Winning products'),tx('تحسين العروض','Optimized listings'),tx('استراتيجيات التسعير','Pricing strategy'),tx('إدارة الطلبات','Order management'),tx('حماية الحساب','Account protection'),tx('بناء مشروع مستدام','Sustainable business')
            ].map((s,i)=><span key={i}>{s}</span>)}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <section className="sec about" id="about">
          <div className="wrap about-grid">
            <div className="about-body reveal">
              <span className="kicker">{tx('من هو الكوتش بشار', 'Who is Coach Bashar')}</span>
              <h2>{tx('رحلة بدأت في عمر الثامنة عشرة', 'A journey that began at eighteen')}</h2>
              <p>{tx(<>بشار مدرب ومستشار متخصص في التجارة الإلكترونية على منصة <span className="en gold">eBay</span>. بدأ رحلته بعد سنوات من التجارب والتعلّم الذاتي، وواجه في بداياته تحدياً واضحاً: <strong>غياب التوجيه والمتابعة الصحيحة.</strong></>, <>Bashar is a trainer and consultant specialized in e-commerce on eBay. He started after years of self-learning, and faced one clear challenge: <strong>the absence of proper guidance and mentorship.</strong></>)}</p>
              <p>{tx(<>هذا التحدي دفعه لبناء أنظمة عمل حقيقية، حتى وصل إلى بيع <strong>39 طلباً في يوم واحد</strong>، ثم حوّل خبرته إلى منهج تدريبي عملي يختصر على غيره طريق الأخطاء.</>, <>That challenge pushed him to build real systems — reaching <strong>39 orders in a single day</strong> — then turned his experience into a practical method that spares others the path of mistakes.</>)}</p>
              <div className="timeline">
                <div className="tl-item"><span className="yr">{tx('البداية','Start')}</span><span className="tx"><b>{tx('تعلّم ذاتي وتجربة','Self-learning & testing')}</b>{tx('مئات الساعات في اختبار الاستراتيجيات وبناء أنظمة عمل.','Hundreds of hours testing strategies and building systems.')}</span></div>
                <div className="tl-item"><span className="yr">{tx('الإثبات','Proof')}</span><span className="tx"><b>{tx('39 طلباً في يوم واحد','39 orders in one day')}</b>{tx('أول نجاح فعلي يثبت أن المنهج يعمل على أرض الواقع.','The first real success proving the method works in practice.')}</span></div>
                <div className="tl-item"><span className="yr">{tx('اليوم','Today')}</span><span className="tx"><b>{tx('+200 طالب','200+ students')}</b>{tx('تدريب احترافي يركّز على التطبيق والمتابعة لا التنظير.','Professional training focused on application and mentorship.')}</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTRO VIDEO ── */}
        <section className="video-band" id="intro">
          <div className="wrap reveal">
            <div className="video-outer" onClick={() => YT_ID ? setPlaying(true) : window.open('https://www.youtube.com/@coachbasharalasali','_blank')}>
              <span className="video-label">{tx('فيديو تعريفي — الكوتش بشار', 'Intro video — Coach Bashar')}</span>
              {playing && YT_ID
                ? <iframe src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1`} allow="autoplay; fullscreen" allowFullScreen title="intro" />
                : (
                  <div className="video-overlay">
                    <div className="glow" />
                    <img src="/bashar-portrait.jpg" alt="بشار" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0.18,pointerEvents:'none'}} />
                    <div className="bigplay" role="button" tabIndex={0} style={{zIndex:2}}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                    <h3 style={{position:'relative',zIndex:2}}>{tx('تعرّف على بشار في 90 ثانية', 'Meet Bashar in 90 seconds')}</h3>
                    <p style={{position:'relative',zIndex:2}}>{tx('قصتي وكيف بدأت على eBay', 'My story and how I started on eBay')}</p>
                  </div>
                )
              }
            </div>
          </div>
        </section>

        {/* ── VISION ── */}
        <section className="vision">
          <div className="wrap vision-inner reveal">
            <div className="mark-lg">✦</div>
            <span className="kicker" style={{justifyContent:'center'}}>{tx('الرؤية', 'The Vision')}</span>
            <h2>{tx(<>تمكين الشباب العربي من بناء <span className="gold-grad">مصدر دخل حقيقي</span> عبر التجارة الإلكترونية على <span className="en gold-grad">eBay</span> — بخطوات عملية واضحة، بعيداً عن الوعود الوهمية.</>, <>Empowering Arab youth to build a <span className="gold-grad">real source of income</span> through e-commerce on <span className="en gold-grad">eBay</span> — with clear, practical steps, far from false promises.</>)}</h2>
          </div>
        </section>

        {/* ── STEPS ── */}
        <section className="sec" id="steps">
          <div className="wrap">
            <div className="sec-head center reveal">
              <span className="kicker">{tx('كيف تبدأ', 'How it works')}</span>
              <h2>{tx('أربع خطوات واضحة نحو أول عملية بيع', 'Four clear steps to your first sale')}</h2>
            </div>
            <div className="steps-grid">
              {[
                { n:'01', icon:<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, title:tx('احجز استشارة','Book a consultation'), desc:tx('محادثة مباشرة لفهم نقطة انطلاقك وأهدافك.','A direct conversation to assess your starting point and goals.') },
                { n:'02', icon:<><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></>, title:tx('اشترك في الدورة','Enroll & subscribe'), desc:tx('اختر الدورة أو الاشتراك الشهري وادخل المحتوى فوراً.','Pick the course or monthly plan and get instant access.') },
                { n:'03', icon:<><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>, title:tx('تعلّم وطبّق','Learn & apply'), desc:tx('شاهد الوحدات خطوة بخطوة وطبّق بعد كل درس.','Watch the units step by step and apply right after each lesson.') },
                { n:'04', icon:<><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></>, title:tx('ابدأ البيع والتوسّع','Sell & scale'), desc:tx('حقّق أول طلباتك وانمُ نحو مشروع مستدام.','Land your first orders and grow into a sustainable business.') },
              ].map(s => (
                <div className="step reveal" key={s.n}>
                  <span className="sn">{s.n}</span>
                  <div className="sic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{s.icon}</svg></div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COURSES ── */}
        <section className="sec" id="courses">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="kicker">{tx('البرامج التدريبية', 'Training Programs')}</span>
              <h2>{tx('ثلاثة برامج… طريق واحد نحو الاحتراف', 'Three programs… one path to mastery')}</h2>
              <p>{tx('محتوى مبني على التطبيق العملي والمتابعة المباشرة، يأخذك من الصفر حتى مشروع مستدام.', 'Content built on practical application and direct mentorship — from zero to a sustainable business.')}</p>
            </div>
            <div className="courses-grid">

              {/* ── Starter ── */}
              <div className="course-card reveal">
                <span className="course-badge">🚀 {tx('باقة التنفيذ', 'Starter Program')}</span>
                <div className="course-tier">{tx('Starter Program', 'Starter Program')}</div>
                <h3>{tx('باقة التنفيذ', 'Starter Package')}</h3>
                <p className="sub">{tx('البرنامج المناسب للمبتدئين الذين يريدون دخول عالم التجارة الإلكترونية على eBay والبدء بالطريقة الصحيحة.', 'Perfect for beginners who want to enter the eBay e-commerce world and start the right way.')}</p>
                <div className="course-price">
                  <span className="amt">40</span>
                  <span className="cur">{tx('دينار', 'JD')}</span>
                  <span className="alt">/ 60$</span>
                </div>
                <ul className="course-list">
                  {[
                    tx('فتح الحسابات بالطريقة الصحيحة','Opening accounts the right way'),
                    tx('تعلم البحث عن المنتجات الرابحة','Finding winning products'),
                    tx('الوصول إلى الموردين المناسبين','Accessing the right suppliers'),
                    tx('تعلم تنزيل المنتجات باحترافية','Listing products professionally'),
                    tx('شرح آلية الشحن وإدارة الطلبات','Shipping & order management'),
                    tx('حل المشاكل والعقبات الشائعة','Solving common obstacles'),
                  ].map((item,i)=><li key={i}>{item}</li>)}
                </ul>
                <a className="btn btn-ghost" href="#booking">{tx('سجّل الآن', 'Enroll now')}</a>
              </div>

              {/* ── Professional ── */}
              <div className="course-card reveal">
                <span className="course-badge">⚡ {tx('الباقة المتوسطة', 'Professional Program')}</span>
                <div className="course-tier">{tx('Professional Program', 'Professional Program')}</div>
                <h3>{tx('الباقة المتوسطة', 'Professional Package')}</h3>
                <p className="sub">{tx('للأشخاص الذين يريدون تسريع النتائج والحصول على دعم مباشر أثناء التطبيق.', 'For those who want faster results and direct support during implementation.')}</p>
                <div className="course-price">
                  <span className="amt">75</span>
                  <span className="cur">{tx('دينار', 'JD')}</span>
                  <span className="alt">/ 110$</span>
                </div>
                <ul className="course-list">
                  <li style={{color:'var(--gold)',fontWeight:600}}>{tx('كل ما في باقة Starter، بالإضافة إلى:', 'Everything in Starter, plus:')}</li>
                  {[
                    tx('متابعة خاصة يومية على الواتساب','Daily private follow-up on WhatsApp'),
                    tx('إجابات مباشرة على الأسئلة والاستفسارات','Direct answers to all your questions'),
                    tx('المساعدة أثناء التطبيق العملي','Help during real-world application'),
                    tx('توجيه مستمر لتجنب الأخطاء المكلفة','Guidance to avoid costly mistakes'),
                  ].map((item,i)=><li key={i}>{item}</li>)}
                </ul>
                <a className="btn btn-ghost" href="#booking">{tx('سجّل الآن', 'Enroll now')}</a>
              </div>

              {/* ── Elite ── */}
              <div className="course-card feat reveal">
                <span className="course-badge">👑 {tx('الباقة الكاملة', 'Elite Program')}</span>
                <div className="course-tier">{tx('Elite Program', 'Elite Program')}</div>
                <h3>{tx('الباقة الكاملة', 'Elite Package')}</h3>
                <p className="sub">{tx('أقوى برنامج تدريبي متكامل — مصمم للجادين الذين يريدون بناء مشروع احترافي واختصار سنوات من التجربة.', 'The most powerful program — designed for serious people who want to build a professional business and skip years of trial and error.')}</p>
                <div className="course-price">
                  <span className="amt">100</span>
                  <span className="cur">{tx('دينار', 'JD')}</span>
                  <span className="alt">/ 140$</span>
                </div>
                <ul className="course-list">
                  <li style={{color:'var(--gold)',fontWeight:600}}>{tx('كل ما في Professional، بالإضافة إلى:', 'Everything in Professional, plus:')}</li>
                  {[
                    tx('استراتيجيات الذكاء الاصطناعي (AI) للتطوير والتوسع','AI strategies for growth and scaling'),
                    tx('بناء البراند والهوية التجارية','Brand building and business identity'),
                    tx('أساليب متقدمة للنمو وزيادة المبيعات','Advanced methods to grow sales'),
                    tx('متابعة خاصة يومية على الواتساب','Daily private WhatsApp follow-up'),
                    tx('الوصول إلى المنهج الكامل من الصفر حتى الاحتراف','Full curriculum from zero to mastery'),
                  ].map((item,i)=><li key={i}>{item}</li>)}
                </ul>
                <a className="btn btn-gold" href="#booking">{tx('سجّل الآن', 'Enroll now')}</a>
              </div>

            </div>
          </div>
        </section>

        {/* ── WHY ── */}
        <section className="sec why" id="why">
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="kicker">{tx('لماذا أكاديمية بشار', 'Why Bashar Academy')}</span>
              <h2>{tx('تطبيق حقيقي، لا معلومات نظرية', 'Real application, not theory')}</h2>
            </div>
            <div className="why-grid">
              {[
                { icon:<path d="M3 12l5 5L21 4"/>, title:tx('خبرة معاشة لا منقولة','Lived experience'), desc:tx('كل استراتيجية في المنهج مرّت عليها تجربة بشار الشخصية قبل أن تصل إليك.','Every strategy in the method passed through Bashar\'s own experience before reaching you.') },
                { icon:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>, title:tx('متابعة مباشرة','Direct mentorship'), desc:tx('لا تُترك وحدك بعد المحتوى — جلسات وإجابات ودعم أثناء التطبيق الفعلي.','You\'re never left alone after the content — sessions, answers and support during real application.') },
                { icon:<path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z"/>, title:tx('مصداقية ونتائج','Credibility & results'), desc:tx('أكثر من 200 طالب وقصص نجاح حقيقية — نتحدث بالأرقام لا بالشعارات.','More than 200 students and real success stories — we speak in numbers, not slogans.') },
              ].map((c,i)=>(
                <div className="why-card reveal" key={i}>
                  <div className="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{c.icon}</svg></div>
                  <h4>{c.title}</h4>
                  <p>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <section className="sec" id="results">
          <div className="wrap">
            <div className="sec-head center reveal">
              <span className="kicker">{tx('نتائج الطلاب', 'Student results')}</span>
              <h2>{tx('الدليل على الشاشة، لا بالكلام فقط', 'Proof on the screen, not just words')}</h2>
            </div>
            <div className="results-grid">
              <div className="rcard reveal">
                <div className="shot"><img src="/result-ebay-1.jpg" alt="eBay seller dashboard result" /></div>
                <div className="rb">
                  <div className="chip">4,475 <span className="up">👁</span></div>
                  <p>{tx('مشاهدة للعروض — 27 طلب — $1,245 مبيعات في 90 يوم', '27 orders — $1,245 sales in 90 days')}</p>
                </div>
              </div>
              <div className="rcard reveal">
                <div className="shot"><img src="/result-ebay-2.jpg" alt="eBay seller dashboard result 2" /></div>
                <div className="rb">
                  <div className="chip">7,036 <span className="up">👁</span></div>
                  <p>{tx('مشاهدة — 39 طلب — $2,039 مبيعات في 90 يوم', '39 orders — $2,039 sales in 90 days')}</p>
                </div>
              </div>
              <div className="rcard reveal">
                <div className="shot"><img src="/result-whatsapp.jpg" alt="Student result $1,694" /></div>
                <div className="rb">
                  <div className="chip">$1,694 <span className="up">▲</span></div>
                  <p>{tx('إجمالي مبيعات 90 يوم — 27 طلباً مباعاً — رسالة طالب حقيقي', '90-day total — 27 sold — real student message')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="sec faq" id="faq">
          <div className="wrap">
            <div className="sec-head center reveal">
              <span className="kicker">{tx('أسئلة شائعة', 'FAQ')}</span>
              <h2>{tx('كل ما يدور في ذهنك قبل أن تبدأ', 'Everything you\'re wondering before you start')}</h2>
            </div>
            <div className="faq-wrap reveal">
              {[
                [tx('هل أحتاج خبرة سابقة؟','Do I need prior experience?'), tx('لا. تبدأ الدورة من إنشاء الحساب وتأخذك خطوة بخطوة حتى أول عملية بيع وما بعدها.','No. The course starts from creating your account and takes you step by step to your first sale and beyond.'), true],
                [tx('كم رأس المال الذي أحتاجه للبدء؟','How much capital do I need to start?'), tx('يمكنك البدء بمبلغ صغير والتوسّع تدريجياً. المنهج يركّز على اختيار المنتج والتسعير الذكي.','You can start small and grow gradually. The method focuses on smart product selection and pricing.')],
                [tx('هل تصلح من بلدي؟','Does it work from my country?'), tx('تجارة eBay تعمل من معظم الدول. في الاستشارة نراجع وضعك وأفضل طريقة للبدء من مكانك.','eBay trading works from most countries. In the consultation we review your situation.')],
                [tx('متى أرى النتائج؟','When will I see results?'), tx('يعتمد على التزامك وتطبيقك. الطلاب الذين يطبّقون باستمرار يرون أول طلباتهم غالباً خلال أسابيع.','It depends on your commitment. Students who apply consistently often see their first orders within weeks.')],
                [tx('ما الفرق بين الدورة والاشتراك الشهري؟','What\'s the difference between the course and the subscription?'), tx('الدورة الشاملة هي المنهج كاملاً بوصول دائم. الاشتراك يضيف متابعة مستمرة واستراتيجيات جديدة.','The complete course is the full method with lifetime access. The subscription adds ongoing mentorship.')],
                [tx('كيف أحصل على الدعم إن واجهت مشكلة؟','How do I get support if I\'m stuck?'), tx('عبر المتابعة المباشرة وجلسات المتابعة ومجتمع الطلاب، وعبر واتساب لأي عائق أثناء التطبيق.','Through direct mentorship, follow-up sessions, the students community, and WhatsApp for any blocker.')],
              ].map(([q, a, open], i) => (
                <details className="faq-item" key={i} open={!!open}>
                  <summary><span>{q}</span><span className="pm">+</span></summary>
                  <div className="fa">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOOKING ── */}
        <section className="booking" id="booking">
          <div className="wrap">
            <div className="booking-grid reveal">
              <div className="glow" />
              <div className="booking-copy">
                <span className="kicker">{tx('احجز استشارة', 'Book a consultation')}</span>
                <h2>{tx('محادثة مباشرة مع الكوتش بشار', 'A direct talk with Coach Bashar')}</h2>
                <p>{tx('أخبرنا أين أنت الآن وإلى أين تريد الوصول، ونوجّهك إلى خطوة البدء الصحيحة — بلا ضغط.', 'Tell us where you are now and where you want to go. We\'ll point you to the right starting step — no pressure.')}</p>
                <div className="booking-list">
                  {[tx('خطة واضحة مناسبة لمستواك','A clear plan suited to your level'),tx('إجابات صادقة بلا وعود وهمية','Honest answers — no false promises'),tx('رد فوري عبر واتساب','Instant reply on WhatsApp')].map((item,i)=>(
                    <div className="bl" key={i}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12l5 5L21 4"/></svg><span>{item}</span></div>
                  ))}
                </div>
              </div>
              <BookingForm lang={lang} tx={tx} />
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta" id="cta">
          <div className="wrap">
            <div className="cta-band reveal">
              <div className="glow" />
              <span className="kicker" style={{justifyContent:'center'}}>{tx('ابدأ اليوم', 'Start today')}</span>
              <h2>{tx(<>خطوتك الأولى نحو دخل من <span className="en gold-grad">eBay</span></>, <>Your first step toward income from <span className="en gold-grad">eBay</span></>)}</h2>
              <p>{tx('احجز استشارة مباشرة مع الكوتش بشار، أو سجّل في الدورة وابدأ التطبيق الفعلي من اليوم.', 'Book a direct consultation with Coach Bashar, or enroll and start applying from today.')}</p>
              <div className="cta-actions">
                <a className="btn btn-gold" href="#booking">{tx('احجز استشارة مجانية', 'Book a free consultation')}</a>
                <a className="btn btn-ghost" href="#courses">{tx('سجّل في الدورة', 'Enroll in the course')}</a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand" href="#top"><span className="mark">ب</span><span><b>{tx('بشار العسلي','Bashar Al-Asali')}</b><small>EBAY ACADEMY</small></span></a>
              <p>{tx(<>أكاديمية متخصصة في التجارة الإلكترونية على <span className="en gold">eBay</span> — منهج عملي ومتابعة حقيقية تبني مشروعاً مستداماً.</>, <>An academy specialized in e-commerce on eBay — a practical method and real mentorship.</>)}</p>
            </div>
            <div className="foot-col">
              <h5>{tx('الموقع','Site')}</h5>
              <a href="#about">{tx('القصة','Story')}</a>
              <a href="#steps">{tx('كيف تبدأ','How it works')}</a>
              <a href="#courses">{tx('الدورات','Courses')}</a>
              <a href="#faq">{tx('الأسئلة','FAQ')}</a>
            </div>
            <div className="foot-col">
              <h5>{tx('البرامج','Programs')}</h5>
              <a href="#courses">{tx('الدورة الشاملة','The complete course')}</a>
              <a href="#courses">{tx('الاشتراك الشهري','Monthly subscription')}</a>
              <a href="#booking">{tx('استشارة خاصة','Private consultation')}</a>
            </div>
            <div className="foot-col">
              <h5>{tx('تواصل','Contact')}</h5>
              <a href="https://wa.me/00962790360675">{tx('واتساب','WhatsApp')}</a>
              <a href="https://www.instagram.com/basharalasali/" target="_blank" rel="noopener">Instagram</a>
              <a href="https://www.youtube.com/@coachbasharalasali" target="_blank" rel="noopener">YouTube</a>
              <a href="/login">{tx('تسجيل الدخول للطلاب','Student login')}</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>{tx('© 2026 بشار العسلي — جميع الحقوق محفوظة','© 2026 Bashar Al-Asali — All rights reserved')}</span>
            <span className="en">Bashar Al-Asali · eBay Academy</span>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <a className="wa-float" href="https://wa.me/00962790360675" target="_blank" rel="noopener">
        <span className="wic"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.32zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></span>
        <span>{tx('تواصل عبر واتساب','Chat on WhatsApp')}</span>
      </a>
    </>
  )
}

// ── Booking form component ────────────────────────────────────────────────
function BookingForm({ lang, tx }) {
  const ar = lang === 'ar'
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [plan, setPlan] = useState('0')
  const [note, setNote] = useState('')

  function submit(e) {
    e.preventDefault()
    const plans = [tx('الدورة الشاملة على eBay','The complete eBay course'), tx('الاشتراك الشهري','Monthly subscription'), tx('لست متأكداً — انصحني','Not sure yet — advise me')]
    const msg = ar
      ? `مرحباً كوتش بشار، أنا ${name}. مهتم بـ: ${plans[plan]}. رقم واتسابي: ${phone}.${note ? ` ملاحظة: ${note}` : ''}`
      : `Hello Coach Bashar, I'm ${name}. Interested in: ${plans[plan]}. My WhatsApp: ${phone}.${note ? ` Note: ${note}` : ''}`
    window.open('https://wa.me/00962790360675?text=' + encodeURIComponent(msg), '_blank')
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <h3>{tx('اطلب استشارتك', 'Request your consultation')}</h3>
      <p className="fsub">{tx('املأ النموذج وسنكمل على واتساب فوراً.', 'Fill the form and we\'ll continue on WhatsApp instantly.')}</p>
      <div className="field">
        <label>{tx('الاسم الكامل', 'Full name')}</label>
        <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder={tx('اكتب اسمك','Your name')} />
      </div>
      <div className="field">
        <label>{tx('رقم الواتساب', 'WhatsApp number')}</label>
        <input type="tel" required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+962 7X XXX XXXX" />
      </div>
      <div className="field">
        <label>{tx('الباقة التي تهمّك', 'Which plan interests you?')}</label>
        <select value={plan} onChange={e=>setPlan(e.target.value)}>
          <option value="0">{tx('الدورة الشاملة على eBay','The complete eBay course')}</option>
          <option value="1">{tx('الاشتراك الشهري','Monthly subscription')}</option>
          <option value="2">{tx('لست متأكداً — انصحني','Not sure yet — advise me')}</option>
        </select>
      </div>
      <div className="field">
        <label>{tx('ما الذي يمنعك من البدء؟ (اختياري)', 'What\'s stopping you from starting? (optional)')}</label>
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={tx('اكتب باختصار…','Write briefly…')} />
      </div>
      <button type="submit" className="btn btn-gold">{tx('إرسال عبر واتساب', 'Send via WhatsApp')}</button>
      <div className="form-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>{tx('بياناتك تُرسل مباشرة إلى واتساب.', 'Your details are sent straight to WhatsApp.')}</span>
      </div>
    </form>
  )
}

// ── getServerSideProps — redirect logged-in users ─────────────────────────
export async function getServerSideProps({ req }) {
  const { parse }       = await import('cookie')
  const { verifyToken } = await import('../lib/auth')
  const { getUser }     = await import('../lib/users-store')
  const cookies = parse(req.headers.cookie || '')
  const token   = cookies['ba_session']
  if (token) {
    const session = verifyToken(token)
    if (session) {
      const user = await getUser(session.username)
      if (user) return { redirect: { destination: user.role === 'admin' ? '/admin' : '/dashboard', permanent: false } }
    }
  }
  return { props: {} }
}
