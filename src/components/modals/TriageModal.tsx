import { AlertTriangle, CheckCircle, ChevronRight, Navigation, ShieldCheck, X } from 'lucide-react'
import { QueueItem } from '../../types/operations'

interface TriageModalProps {
  item: QueueItem | null
  onClose: () => void
  onResolve: (itemId: string, actionNote: string) => void
  onReassign: (itemId: string, targetVehicle: string) => void
}

export function TriageModal({ item, onClose, onResolve, onReassign }: TriageModalProps) {
  if (!item) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card triage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="mono-kicker">INCIDENT RESOLUTION · DECISION QUEUE</span>
            <h2>Triage Operational Exception</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="triage-body">
          <div className="triage-info-box">
            <div className="info-top">
              <span className={`exception-mark ${item.severity}`} />
              <strong>{item.title}</strong>
              <span className="info-time">{item.time}</span>
            </div>
            <p className="info-detail">{item.detail}</p>
            <div className="info-tags">
              <span>District: <strong>{item.zone}</strong></span>
              {item.assignedVehicle && <span>Assigned Unit: <strong>{item.assignedVehicle}</strong></span>}
              <span>Status: <strong>{item.status}</strong></span>
            </div>
          </div>

          <div className="ai-recommendation-block">
            <div className="rec-badge">
              <ShieldCheck size={16} />
              <strong>Azure AI Operations Recommendation</strong>
            </div>
            <p>{item.recommendation || 'Standard operational clearance protocol applies.'}</p>
          </div>

          <div className="triage-action-options">
            <button 
              className="primary-btn full-w"
              onClick={() => {
                onResolve(item.id, 'Approved AI Recommendation')
                onClose()
              }}
            >
              <CheckCircle size={16} /> Execute Recommended Resolution
            </button>

            <button 
              className="secondary-btn full-w"
              onClick={() => {
                onReassign(item.id, 'R-05')
                onClose()
              }}
            >
              <Navigation size={16} /> Mobilize Standby Reserve Unit R-05
            </button>

            <button 
              className="ghost-btn full-w"
              onClick={() => {
                onResolve(item.id, 'Dismissed / Manually verified cleared')
                onClose()
              }}
            >
              Mark as Manually Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
