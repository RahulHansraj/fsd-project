export type NavigationTab = 
  | 'command-center' 
  | 'segregation' 
  | 'facilities' 
  | 'landfill' 
  | 'fleet' 
  | 'smart-bins'
  | 'citizen-rewards'
  | 'sf-intelligence'
  | 'global-benchmarks'
  | 'performance'

export interface CircularCommodity {
  id: string
  symbol: string
  name: string
  price: number
  unit: string
  change24h: number
  trend: 'up' | 'down' | 'steady'
}

export type ZoneName = 
  | 'Mission District' 
  | 'Financial & SoMa' 
  | 'Fisherman Wharf' 
  | 'Sunset District' 
  | 'Richmond District' 
  | 'Bayview-Hunters Point' 
  | 'Chinatown & North Beach' 
  | 'Civic Center & Tenderloin'

export interface SF311Incident {
  id: string
  caseNumber: string
  title: string
  category: 'Illegal Dumping' | 'Overflowing Bin' | 'Hazardous Waste' | 'Missed Pickup' | 'Graffiti/Vandalism'
  description: string
  address: string
  district: ZoneName
  coordinates: [number, number]
  reportedAt: string
  status: 'Open' | 'Dispatched' | 'Resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedVehicle?: string
  wasteEstimatedKg: number
}

export interface EnvironmentalSensor {
  id: string
  name: string
  district: ZoneName
  coordinates: [number, number]
  pm25: number // µg/m³
  pm10: number // µg/m³
  h2sPpm: number // Hydrogen sulfide in ppm (odor)
  odorUnitsM3: number // Olfactometry Odor Units/m³
  soundDba: number // Noise decibels
  status: 'optimal' | 'moderate' | 'exceeded'
  lastReading: string
}

export interface MarineTrashBoom {
  id: string
  name: string
  location: string
  coordinates: [number, number]
  type: 'Floating Boom' | 'Seabin Skimmer' | 'Outfall Deflector'
  weeklyInterceptedKg: number
  annualPlasticsDivertedTons: number
  operationalStatus: 'Active' | 'Servicing Required' | 'Full Capacity'
  waterBody: 'San Francisco Bay' | 'Mission Creek' | 'Pacific Ocean' | 'Islais Creek'
  sensorBatteryPercent: number
}

export interface CircularInfrastructureHub {
  id: string
  name: string
  category: 'Materials Recovery (MRF)' | 'Hazardous Waste (HHW)' | 'Creative Re-Use' | 'Architectural Salvage' | 'Food Rescue' | 'E-Waste & Textiles'
  address: string
  district?: string
  coordinates: [number, number]
  annualThroughputTons: number
  description: string
  acceptedMaterials: string[]
  publicDropOff: boolean
}

export type ContinentName = 'All' | 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Middle East' | 'Americas'

export interface GlobalHub {
  id: string
  name?: string
  city: string
  country: string
  countryCode?: string
  flag: string
  continent: 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania' | 'Middle East' | 'Americas'
  centerCoords?: [number, number]
  coordinates?: [number, number]
  zoom?: number
  description: string
  segregationRate: number
  diversionRate: number
  population: string | number
  dailyTons?: number
  dailyWasteTons?: number
  perCapitaKgDay?: number
  policyHighlights?: string[]
  standoutPolicies?: string[]
  primaryTech?: string
  keyTechnology?: string
  facilitiesCount?: number
  circularInitiative?: string
  leadAgency?: string
  emissionsSavedTonsYear?: number
  metricsBreakdown?: {
    organicsCompostedPct: number
    dryRecycledPct: number
    wasteToEnergyPct: number
    landfillResidualPct: number
  }
}

export interface ZoneData {
  name: ZoneName
  service: string
  score: number
  state: 'attention' | 'healthy' | 'critical'
  population: number
  dailyTons: number
  segregationRate: number
  contaminationRate: number
  activeVehicles: number
  primaryIssue?: string
  centerCoordinates: [number, number]
  polygonCoordinates: [number, number][]
}

export interface WasteStreamCategory {
  label: string
  tonnage: number
  percentage: number
  color: string
  trend: 'up' | 'down' | 'steady'
  complianceRate: number
}

