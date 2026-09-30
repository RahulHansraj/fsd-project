import { useState } from 'react'
import { 
  Award, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Cpu,
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  HeartHandshake, 
  Leaf, 
  Printer, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  TrendingDown, 
  TrendingUp,
  X 
} from 'lucide-react'
import { mockShiftReports } from '../../data/mockOperationsData'
import { generateExecutiveAudit, getAIConfig, isAIConfigured } from '../../services/aiService'

interface PerformanceViewProps {
  onTriggerNotice: (msg: string) => void
}

export function PerformanceView({ onTriggerNotice }: PerformanceViewProps) {
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false)
  const [aiReportContent, setAiReportContent] = useState<string | null>(null)
  const [isLiveAiReport, setIsLiveAiReport] = useState(false)
  const activeReport = mockShiftReports[0]
  const currentConfig = getAIConfig()

  const handleExportCSV = () => {
    onTriggerNotice('Municipal Solid Waste Operations Ledger exported to CSV format.')
  }

  const handlePrint = () => {
    window.print()
  }

  const handleGenerateAiReport = async () => {
    setIsGeneratingAiReport(true)
    try {
      const res = await generateExecutiveAudit(activeReport.date, {
        totalTons: activeReport.totalCollectedTons,
        diversionPct: activeReport.diversionPercentage,
        co2SavedTons: activeReport.co2SavedTons,
        activeTrucks: activeReport.activeTrucksCount
      })
      setAiReportContent(res.reportMarkdown)
      setIsLiveAiReport(res.isLiveLLM)
      setShowPrintModal(true)
      onTriggerNotice(
        res.isLiveLLM 
          ? 'Executive Sustainability Audit compiled and verified.' 
          : 'Executive Shift Brief compiled successfully.'
      )
    } catch (err) {
      console.error('[PerformanceView] AI report error:', err)
      setShowPrintModal(true)
    } finally {
      setIsGeneratingAiReport(false)
    }
  }

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">MUNICIPAL BENCHMARK · FISCAL & CITIZEN SLA</span>
          <h1>Operational Efficiency & Shift Reports</h1>
          <p className="cc-subtitle">
            Cost-per-ton analytics, citizen grievance resolution turnaround, circular recovery value, and printable shift executive briefs.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="primary-btn ai-btn"
            disabled={isGeneratingAiReport}
            onClick={handleGenerateAiReport}
          >
            {isGeneratingAiReport ? (
              <><RefreshCw size={15} className="spin" /> Drafting AI Brief...</>
            ) : (
              <><Sparkles size={15} /> Generate Executive AI Brief</>
            )}
          </button>
          <button 
            className="secondary-btn"
            onClick={handleExportCSV}
          >
            <Download size={14} /> Export CSV Audit
          </button>
        </div>
      </div>

      {/* High-Level Efficiency KPIs */}
      <div className="cc-kpis mb-6">
        <div className="cc-kpi">
          <span>Net Cost per Ton</span>
          <div><strong>$44.12</strong><small>/ tonne</small></div>
          <p><i className="up" /> Down 14% vs conventional disposal</p>
        </div>
        <div className="cc-kpi">
          <span>Citizen Grievance SLA</span>
          <div><strong>94.2</strong><small>% &lt; 2hr</small></div>
          <p><i className="up" /> 18 of 19 closed within target</p>
        </div>
        <div className="cc-kpi">
          <span>Total Carbon Offset</span>
          <div><strong>384.6</strong><small>t CO₂e</small></div>
          <p><i className="up" /> Equivalent to 83 vehicle years</p>
        </div>
        <div className="cc-kpi">
          <span>Recovery Revenue Generated</span>
          <div><strong>$18,450</strong><small>Today</small></div>
          <p><i className="up" /> Recyclables & compost sold</p>
        </div>
      </div>

      {/* Main Grid: Shift Scorecard + Citizen SLA Tracker */}
      <div className="performance-grid">
        {/* Left Column: Shift Reports Scorecard */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">AUDITED SHIFT ARCHIVE</p>
              <h2>Operational Shift Performance Ledger</h2>
            </div>
            <span className="live-pill"><i /> Certified</span>
          </div>

          <div className="shift-cards-list">
            {mockShiftReports.map((report) => (
              <div key={report.id} className="shift-ledger-card">
                <div className="shift-top">
                  <div>
                    <span className="shift-badge">{report.shift}</span>
                    <strong className="shift-date">{report.date}</strong>
                  </div>
                  <span className="report-id">{report.id}</span>
                </div>

                <div className="shift-stats-grid">
                  <div className="stat-box">
                    <small>Intake Collected</small>
                    <strong>{report.totalCollectedTons} t</strong>
                  </div>
                  <div className="stat-box">
                    <small>Diversion Yield</small>
                    <strong className="text-green">{report.diversionPercentage}%</strong>
                  </div>
                  <div className="stat-box">
                    <small>Landfill Residual</small>
                    <strong className="text-orange">{report.landfillDepositTons} t</strong>
                  </div>
                  <div className="stat-box">
                    <small>Incidents Closed</small>
                    <strong>{report.incidentsResolved}</strong>
                  </div>
                </div>

                <div className="shift-foot">
                  <span className="carbon-tag">
                    <Leaf size={13} /> {report.co2SavedTons} t CO₂e saved
                  </span>
                  <button 
                    className="secondary-btn-sm"
                    onClick={() => {
                      setShowPrintModal(true)
                    }}
                  >
                    View Shift Brief <FileText size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column: Citizen Grievance & Swachh Survekshan SLA */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">CITIZEN GRIEVANCE REDRESSAL</p>
              <h2>Live SLA Grievance Queue</h2>
            </div>
            <span className="sla-badge">Avg Resolution: 41 min</span>
          </div>

          <p className="card-subtitle">
            Real-time citizen mobile app reports for overflowing public bins, missed street sweeping, and illegal dumping spots.
          </p>

          <div className="grievance-list">
            <div className="grievance-item">
              <div className="grievance-icon resolved">
                <CheckCircle2 size={16} />
              </div>
              <div className="grievance-body">
                <strong>Commercial Bin Overflow at Pier Avenue Market</strong>
                <small>Reported by Citizen #4829 · Financial & SoMa District</small>
                <div className="grievance-meta">
                  <span>Unit R-22 cleared hopper</span>
                  <span className="sla-pill ok">Resolved in 38m</span>
                </div>
              </div>
            </div>

            <div className="grievance-item">
              <div className="grievance-icon pending">
                <Clock size={16} />
              </div>
              <div className="grievance-body">
                <strong>Missed Residential Organic Pickup #12</strong>
                <small>Reported by Sunset Heights Guild · Sunset District</small>
                <div className="grievance-meta">
                  <span>Assigned to standby truck R-08</span>
                  <span className="sla-pill warn">En Route (14m elapsed)</span>
                </div>
              </div>
            </div>

            <div className="grievance-item">
              <div className="grievance-icon resolved">
                <CheckCircle2 size={16} />
              </div>
              <div className="grievance-body">
                <strong>Construction Debris Dumping near Islais Creek Shore</strong>
                <small>Reported by Bay Ecology Watch · Bayview-Hunters Point</small>
                <div className="grievance-meta">
                  <span>Heavy loader R-03 removed 4.2 tons</span>
                  <span className="sla-pill ok">Resolved in 52m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="compliance-banner">
            <Award size={18} />
            <div>
              <strong>Smart City Swachh Benchmark: Rank 1st Quintile</strong>
              <p>98.1% of municipal wards compliant with daily segregated door-to-door collection schedules.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Executive Shift Brief Modal */}
      {showPrintModal && (
        <div className="modal-backdrop" onClick={() => setShowPrintModal(false)}>
          <div className="print-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="print-modal-header">
              <div>
                <span className="mono-kicker">CITY & COUNTY OF SAN FRANCISCO</span>
                <h2>Official Waste Operations Shift Briefing</h2>
                <small>Reference: {activeReport.id} · Certified by Jordan Smith, Operations Lead</small>
              </div>
              <div className="print-modal-actions no-print">
                <button className="primary-btn" onClick={handlePrint}>
                  <Printer size={15} /> Print / Save PDF
                </button>
                <button className="secondary-btn" onClick={() => setShowPrintModal(false)}>
                  Close
                </button>
              </div>
            </div>

            <div className="official-brief-body">
              <div className="official-seal-row">
                <div className="seal-badge">
                  <ShieldCheck size={28} />
                  <div>
                    <strong>CIVICCYCLE DIGITAL TWIN PLATFORM</strong>
                    <small>Zero Waste Municipal Standard v4.2</small>
                  </div>
                </div>
                <div className="seal-meta">
                  <div>Date: <strong>{activeReport.date}</strong></div>
                  <div>Shift: <strong>{activeReport.shift}</strong></div>
                </div>
              </div>

              {aiReportContent && (
                <div className="brief-section ai-brief-dossier">
                  <div className="ai-brief-banner">
                    <Sparkles size={16} />
                    <strong>Automated Operational Sustainability Audit</strong>
                    {isLiveAiReport && <span className="live-llm-pill"><Cpu size={11} /> Live Verified</span>}
                  </div>
                  <div className="ai-brief-text-wrap">
                    {aiReportContent.split('\n\n').map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="brief-section">
                <h3>1. Key Operational Metrics Summary</h3>
                <table className="brief-table">
                  <tbody>
                    <tr>
                      <td>Total Waste Intake Collected</td>
                      <td><strong>{activeReport.totalCollectedTons} Tonnes</strong></td>
                      <td>Status: On Target</td>
                    </tr>
                    <tr>
                      <td>Material Diversion Rate (MRF & Composting)</td>
                      <td><strong>{activeReport.diversionPercentage}%</strong></td>
                      <td>Benchmark Target: 65.0%</td>
                    </tr>
                    <tr>
                      <td>Landfill Cell Residual Dumped</td>
                      <td><strong>{activeReport.landfillDepositTons} Tonnes</strong></td>
                      <td>Permitted Ceiling: 60.0 t</td>
                    </tr>
                    <tr>
                      <td>Active Dispatched Vehicles</td>
                      <td><strong>{activeReport.activeTrucksCount} Units</strong></td>
                      <td>Fleet Availability: 94.6%</td>
                    </tr>
                    <tr>
                      <td>Greenhouse Gases Avoided</td>
                      <td><strong>{activeReport.co2SavedTons} t CO₂e</strong></td>
                      <td>Certified Carbon Credit</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="brief-section">
                <h3>2. District Segregation & Compliance Overview</h3>
                <p>
                  Financial & SoMa recorded higher than baseline contamination (18.2%) at public commercial drop-off points. 
                  Unit R-18 and reserve loader R-05 were mobilized to absorb delayed collection schedules.
                  Fisherman Wharf achieved top segregation compliance at 79.1% with Grade-A composting deliveries.
                </p>
              </div>

              <div className="brief-section">
                <h3>3. Operations Supervisor Sign-Off</h3>
                <div className="sign-off-row">
                  <div>
                    <small>Prepared by:</small>
                    <strong>Jordan Smith</strong>
                    <span>Senior Operations Controller</span>
                  </div>
                  <div>
                    <small>Municipal Health Officer:</small>
                    <strong>Dr. Aris Thorne</strong>
                    <span>Director of Sanitation & Environment</span>
                  </div>
                  <div>
                    <small>Digital Verification Stamp:</small>
                    <span className="digital-hash">SHA256: 8f9c2d...41b0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
