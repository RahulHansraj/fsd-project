import { useState } from 'react'
import { 
  BarChart3, 
  Download, 
  FileText, 
  Flame, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Wind, 
  X 
} from 'lucide-react'

interface TrendChartsModalProps {
  isOpen: boolean
  onClose: () => void
  onTriggerNotice: (msg: string) => void
}

const sevenDaysData = [
  { day: 'Wed', total: 398, organic: 154, recyclable: 122, rdf: 72, landfill: 50, diversion: 69.3 },
  { day: 'Thu', total: 412, organic: 160, recyclable: 128, rdf: 74, landfill: 50, diversion: 69.9 },
  { day: 'Fri', total: 425, organic: 168, recyclable: 132, rdf: 75, landfill: 50, diversion: 70.6 },
  { day: 'Sat', total: 440, organic: 175, recyclable: 138, rdf: 77, landfill: 50, diversion: 71.1 },
  { day: 'Sun', total: 380, organic: 145, recyclable: 118, rdf: 70, landfill: 47, diversion: 69.2 },
  { day: 'Mon', total: 405, organic: 158, recyclable: 125, rdf: 72, landfill: 50, diversion: 69.6 },
  { day: 'Today', total: 418, organic: 163, recyclable: 130, rdf: 75, landfill: 50, diversion: 70.1 }
]

const hourlyIntakeCurve = [
  { time: '06:00', tons: 14 },
  { time: '08:00', tons: 48 },
  { time: '10:00', tons: 72 }, // Peak morning haul
  { time: '12:00', tons: 56 },
  { time: '14:00', tons: 38 },
  { time: '16:00', tons: 52 },
  { time: '18:00', tons: 25 }
]

const methane24h = [
  { hour: '00:00', ppm: 240 },
  { hour: '04:00', ppm: 255 },
  { hour: '08:00', ppm: 275 },
  { hour: '12:00', ppm: 310 },
  { hour: '16:00', ppm: 290 },
  { hour: '20:00', ppm: 285 }
]

