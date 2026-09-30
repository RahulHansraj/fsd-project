import { useState } from 'react'
import { Check, Plus, Truck, X } from 'lucide-react'
import { QueueItem, ZoneName } from '../../types/operations'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: (newTask: QueueItem) => void
  initialZone?: ZoneName
  initialVehicle?: string
}

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  initialZone = 'Financial & SoMa',
  initialVehicle = 'R-22'
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [zone, setZone] = useState<ZoneName>(initialZone)
  const [vehicle, setVehicle] = useState(initialVehicle)
  const [severity, setSeverity] = useState<'high' | 'medium' | 'resolved'>('high')
  const [taskType, setTaskType] = useState('Urgent Overflow Collection')
  const [detail, setDetail] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')

    const newTask: QueueItem = {
      id: `TASK-${Date.now().toString().slice(-4)}`,
      time: `${hours}:${mins}`,
      title: title.trim(),
      detail: detail.trim() || `${taskType} assigned to ${vehicle} in ${zone}`,
      severity,
      zone,
      assignedVehicle: vehicle,
      status: 'Pending',
      recommendation: `Field task dispatched to unit ${vehicle}. Follow municipal radio channel 4.`
    }

    onTaskCreated(newTask)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="mono-kicker">OPERATIONAL DISPATCH</span>
            <h2>Create New Field Operations Task</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Task Title / Summary *</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Clear overflowing drop-off bin at Sector 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="modal-input"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target District / Ward</label>
              <select 
                value={zone} 
                onChange={(e) => setZone(e.target.value as ZoneName)}
                className="modal-select"
              >
                <option value="Financial & SoMa">Financial & SoMa</option>
                <option value="Mission District">Mission District</option>
                <option value="Sunset District">Sunset District</option>
                <option value="Bayview-Hunters Point">Bayview-Hunters Point</option>
                <option value="Fisherman Wharf">Fisherman Wharf</option>
                <option value="Richmond District">Richmond District</option>
                <option value="Chinatown & North Beach">Chinatown & North Beach</option>
                <option value="Civic Center & Tenderloin">Civic Center & Tenderloin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign Vehicle Unit</label>
              <select 
                value={vehicle} 
                onChange={(e) => setVehicle(e.target.value)}
                className="modal-select"
              >
                <option value="R-22">Unit R-22 (Side Loader)</option>
                <option value="R-14">Unit R-14 (EV Compactor)</option>
                <option value="R-18">Unit R-18 (EV Compactor)</option>
                <option value="R-08">Unit R-08 (Organic Dumper)</option>
                <option value="R-03">Unit R-03 (Side Loader)</option>
                <option value="R-05">Unit R-05 (Standby Reserve)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Task Category</label>
              <select 
                value={taskType} 
                onChange={(e) => setTaskType(e.target.value)}
                className="modal-select"
              >
                <option value="Urgent Overflow Collection">Urgent Overflow Collection</option>
                <option value="Contamination Purge">Contamination Purge & Inspection</option>
                <option value="Commercial Reroute">Commercial Corridor Reroute</option>
                <option value="Hazardous Transport">Hazardous Battery / E-Waste Transport</option>
                <option value="Drop-off Maintenance">Drop-off Bin Sensor Maintenance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority Severity</label>
              <select 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value as any)}
                className="modal-select"
              >
                <option value="high">High (Urgent Response)</option>
                <option value="medium">Medium (Next Window)</option>
                <option value="resolved">Routine</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Field Notes & Instructions</label>
            <textarea 
              rows={3}
              placeholder="Provide specific access instructions, weighbridge slip reference, or safety hazards..."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="modal-textarea"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Plus size={16} /> Dispatch Task to Fleet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
