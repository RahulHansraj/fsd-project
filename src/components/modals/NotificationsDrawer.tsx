import { AlertTriangle, Bell, Check, CheckCheck, Info, Trash2, X } from 'lucide-react'
import { SystemNotification } from '../../types/operations'

interface NotificationsDrawerProps {
  isOpen: boolean
  onClose: () => void
  notifications: SystemNotification[]
  onMarkAllRead: () => void
  onClearAll: () => void
  onSelectNotification: (notif: SystemNotification) => void
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSelectNotification
}: NotificationsDrawerProps) {
  if (!isOpen) return null

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="notifications-drawer">
        <div className="drawer-head">
          <div className="drawer-title">
            <Bell size={18} />
            <strong>System Alerts & Dispatch Feed</strong>
            {unreadCount > 0 && <span className="drawer-unread-badge">{unreadCount} New</span>}
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close alerts drawer">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-actions-bar">
          <button className="drawer-text-btn" onClick={onMarkAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
          <button className="drawer-text-btn danger" onClick={onClearAll}>
            <Trash2 size={14} /> Clear all
          </button>
        </div>

        <div className="drawer-list">
          {notifications.length === 0 ? (
            <div className="drawer-empty">
              <Check size={28} />
              <p>No operational notifications. All municipal systems streaming nominally.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`drawer-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => onSelectNotification(notif)}
              >
                <div className={`notif-icon ${notif.type}`}>
                  {notif.type === 'alert' ? <AlertTriangle size={15} /> : <Info size={15} />}
                </div>
                <div className="notif-body">
                  <div className="notif-top">
                    <strong>{notif.title}</strong>
                    <span className="notif-time">{notif.timestamp}</span>
                  </div>
                  <p className="notif-desc">{notif.description}</p>
                </div>
                {!notif.read && <span className="unread-dot" />}
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  )
}
