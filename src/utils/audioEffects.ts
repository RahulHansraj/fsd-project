// Lightweight Web Audio API Synthesizer (Zero External Dependencies)

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function playRadioChirp() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08)
    osc.frequency.setValueAtTime(1320, now + 0.09)

    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch (e) {
    // Audio context may be blocked before first user gesture
  }
}

export function playTelemetryPing() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(523.25, now) // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12) // C6

    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.14)
  } catch (e) {}
}

export function playDispatchConfirm() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime

    // Two-tone chord
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc2.type = 'sine'

    osc1.frequency.setValueAtTime(440, now)
    osc1.frequency.setValueAtTime(659.25, now + 0.08) // E5

    osc2.frequency.setValueAtTime(554.37, now)
    osc2.frequency.setValueAtTime(880, now + 0.08) // A5

    gain.gain.setValueAtTime(0.09, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 0.22)
    osc2.stop(now + 0.22)
  } catch (e) {}
}
