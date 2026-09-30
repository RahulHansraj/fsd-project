import { useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  Building2,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Factory,
  MapPin,
  Menu,
  MoreHorizontal,
  Plus,
  Recycle,
  Route,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { FlowLegend } from './components/dashboard/FlowLegend'
import { MetricCard } from './components/dashboard/MetricCard'
import { metrics, routes, wasteFlow } from './data/dashboard'
import type { DashboardTab } from './types/dashboard'

function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('Overview')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')

  const sendMessage = () => {
    if (!message.trim()) return
    setNotice(`CivicCycle has queued an operational brief for: ${message.trim()}`)
    setMessage('')
  }

  const runAction = (action: string) => setNotice(`${action} is ready for supervisor review.`)

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Recycle size={18} /></span><span>CivicCycle</span></div>
        <div className="city-switch"><Building2 size={16} /><span>San Francisco</span><ChevronDown size={15} /></div>
        <nav aria-label="Primary navigation">
          {(['Overview', 'Collections', 'Facilities', 'Reports'] as DashboardTab[]).map((tab, index) => {
            const Icon = [TrendingUp, Route, Factory, ShieldCheck][index]
            return <button key={tab} className={`nav-link ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}><Icon size={18} />{tab}</button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-link"><CircleHelp size={18} />Help center</button>
          <div className="user"><div className="avatar">JS</div><div><strong>Jordan Smith</strong><small>Operations lead</small></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation"><Menu size={20} /></button>
          <div><p className="eyebrow">Tuesday, September 1</p><h1>Good morning, Jordan</h1></div>
          <div className="header-actions"><button className="icon-button" aria-label="Search"><Search size={19} /></button><button className="icon-button notification" aria-label="Notifications"><Bell size={19} /><i /></button><button className="command" onClick={() => runAction('New collection task')}><Plus size={18} />New task</button></div>
        </header>

        {notice && <div className="toast"><ShieldCheck size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss"><X size={16} /></button></div>}

        <section className="status-strip">
          <div className="weather"><CloudSun size={22} /><span>23 C, Clear</span><span className="dot" /> <span>Collection window 06:00-18:00</span></div>
          <span className="live"><i />Live operational view</span>
        </section>

        <section className="metric-grid" aria-label="Key municipal metrics">
          {metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
        </section>

        <section className="content-grid">
          <article className="panel flow-panel">
            <div className="panel-heading"><div><p className="eyebrow">Material recovery</p><h2>Waste flow, today</h2></div><button className="subtle-action">View analysis <ArrowUpRight size={15} /></button></div>
            <div className="flow-total"><strong>418.2 t</strong><span>total intake</span></div>
            <div className="stacked-bar">{wasteFlow.map((category) => <span key={category.label} className={category.className} style={{ width: `${category.percentage}%` }} />)}</div>
            <div className="flow-legend">
              {wasteFlow.map((category) => <FlowLegend key={category.label} category={category} />)}
            </div>
            <div className="chart-area"><div className="chart-labels"><span>450t</span><span>300t</span><span>150t</span><span>0</span></div><svg viewBox="0 0 640 155" preserveAspectRatio="none" aria-label="Waste intake trend chart"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#3a8f68" stopOpacity=".2" /><stop offset="1" stopColor="#3a8f68" stopOpacity="0" /></linearGradient></defs><path d="M0 126 C42 103 62 121 98 91 S159 113 198 78 S252 103 291 65 S350 89 391 59 S451 86 488 44 S556 71 588 30 S621 48 640 15 L640 155 L0 155Z" fill="url(#area)" /><path d="M0 126 C42 103 62 121 98 91 S159 113 198 78 S252 103 291 65 S350 89 391 59 S451 86 488 44 S556 71 588 30 S621 48 640 15" fill="none" stroke="#3a8f68" strokeWidth="3" /></svg><div className="x-axis"><span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>Now</span></div></div>
          </article>

          <article className="panel map-panel">
            <div className="panel-heading"><div><p className="eyebrow">Collection coverage</p><h2>Fleet pulse</h2></div><button className="map-filter"><MapPin size={14} />All districts <ChevronDown size={14} /></button></div>
            <div className="map-canvas"><div className="road road-a" /><div className="road road-b" /><div className="road road-c" /><div className="water" /><span className="district d-one">Fisherman Wharf</span><span className="district d-two">Sunset District</span><span className="district d-three">Financial & SoMa</span><span className="vehicle v-one">14</span><span className="vehicle v-two">22</span><span className="vehicle v-three">08</span><div className="map-legend"><span><i className="green" />On route</span><span><i className="orange" />Attention</span></div></div>
            <div className="map-summary"><div><strong>38</strong><span>active vehicles</span></div><div><strong>12.4 t</strong><span>avg. per route</span></div><div><strong>2</strong><span>need review</span></div></div>
          </article>

          <article className="panel routes-panel">
            <div className="panel-heading"><div><p className="eyebrow">Field execution</p><h2>Routes requiring attention</h2></div><button className="subtle-action">All routes <ArrowUpRight size={15} /></button></div>
            <div className="route-list">{routes.map((route) => <div className="route" key={route.id}><span className="route-id">{route.id}</span><div className="route-copy"><strong>{route.district}</strong><small>{route.status}</small></div><div className="route-progress"><div><span style={{ width: `${route.progress}%`, background: route.color }} /></div><small>{route.progress}%</small></div><button className="dots" aria-label={`More actions for ${route.id}`}><MoreHorizontal size={18} /></button></div>)}</div>
          </article>

          <article className="panel insight-panel">
            <div className="insight-top"><span className="insight-icon"><Sparkles size={18} /></span><span className="eyebrow">OPERATIONS SIGNAL</span></div><h2>Contamination is trending up in Financial & SoMa.</h2><p>Mixed recycling at 3 drop-off points is 11% above its weekly baseline. A targeted collection notice could protect today's recovery rate.</p><div className="insight-footer"><span><Bot size={16} />CivicCycle Assist</span><button onClick={() => runAction('Collection notice')}><Send size={15} />Draft notice</button></div></article>
        </section>
      </section>

      <button className="copilot-fab" onClick={() => setCopilotOpen(true)}><Sparkles size={19} />Ask CivicCycle</button>
      {copilotOpen && <div className="assistant-sheet"><div className="assistant-head"><div><span className="brand-mark"><Sparkles size={15} /></span><strong>Operations assistant</strong></div><button onClick={() => setCopilotOpen(false)} aria-label="Close assistant"><X size={18} /></button></div><p>Use the operational context already on screen to prepare a concise decision brief.</p><div className="suggestions"><button onClick={() => setMessage('Explain the Financial & SoMa alert')}>Explain SoMa alert</button><button onClick={() => setMessage('Summarize fleet exceptions')}>Summarize fleet exceptions</button></div><div className="assistant-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendMessage()} placeholder="Ask about operations" /><button onClick={sendMessage} aria-label="Send message"><Send size={16} /></button></div></div>}
    </main>
  )
}

export default App