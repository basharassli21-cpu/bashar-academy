// lib/sound.js — short "message sent" chime via Web Audio API (no asset files)

let ctx = null

export function playSendSound() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const notes = [
      { freq: 700,  start: 0,    dur: 0.09 },
      { freq: 1000, start: 0.06, dur: 0.12 },
    ]
    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.18, now + start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    })
  } catch {}
}
