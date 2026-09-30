import { useState } from 'react'
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Cpu, 
  Eye, 
  FileCheck, 
  Filter, 
  Flame, 
  Layers, 
  Leaf, 
  MessageSquare,
  RefreshCw, 
  Scan, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  Trash2 
} from 'lucide-react'
import { AIVisionSample, WasteStreamCategory, ZoneData } from '../../types/operations'
import { mockAIVisionSamples, mockWasteStreams } from '../../data/mockOperationsData'
import { analyzeWasteScan, getAIConfig, isAIConfigured } from '../../services/aiService'

interface SegregationViewProps {
  zones: ZoneData[]
  onTriggerNotice: (msg: string) => void
}

export function SegregationView({ zones, onTriggerNotice }: SegregationViewProps) {
  const [selectedSample, setSelectedSample] = useState<AIVisionSample>(mockAIVisionSamples[0])
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<AIVisionSample | null>(mockAIVisionSamples[0])
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('All')
  const [customInquiry, setCustomInquiry] = useState('')
  const [inquiryResult, setInquiryResult] = useState<string | null>(null)
  const [isLiveLLMVerdict, setIsLiveLLMVerdict] = useState(false)
  const currentConfig = getAIConfig()
  const isConfigLive = isAIConfigured()

  const handleRunAiAudit = async (sample: AIVisionSample, customPrompt?: string) => {
    setSelectedSample(sample)
    setIsScanning(true)
    setScanResult(null)
    setInquiryResult(null)

    try {
      const res = await analyzeWasteScan(sample, customPrompt)
      setIsLiveLLMVerdict(res.isLiveLLM)
      setScanResult({
        ...sample,
        aiVerdict: res.verdict,
        contaminationScore: res.contaminationScore,
        actionRecommendation: res.remediationRecommendation
      })
      if (res.isLiveLLM) {
        setInquiryResult(res.analysisText)
        onTriggerNotice(`Live AI Analysis (${currentConfig.model}): ${res.verdict} (${res.contaminationScore}% contamination)`)
      } else {
        onTriggerNotice(`AI Optical Model evaluated: ${sample.title} (${sample.aiVerdict})`)
      }
    } catch (err) {
      console.error('[SegregationView] Audit error:', err)
      setScanResult(sample)
    } finally {
      setIsScanning(false)
    }
  }

  const filteredZones = selectedZoneFilter === 'All' 
    ? zones 
    : zones.filter(z => z.name === selectedZoneFilter)

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">MUNICIPAL DIGITAL AUDIT · ZERO WASTE BENCHMARK</span>
          <h1>Waste Segregation & AI Vision Audit</h1>
          <p className="cc-subtitle">
            Source segregation compliance tracking, IoT bin classification, and automated computer vision contamination detection powered by Azure AI Foundry.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="secondary-btn"
            onClick={() => onTriggerNotice('All 4 ward segregation scores synchronized with cloud sensors.')}
          >
            <RefreshCw size={14} /> Refresh Sensor Streams
          </button>
        </div>
      </div>

      {/* Stream Metrics Breakdown */}
      <section className="stream-grid">
        {mockWasteStreams.map((stream) => (
          <div key={stream.label} className="stream-card" style={{ borderTop: `3px solid ${stream.color}` }}>
            <div className="stream-head">
              <span className="stream-name">{stream.label}</span>
              <span className="stream-tonnage">{stream.tonnage} t/day</span>
            </div>
            <div className="stream-bar-wrap">
              <div className="stream-bar" style={{ width: `${stream.percentage}%`, background: stream.color }} />
            </div>
            <div className="stream-foot">
              <span>{stream.percentage}% of total waste</span>
              <span className="compliance-badge">
                Compliance: <strong>{stream.complianceRate}%</strong>
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Grid: Zone Compliance Table + AI Vision Inspector */}
      <div className="seg-main-grid">
        {/* Left Column: Zone Breakdown Table */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">DISTRICT SCORECARD</p>
              <h2>Ward Segregation Compliance</h2>
            </div>
            <div className="filter-group">
              <Filter size={13} />
              <select 
                value={selectedZoneFilter} 
                onChange={(e) => setSelectedZoneFilter(e.target.value)}
                className="select-input"
              >
                <option value="All">All Districts</option>
                {zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Ward / District</th>
                  <th>Population</th>
                  <th>Segregation %</th>
                  <th>Contamination %</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredZones.map((zone) => (
                  <tr key={zone.name}>
                    <td>
                      <strong>{zone.name}</strong>
                      <small className="sub-text">{zone.dailyTons} t daily intake</small>
                    </td>
                    <td>{zone.population.toLocaleString()}</td>
                    <td>
                      <div className="table-progress-wrap">
                        <div className="table-progress-bar">
                          <span 
                            style={{ 
                              width: `${zone.segregationRate}%`,
                              background: zone.segregationRate > 70 ? '#2d896b' : zone.segregationRate > 55 ? '#d99b45' : '#d4684e'
                            }} 
                          />
                        </div>
                        <span>{zone.segregationRate}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`contam-pill ${zone.contaminationRate > 15 ? 'high' : 'normal'}`}>
                        {zone.contaminationRate}%
                      </span>
                    </td>
                    <td>
                      <span className={`status-tag ${zone.state}`}>
                        {zone.state === 'healthy' ? 'Compliant' : zone.state === 'attention' ? 'Needs Review' : 'Critical Spike'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="table-action-btn"
                        onClick={() => onTriggerNotice(`Educational WhatsApp circular dispatched to ${zone.name} residential welfare associations.`)}
                      >
                        Push Notice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card-callout-footer">
            <ShieldAlert size={16} />
            <div>
              <strong>Municipal Ordinance Rule 4(A) Enforcement</strong>
              <p>Wards with segregation rates under 60% are flagged for secondary inspection before landfill transfer.</p>
            </div>
          </div>
        </section>

        {/* Right Column: Azure AI Foundry Vision Inspector */}
        <section className="cc-card ai-vision-panel">
          <div className="cc-card-head">
            <div>
              <span className="badge-ai"><Cpu size={13} /> Azure AI Foundry · Vision Model</span>
              <h2>Automated Contamination Inspector</h2>
            </div>
            <span className="model-chip">Model: GPT-4o-Vision-Audit</span>
          </div>

          <p className="vision-intro">
            Inspect real-time optical camera captures at MRF conveyors and public smart drop-off hoppers to detect non-segregated materials before processing.
          </p>

          {/* Sample Switcher */}
          <div className="sample-selector">
            <span className="selector-label">Select Audit Feed Snapshot:</span>
            <div className="sample-chips">
              {mockAIVisionSamples.map((sample) => (
                <button
                  key={sample.id}
                  className={`sample-chip ${selectedSample.id === sample.id ? 'active' : ''}`}
                  onClick={() => handleRunAiAudit(sample)}
                >
                  <Eye size={13} />
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Canvas Area */}
          <div className="vision-canvas-container">
            <div className={`vision-canvas ${isScanning ? 'scanning' : ''}`}>
              <img src={selectedSample.image} alt={selectedSample.title} className="vision-img" />
              {isScanning && (
                <div className="scan-overlay">
                  <div className="scan-line" />
                  <div className="scan-text">
                    <Sparkles size={16} className="spin" />
                    <span>Running Azure AI Foundry Vision classification...</span>
                  </div>
                </div>
              )}
              {scanResult && !isScanning && (
                <div className="detection-overlay">
                  {scanResult.detectedItems.map((item, i) => (
                    <div 
                      key={item.name} 
                      className={`detected-tag ${item.isContaminant ? 'contaminant' : 'clean'}`}
                      style={{ top: `${15 + i * 22}%`, left: `${10 + (i % 2) * 40}%` }}
                    >
                      <span>{item.name}</span>
                      <b>{item.confidence}%</b>
                      {item.isContaminant && <AlertTriangle size={12} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detection Analysis Details */}
          {scanResult && (
            <div className="audit-results-card">
              <div className="audit-header">
                <div>
                  <small className="mono-kicker">AI VERDICT</small>
                  <div className={`verdict-pill ${scanResult.contaminationScore > 25 ? 'crit' : scanResult.contaminationScore > 5 ? 'warn' : 'pass'}`}>
                    {scanResult.contaminationScore > 25 ? <AlertOctagon size={16} /> : scanResult.contaminationScore > 5 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                    <span>{scanResult.aiVerdict}</span>
                  </div>
                </div>
                <div className="score-badge">
                  <small>Contamination Score</small>
                  <strong>{scanResult.contaminationScore}%</strong>
                </div>
              </div>

              <div className="detected-list">
                <span className="list-title">Identified Items & Classes:</span>
                <div className="tag-cloud">
                  {scanResult.detectedItems.map((item) => (
                    <span 
                      key={item.name} 
                      className={`item-chip ${item.isContaminant ? 'flagged' : 'approved'}`}
                    >
                      {item.isContaminant ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                      {item.name} ({item.confidence}% confidence)
                    </span>
                  ))}
                </div>
              </div>

              {/* Live AI Reasoning / Custom Query Box */}
              <div className="ai-inquiry-box">
                <div className="inquiry-head">
                  <span className="mono-kicker">
                    <Sparkles size={13} /> AUTOMATED AUDITOR REASONING
                  </span>
                  {isLiveLLMVerdict && (
                    <span className="live-llm-pill">
                      <Cpu size={11} /> Real-Time Analysis
                    </span>
                  )}
                </div>
                {inquiryResult && (
                  <p className="inquiry-response-text">{inquiryResult}</p>
                )}
                <div className="inquiry-input-strip">
                  <input
                    type="text"
                    placeholder="Ask the material auditor about this scan (e.g. 'Can greasy cardboard be recycled?')..."
                    value={customInquiry}
                    onChange={(e) => setCustomInquiry(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customInquiry.trim()) {
                        handleRunAiAudit(selectedSample, customInquiry)
                        setCustomInquiry('')
                      }
                    }}
                  />
                  <button
                    className="inquiry-send-btn"
                    disabled={!customInquiry.trim() || isScanning}
                    onClick={() => {
                      if (customInquiry.trim()) {
                        handleRunAiAudit(selectedSample, customInquiry)
                        setCustomInquiry('')
                      }
                    }}
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>

              <div className="recommendation-box">
                <span className="mono-kicker">RECOMMENDED DISPATCH PROTOCOL</span>
                <p>{scanResult.actionRecommendation}</p>
                <div className="action-row">
                  <button 
                    className="primary-btn"
                    onClick={() => onTriggerNotice(`Protocol executed: ${scanResult.actionRecommendation}`)}
                  >
                    <CheckCircle2 size={14} /> Execute Protocol
                  </button>
                  <button 
                    className="secondary-btn"
                    onClick={() => onTriggerNotice(`Incident report drafted and sent to Municipal Health Officer for ${scanResult.title}.`)}
                  >
                    <Send size={14} /> Log Ward Violation
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
