import { useState, useEffect, useRef } from 'react'
import { Bot, GripVertical } from 'lucide-react'

interface FloatingCopilotButtonProps {
  onClick: () => void
}

const STORAGE_KEY = 'civic_copilot_float_pos'

export function FloatingCopilotButton({ onClick }: FloatingCopilotButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  // Track drag start state
  const dragStartRef = useRef<{
    startX: number
    startY: number
    initialX: number
    initialY: number
    hasMoved: boolean
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false })

  // Initialize position on mount (restore from localStorage or default to bottom-right)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Clamp to current viewport
          const clampedX = Math.min(Math.max(12, parsed.x), window.innerWidth - 180)
          const clampedY = Math.min(Math.max(12, parsed.y), window.innerHeight - 60)
          setPosition({ x: clampedX, y: clampedY })
          return
        }
      }
    } catch {
      // Ignore parse error
    }

    // Default position: bottom-right
    const defaultX = Math.max(12, window.innerWidth - 220)
    const defaultY = Math.max(12, window.innerHeight - 70)
    setPosition({ x: defaultX, y: defaultY })
  }, [])

  // Handle window resize to keep button inside viewport
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return null
        const btnWidth = buttonRef.current?.offsetWidth || 190
        const btnHeight = buttonRef.current?.offsetHeight || 44
        const clampedX = Math.min(Math.max(12, prev.x), window.innerWidth - btnWidth - 12)
        const clampedY = Math.min(Math.max(12, prev.y), window.innerHeight - btnHeight - 12)
        return { x: clampedX, y: clampedY }
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click
    if (e.button !== 0) return
    if (!position) return

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    }
    setIsDragging(true)
  }

  // Touch Drag Handlers (Mobile & Tablet)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || !position) return
    const touch = e.touches[0]

    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: position.x,
      initialY: position.y,
      hasMoved: false
    }
    setIsDragging(true)
  }

  // Global move and end listeners when dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.startX
      const deltaY = e.clientY - dragStartRef.current.startY

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStartRef.current.hasMoved = true
      }

      const btnWidth = buttonRef.current?.offsetWidth || 190
      const btnHeight = buttonRef.current?.offsetHeight || 44

      const newX = Math.min(Math.max(10, dragStartRef.current.initialX + deltaX), window.innerWidth - btnWidth - 10)
      const newY = Math.min(Math.max(10, dragStartRef.current.initialY + deltaY), window.innerHeight - btnHeight - 10)

      setPosition({ x: newX, y: newY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const touch = e.touches[0]

      const deltaX = touch.clientX - dragStartRef.current.startX
      const deltaY = touch.clientY - dragStartRef.current.startY

      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        dragStartRef.current.hasMoved = true
      }

      const btnWidth = buttonRef.current?.offsetWidth || 190
      const btnHeight = buttonRef.current?.offsetHeight || 44

      const newX = Math.min(Math.max(10, dragStartRef.current.initialX + deltaX), window.innerWidth - btnWidth - 10)
      const newY = Math.min(Math.max(10, dragStartRef.current.initialY + deltaY), window.innerHeight - btnHeight - 10)

      setPosition({ x: newX, y: newY })
    }

    const handleEnd = () => {
      setIsDragging(false)
      // Save position to localStorage
      setPosition(current => {
        if (current) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
          } catch {
            // Ignore storage error
          }
        }
        return current
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleEnd)
    window.addEventListener('touchcancel', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
      window.removeEventListener('touchcancel', handleEnd)
    }
  }, [isDragging])

  const handleClick = (e: React.MouseEvent) => {
    // If user dragged more than 4px, don't trigger click action
    if (dragStartRef.current.hasMoved) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    onClick()
  }

  return (
    <button
      ref={buttonRef}
      className={`cc-assistant-toggle cc-floating-draggable ${isDragging ? 'is-dragging' : ''}`}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
              position: 'fixed',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none'
            }
          : undefined
      }
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      aria-label="Open AI Operations Assistant (Drag to reposition)"
      title="Ask operations copilot (Click to open, Drag to adjust position)"
    >
      <GripVertical size={13} className="drag-grip-icon" />
      <Bot size={19} />
      <span>Ask operations copilot</span>
    </button>
  )
}