export interface AIVisionSample {
  id: string
  title: string
  category: 'Clean Segregated' | 'Contaminated Plastic' | 'Hazardous Mixed' | 'Inert Construction Debris'
  image: string
  targetStream: 'Dry Recyclables' | 'Wet Organics' | 'Hazardous' | 'Landfill Inerts'
  detectedItems: Array<{
    name: string
    confidence: number
    isContaminant: boolean
    color: string
  }>
  contaminationScore: number
  aiVerdict: 'PASS - Pure Stream' | 'FLAG - Contamination Alert' | 'CRITICAL - Hazardous Violation'
  actionRecommendation: string
}

export interface FacilityLine {
  id: string
  name: string
  type: string
  status: 'Operational' | 'Maintenance' | 'Reduced Capacity'
  efficiency: number
  hourlyThroughput: string
}

export interface RecyclingFacility {
  id: string
  name: string
  type: 'Material Recovery Facility (MRF)' | 'Industrial Composting' | 'Plastics Sorting Plant' | 'Waste-to-Energy'
  location: string
  dailyIntake: number
  ratedCapacity: number
  purityYield: number
  operatingMode: 'High Throughput' | 'Standard Sort' | 'Deep Purity' | 'Maintenance'
  lines: FacilityLine[]
  baledInventory: Array<{
    material: string
    tons: number
    valuePerTon: number
  }>
  coordinates: [number, number]
}

export interface LandfillTelemetry {
  siteName: string
  totalCapacityTons: number
  currentFillTons: number
  fillPercentage: number
  baselineRunwayDays: number
  compactionDensityKgM3: number
  methaneLevelPpm: number
  methaneThresholdPpm: number
  leachatePondCapacityPercent: number
  odourIndex: number
  dailyIntakeTons: number
  coordinates: [number, number]
  dangerRadiusMeters: number
}

export interface FleetVehicle {
  id: string
  crewLeader: string
  zone: ZoneName
  type: 'EV Compactor' | 'Side Loader' | 'Organic Dumper' | 'Hazardous Transport'
  status: 'On route' | 'Attention' | 'Unloading' | 'Depot Reserve'
  progress: number
  currentLoadTons: number
  maxCapacityTons: number
  batteryFuel: number
  dwellTimeMinutes: number
  lastCheckIn: string
  nextStop: string
  coordinates: [number, number]
  speedKmh: number
  headingDeg: number
  routePath?: [number, number][]
}

export interface SmartBinSensor {
  id: string
  code: string
  ward: ZoneName
  locationName: string
  fillPercent: number
  temperatureC: number
  batteryPercent: number
  lastEmptied: string
  status: 'Normal' | 'Approaching' | 'Overflow' | 'FireAlert'
  coordinates: [number, number]
  wasteType: 'Wet Organics' | 'Dry Recyclables' | 'General Waste'
}

export interface CitizenReward {
  id: string
  title: string
  creditsCost: number
  category: 'Tax Rebate' | 'Public Transit' | 'Compost Bag' | 'EV Charging'
  description: string
  code: string
}

export interface CitizenTransaction {
  id: string
  date: string
  bagBarcode: string
  ward: ZoneName
  stream: 'Organics' | 'Recyclables'
  purityGrade: 'Grade A (100% pure)' | 'Grade B (Minor residue)' | 'Rejected (Contaminated)'
  creditsEarned: number
}

export interface CitizenProfile {
  name: string
  rwaName: string
  ward: ZoneName
  creditsBalance: number
  lifetimeDivertedKg: number
  co2SavedKg: number
  rankTitle: string
  recentScans: CitizenTransaction[]
}

export interface QueueItem {
  id: string
  time: string
  title: string
  detail: string
  severity: 'high' | 'medium' | 'resolved'
  zone: ZoneName
  assignedVehicle?: string
  status: 'Pending' | 'In Progress' | 'Resolved'
  recommendation?: string
}

export interface SystemNotification {
  id: string
  timestamp: string
  title: string
  description: string
  type: 'alert' | 'info' | 'success'
  read: boolean
  actionUrl?: string
}

export interface ShiftReport {
  id: string
  date: string
  shift: 'Morning (06:00 - 14:00)' | 'Evening (14:00 - 22:00)'
  totalCollectedTons: number
  diversionPercentage: number
  landfillDepositTons: number
  activeTrucksCount: number
  incidentsResolved: number
  co2SavedTons: number
  operatingCostEstimate: number
}