export function TrendChartsModal({ isOpen, onClose, onTriggerNotice }: TrendChartsModalProps) {
  const [activeTab, setActiveTab] = useState<'diversion' | 'hourly' | 'methane'>('diversion')
  const [hoveredDay, setHoveredDay] = useState<typeof sevenDaysData[0] | null>(sevenDaysData[6])

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card charts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <span className="mono-kicker">ADVANCED TELEMETRY ANALYTICS</span>
            <h2>Municipal Visual Trend Analytics</h2>
          </div>
          <div className="modal-head-actions">
            <button 
              className="secondary-btn-sm" 
              onClick={() => onTriggerNotice('Telemetry vectors exported to JSON/CSV dataset.')}
            >
              <Download size={13} /> Export Data
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="charts-tab-bar">
          <button 
            className={`charts-tab-btn ${activeTab === 'diversion' ? 'active' : ''}`}
            onClick={() => setActiveTab('diversion')}
          >
            <BarChart3 size={14} /> 7-Day Diversion Yield
          </button>
          <button 
            className={`charts-tab-btn ${activeTab === 'hourly' ? 'active' : ''}`}
            onClick={() => setActiveTab('hourly')}
          >
            <LineChart size={14} /> Hourly Weighbridge Curve
          </button>
          <button 
            className={`charts-tab-btn ${activeTab === 'methane' ? 'active' : ''}`}
            onClick={() => setActiveTab('methane')}
          >
            <Wind size={14} /> Methane (CH₄) Dispersion
          </button>
        </div>

        <div className="charts-body">
          {/* 1. 7-Day Diversion Stacked Chart */}
          {activeTab === 'diversion' && (
            <div className="chart-view">
              <div className="chart-meta-row">
                <div>
                  <strong>7-Day Material Flow Breakdown</strong>
                  <p>Organics + Recyclables + RDF vs Landfill Residual</p>
                </div>
                {hoveredDay && (
                  <div className="hovered-stats">
                    <span>{hoveredDay.day}: <b>{hoveredDay.total} tonnes</b></span>
                    <span className="diversion-pill">Diversion: {hoveredDay.diversion}%</span>
                  </div>
                )}
              </div>

              {/* Stacked Bars SVG */}
              <div className="svg-chart-container">
                <svg viewBox="0 0 540 180" className="trend-svg">
                  {/* Grid Lines */}
                  <line x1="40" y1="30" x2="520" y2="30" stroke="#e3e8e1" strokeDasharray="3,3" />
                  <line x1="40" y1="80" x2="520" y2="80" stroke="#e3e8e1" strokeDasharray="3,3" />
                  <line x1="40" y1="130" x2="520" y2="130" stroke="#e3e8e1" strokeDasharray="3,3" />

                  <text x="25" y="34" fontSize="9" fill="#879991" textAnchor="end">450t</text>
                  <text x="25" y="84" fontSize="9" fill="#879991" textAnchor="end">300t</text>
                  <text x="25" y="134" fontSize="9" fill="#879991" textAnchor="end">150t</text>

                  {sevenDaysData.map((d, i) => {
                    const x = 65 + i * 65
                    const maxH = 120
                    const scale = maxH / 460

                    const hLandfill = d.landfill * scale
                    const hRdf = d.rdf * scale
                    const hRecycle = d.recyclable * scale
                    const hOrganic = d.organic * scale

                    let curY = 150

                    return (
                      <g 
                        key={d.day} 
                        className="chart-bar-group" 
                        onMouseEnter={() => setHoveredDay(d)}
                      >
                        {/* Landfill (bottom) */}
                        <rect x={x} y={curY -= hLandfill} width="32" height={hLandfill} fill="#d4684e" rx="2" />
                        {/* RDF */}
                        <rect x={x} y={curY -= hRdf} width="32" height={hRdf} fill="#d99b45" />
                        {/* Recycled */}
                        <rect x={x} y={curY -= hRecycle} width="32" height={hRecycle} fill="#3d8eb9" />
                        {/* Organic (top) */}
                        <rect x={x} y={curY -= hOrganic} width="32" height={hOrganic} fill="#2d896b" rx="2" />

                        <text x={x + 16} y="166" fontSize="10" fill="#325246" textAnchor="middle" fontWeight="600">{d.day}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>

              {/* Chart Legend */}
              <div className="chart-legend-row">
                <span className="leg-item"><i style={{ background: '#2d896b' }} /> Organics ({hoveredDay?.organic}t)</span>
                <span className="leg-item"><i style={{ background: '#3d8eb9' }} /> Recycled ({hoveredDay?.recyclable}t)</span>
                <span className="leg-item"><i style={{ background: '#d99b45' }} /> Refuse Energy ({hoveredDay?.rdf}t)</span>
                <span className="leg-item"><i style={{ background: '#d4684e' }} /> Landfill Residual ({hoveredDay?.landfill}t)</span>
              </div>
            </div>
          )}

          {/* 2. Hourly Intake Curve */}
          {activeTab === 'hourly' && (
            <div className="chart-view">
              <div className="chart-meta-row">
                <div>
                  <strong>Weighbridge Throughput Dynamics</strong>
                  <p>Inflow rate (tonnes/hr) across municipal collection shifts</p>
                </div>
                <div className="hovered-stats">
                  <span>Peak Window: <b>10:00 - 11:30 (72 t/h)</b></span>
                </div>
              </div>

              <div className="svg-chart-container">
                <svg viewBox="0 0 540 180" className="trend-svg">
                  <defs>
                    <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#174e47" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#174e47" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <path 
                    d="M 60 140 Q 120 70 190 35 T 320 60 T 420 80 T 500 130 L 500 155 L 60 155 Z" 
                    fill="url(#curveGrad)" 
                  />
                  <path 
                    d="M 60 140 Q 120 70 190 35 T 320 60 T 420 80 T 500 130" 
                    fill="none" 
                    stroke="#174e47" 
                    strokeWidth="3.5" 
                  />

                  {hourlyIntakeCurve.map((pt, i) => {
                    const x = 60 + i * 73
                    const y = 150 - (pt.tons / 80) * 125
                    return (
                      <g key={pt.time}>
                        <circle cx={x} cy={y} r="5" fill="#d2e970" stroke="#174e47" strokeWidth="2.5" />
                        <text x={x} y={y - 10} fontSize="9" fontWeight="700" fill="#1b3e34" textAnchor="middle">{pt.tons}t</text>
                        <text x={x} y="170" fontSize="9" fill="#71867c" textAnchor="middle">{pt.time}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* 3. Methane Dispersion */}
          {activeTab === 'methane' && (
            <div className="chart-view">
              <div className="chart-meta-row">
                <div>
                  <strong>Pine Ridge Landfill Methane (CH₄) Dispersion (24h)</strong>
                  <p>Threshold line: 500 ppm regulatory ceiling</p>
                </div>
                <div className="hovered-stats">
                  <span>Current: <b>285 ppm (Nominal)</b></span>
                </div>
              </div>

              <div className="svg-chart-container">
                <svg viewBox="0 0 540 180" className="trend-svg">
                  {/* Danger Ceiling Line */}
                  <line x1="40" y1="45" x2="510" y2="45" stroke="#d4684e" strokeWidth="2" strokeDasharray="5,5" />
                  <text x="515" y="48" fontSize="8" fontWeight="700" fill="#ba3e26">500 ppm CEILING</text>

                  {/* Methane Path */}
                  <path 
                    d="M 60 120 C 130 115 200 110 270 95 S 400 102 480 105" 
                    fill="none" 
                    stroke="#2d896b" 
                    strokeWidth="3" 
                  />

                  {methane24h.map((pt, i) => {
                    const x = 60 + i * 84
                    const y = 150 - (pt.ppm / 550) * 125
                    return (
                      <g key={pt.hour}>
                        <circle cx={x} cy={y} r="4.5" fill="#fff" stroke="#2d896b" strokeWidth="2" />
                        <text x={x} y={y - 8} fontSize="9" fontWeight="700" fill="#1b3d33" textAnchor="middle">{pt.ppm} ppm</text>
                        <text x={x} y="170" fontSize="9" fill="#71867c" textAnchor="middle">{pt.hour}</text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
