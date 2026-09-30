import { useEffect, useRef, useState } from 'react'
import { 
  Check, 
  Mic, 
  Radio, 
  Send, 
  Volume2, 
  VolumeX, 
  Wifi, 
  X 
} from 'lucide-react'

interface RadioDispatchModalProps {
  isOpen: boolean
  onClose: () => void
  onTriggerNotice: (msg: string) => void
  initialVehicleId?: string
  initialDriverName?: string
}

interface RadioLog {
  id: string
  time: string
  channel: string
  speaker: string
  recipient: string
  message: string
}

const initialLogs: RadioLog[] = [
  {
    id: 'rad-1',
    time: '09:41',
    channel: 'CH 2 (Reroutes)',
    speaker: 'SF Dispatch Control (Jordan)',
    recipient: 'Unit R-22 (Elena)',
    message: 'Tunnel Ave Transfer Station queue reached 34 mins. Prepare for SoMa bypass.'
  },
  {
    id: 'rad-2',
    time: '09:38',
    channel: 'CH 1 (Fleet)',
    speaker: 'Unit R-18 (Tariq)',
    recipient: 'SF Dispatch Control',
    message: 'Pier 96 MRF hopper unloader complete. Unit available for secondary assignment.'
  }
]

export function RadioDispatchModal({
  isOpen,
  onClose,
  onTriggerNotice,
  initialVehicleId = 'R-22',
  initialDriverName = 'Elena Rostova'
}: RadioDispatchModalProps) {
  const [targetUnit, setTargetUnit] = useState(initialVehicleId)
  const [selectedChannel, setSelectedChannel] = useState('Channel 2 · Reroutes & Logistics')
  const [messageText, setMessageText] = useState(`Attention Unit ${initialVehicleId}, transfer gate congested. Execute Pier Avenue bypass immediately.`)
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [logs, setLogs] = useState<RadioLog[]>(initialLogs)
  const [audioEnabled, setAudioEnabled] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Soundwave canvas animation
  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const numBars = 36
      const barWidth = canvas.width / numBars

      for (let i = 0; i < numBars; i++) {
        let height = isTransmitting 
          ? Math.sin(phase + i * 0.4) * 26 + Math.cos(phase * 1.5 + i * 0.2) * 16 + 32
          : Math.sin(phase + i * 0.2) * 6 + 10

        height = Math.max(4, Math.min(canvas.height - 4, height))
        const x = i * barWidth
        const y = (canvas.height - height) / 2

        ctx.fillStyle = isTransmitting ? '#d2e970' : '#3d7864'
        ctx.fillRect(x + 2, y, barWidth - 4, height)
      }

      phase += isTransmitting ? 0.25 : 0.04
      animationFrameRef.current = requestAnimationFrame(renderWave)
    }

    renderWave()

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isOpen, isTransmitting])

  if (!isOpen) return null

  const handleTransmit = () => {
    if (!messageText.trim()) return

    setIsTransmitting(true)

    // Web Speech API Synthesizer
    if (audioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(messageText)
      utterance.rate = 1.05
      utterance.pitch = 0.95
      utterance.onend = () => setIsTransmitting(false)
      utterance.onerror = () => setIsTransmitting(false)
      window.speechSynthesis.speak(utterance)
    } else {
      setTimeout(() => setIsTransmitting(false), 2200)
    }

    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newLog: RadioLog = {
      id: `rad-${Date.now()}`,
      time: timeStr,
      channel: selectedChannel.split('·')[0].trim(),
      speaker: 'SF Operations Control (Jordan)',
      recipient: `Unit ${targetUnit}`,
      message: messageText.trim()
    }

    setLogs(prev => [newLog, ...prev])
    onTriggerNotice(`Radio dispatch broadcast on ${selectedChannel} to Unit ${targetUnit}.`)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card radio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head radio-head">
          <div className="radio-title-group">
            <span className="radio-icon-box"><Radio size={18} /></span>
            <div>
              <span className="mono-kicker">TWO-WAY FLEET TELECOMMUNICATIONS</span>
              <h2>Municipal Dispatch Radio</h2>
            </div>
          </div>
          <div className="radio-head-actions">
            <button 
              className="radio-mute-btn" 
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Voice Synthesis Enabled' : 'Voice Synthesis Muted'}
            >
              {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close radio">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Audio Frequency Canvas */}
        <div className="radio-visualizer-container">
          <div className="radio-channel-display">
            <span><Wifi size={13} /> {selectedChannel}</span>
            <span className={`transmitting-tag ${isTransmitting ? 'active' : ''}`}>
              {isTransmitting ? '● TRANSMITTING ON AIR' : 'RECEIVING / STANDBY'}
            </span>
          </div>
          <canvas ref={canvasRef} width={460} height={70} className="soundwave-canvas" />
        </div>

        <div className="radio-form">
          <div className="form-row">
            <div className="form-group">
              <label>Radio Frequency Channel</label>
              <select 
                value={selectedChannel} 
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="modal-select"
              >
                <option value="Channel 1 · Fleet Operations">Channel 1 · Fleet Operations</option>
                <option value="Channel 2 · Reroutes & Logistics">Channel 2 · Reroutes & Logistics</option>
                <option value="Channel 3 · Hazardous Materials">Channel 3 · Hazardous Materials</option>
                <option value="Channel 4 · MRF & Facility Gates">Channel 4 · MRF & Facility Gates</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Field Unit</label>
              <select 
                value={targetUnit} 
                onChange={(e) => setTargetUnit(e.target.value)}
                className="modal-select"
              >
                <option value="R-22">Unit R-22 (Elena Rostova - Financial & SoMa)</option>
                <option value="R-14">Unit R-14 (Marcus Chen - Mission District)</option>
                <option value="R-18">Unit R-18 (Tariq Al-Mansoor - Fisherman Wharf)</option>
                <option value="R-08">Unit R-08 (Devon Vance - Sunset District)</option>
                <option value="R-03">Unit R-03 (Amina Idris - Bayview-Hunters Point)</option>
                <option value="R-05">Unit R-05 (Kavita Rao - Standby Reserve)</option>
                <option value="ALL">ALL UNITS (Emergency All-Call)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Radio Message Transmission</label>
            <div className="radio-input-wrap">
              <input 
                type="text" 
                value={messageText} 
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type dispatch transmission or advisory..."
                className="modal-input"
              />
              <button 
                type="button" 
                className="transmit-btn"
                onClick={handleTransmit}
                disabled={isTransmitting || !messageText.trim()}
              >
                <Mic size={15} /> Transmit
              </button>
            </div>
          </div>

          {/* Quick Preset Transmissions */}
          <div className="preset-chips">
            <span className="preset-label">Quick Presets:</span>
            <button 
              className="chip-btn"
              onClick={() => setMessageText(`Unit ${targetUnit}, please divert via Pier Avenue to avoid transfer queue.`)}
            >
              Divert to Bypass
            </button>
            <button 
              className="chip-btn"
              onClick={() => setMessageText(`Unit ${targetUnit}, report payload weighbridge status and current dwell.`)}
            >
              Request Dwell Status
            </button>
            <button 
              className="chip-btn"
              onClick={() => setMessageText(`Unit ${targetUnit}, smart bin overflow reported at central market. Re-route immediately.`)}
            >
              Smart Bin Urgent Pickup
            </button>
          </div>

          {/* Live Radio Log Transcript */}
          <div className="radio-logs-section">
            <span className="history-title">Recent Transmissions Feed:</span>
            <div className="radio-logs-list">
              {logs.map(log => (
                <div key={log.id} className="radio-log-row">
                  <div className="log-top">
                    <span className="log-time">{log.time}</span>
                    <span className="log-chan">{log.channel}</span>
                    <strong className="log-parties">{log.speaker} ➔ {log.recipient}</strong>
                  </div>
                  <p className="log-msg">"{log.message}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
