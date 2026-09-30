import { useEffect, useRef, useState } from 'react'
import { 
  ArrowRight, 
  Bot, 
  Check, 
  ChevronRight, 
  CornerDownLeft, 
  Cpu, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Wifi,
  X 
} from 'lucide-react'
import { 
  chatCompletion, 
  getAIConfig, 
  isAIConfigured, 
  ChatMessage,
  AIConfig 
} from '../../services/aiService'

interface Message {
  id: string
  sender: 'user' | 'assistant'
  text: string
  time: string
  isLiveLLM?: boolean
  actionLabel?: string
  actionTrigger?: string
}

interface AIAssistantDrawerProps {
  isOpen: boolean
  onClose: () => void
  onTriggerNotice: (msg: string) => void
  onExecuteAction?: (actionKey: string) => void
}

const initialMessages: Message[] = [
  {
    id: 'm1',
    sender: 'assistant',
    text: "Welcome to CivicCycle Operations Assistant. I am connected to San Francisco's live weighbridges, collection fleet GPS feeds, and Pier 96 recycling facility sorting systems. How can I assist your operational decisions today?",
    time: '09:47'
  }
]

const suggestedPrompts = [
  "Explain SoMa R-22 delay",
  "How can we extend Landfill runway?",
  "Draft contamination advisory for Financial & SoMa",
  "Summarize MRF sorting plant health"
]

function renderCleanContent(text: string) {
  if (!text) return null

  // Clean out triple quotes or markdown block markers
  let cleaned = text.replace(/^["'`]{1,3}|["'`]{1,3}$/g, '').trim()

  // Split into lines/blocks
  const rawLines = cleaned.split('\n').map(l => l.trim()).filter(Boolean)

  return (
    <div className="chat-formatted-body">
      {rawLines.map((line, idx) => {
        // Remove header hashes (e.g. ###, ##)
        const isHeader = /^#{1,6}\s*/.test(line)
        let lineText = line.replace(/^#{1,6}\s*/, '')

        // Detect and clean bullet points (* or - or 1.)
        const isBullet = /^[*-]\s+|\d+\.\s+/.test(lineText)
        if (isBullet) {
          lineText = lineText.replace(/^[*-]\s+|\d+\.\s+/, '')
        }

        // Parse **bold** syntax
        const parts = lineText.split(/(\*\*[^*]+\*\*)/g)
        const parsedNodes = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx}>{part.slice(2, -2)}</strong>
          }
          return part
        })

        if (isHeader) {
          return (
            <div key={idx} className="chat-header-row">
              <strong>{parsedNodes}</strong>
            </div>
          )
        }

        if (isBullet) {
          return (
            <div key={idx} className="chat-bullet-row">
              <span className="bullet-symbol">•</span>
              <span>{parsedNodes}</span>
            </div>
          )
        }

        return (
          <p key={idx} className="chat-p-row">
            {parsedNodes}
          </p>
        )
      })}
    </div>
  )
}

export function AIAssistantDrawer({
  isOpen,
  onClose,
  onTriggerNotice,
  onExecuteAction
}: AIAssistantDrawerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentConfig = getAIConfig()
  const isConfigLive = isAIConfigured()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!isOpen) return null

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue
    if (!text.trim()) return

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: `${hours}:${mins}`
    }

    setMessages(prev => [...prev, userMsg])
    setInputValue('')
    setIsTyping(true)

    // Build chat history for live LLM
    const history: ChatMessage[] = [
      ...messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text
      })),
      { role: 'user', content: text.trim() }
    ]

    try {
      const result = await chatCompletion(history)

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        time: `${hours}:${mins}`,
        isLiveLLM: result.isLiveLLM,
        actionLabel: result.actionLabel,
        actionTrigger: result.actionTrigger
      }

      setMessages(prev => [...prev, assistantMsg])
      if (result.isLiveLLM) {
        onTriggerNotice('Operations Copilot advisory updated.')
      }
    } catch (err) {
      console.error('[Copilot] Message processing error:', err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleActionClick = (actionTrigger?: string, actionLabel?: string) => {
    if (!actionTrigger) return
    onTriggerNotice(`AI Action executed: ${actionLabel}`)
    if (onExecuteAction) {
      onExecuteAction(actionTrigger)
    }
  }

  return (
    <aside className="ai-drawer" style={{ resize: 'none' }}>
      <div className="drawer-head">
        <div className="drawer-title">
          <span className="badge-ai-icon"><Sparkles size={16} /></span>
          <div>
            <strong>CivicCycle Operations Assistant</strong>
            <small className="ai-model-tag">
              <Cpu size={10} /> Operational Intelligence · Online
            </small>
          </div>
        </div>
          <div className="drawer-head-actions">
            <button className="close-btn" onClick={onClose} aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="ai-chat-thread">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-wrap ${msg.sender}`}>
              <div className="chat-bubble">
                {renderCleanContent(msg.text)}
                <div className="chat-meta-foot">
                  <span className="chat-time">{msg.time}</span>
                  {msg.isLiveLLM && (
                    <span className="chat-live-badge">
                      <Sparkles size={10} /> Verified
                    </span>
                  )}
                </div>
                {msg.actionLabel && (
                  <button 
                    className="ai-action-btn"
                    onClick={() => handleActionClick(msg.actionTrigger, msg.actionLabel)}
                  >
                    <ShieldCheck size={14} /> {msg.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble-wrap assistant">
              <div className="chat-bubble typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="ai-suggestions-row">
          <small className="suggestion-label">Suggested Queries:</small>
          <div className="suggestion-chips">
            {suggestedPrompts.map(prompt => (
              <button 
                key={prompt}
                className="sugg-chip"
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="ai-input-bar">
          <input 
            type="text" 
            placeholder="Ask about shift telemetry, delays, landfill runway, or drafting notices..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="ai-send-btn"
            onClick={() => handleSendMessage()}
            aria-label="Send message to AI assistant"
            disabled={!inputValue.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </aside>
  )
}
